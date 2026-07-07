// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import { debounce, isEqual, throttle } from "lodash"
import { shallowEqualArrays } from "shallow-equal"

import store from "store/store"
import ForwardSelect from "vega/utils/forward-select"
import { fetch3dData, updateViewState } from "vega/actions/deckgl-data-thunks"
import { updateChart } from "actions/update-chart-action-creator"
import { ChartState } from "reducers/charts/charts-reducer-types"
import { isChartMultiSource } from "reducers/charts/helpers/multi-source-helpers"
import { getFiltersAppliedToChart } from "vega/constants/filter-metadata-types"
import { buildCrossLinkFilters } from "utils/crosslink-utils"
import { currentBasemapValue } from "charts/raster-chart/basemap"
import { deckgl3dChartToQuerySpecs } from "./query-spec"
import { buildVisualSpecs } from "./visual-spec"
import DataEventTarget from "./data-event-target"
import DeckGLChartComponent from "./deckgl-chart-component"

const UPDATE_VIEWSTATE_DEBOUNCE = 2000
const CROSSFILTER_THROTTLE = 500
const INITIAL_VIEW_STATE = {
  latitude: 0,
  longitude: 0,
  zoom: 1,
  bearing: 0,
  pitch: 30
}

type Props = {
  dashboardId: string
  tabId: string
  id: string
  chart: ChartState
  width: number
  height: number
}

type PrevQuerySpecs = ReturnType<typeof deckgl3dChartToQuerySpecs>
type PrevVisuaSpecs = ReturnType<typeof buildVisualSpecs>

type PrevFetch = {
  querySpecs: PrevQuerySpecs
  lastRequest?: any
  lastCrosslink?: any
}

export const mapStateToProps = () => {
  const prevFetch: PrevFetch = { querySpecs: [] }
  let prevQuerySpecs: PrevQuerySpecs | undefined = undefined
  let prevVisualSpecs: PrevVisuaSpecs | undefined = undefined
  let initialViewState: object | null = null
  let abortController = new AbortController()
  const dataNotifier = new DataEventTarget()
  const selectors = new ForwardSelect<any, Props>()

  const dashboardIdSelector = selectors.createSelector(
    "dashboardId",
    (_, { dashboardId }) => dashboardId
  )
  const tabIdSelector = selectors.createSelector(
    "tabId",
    (_, { tabId }) => tabId
  )
  const idSelector = selectors.createSelector("id", (_, { id }) => id)
  const chartSelector = selectors.createSelector(
    "chart",
    (_, { chart }) => chart
  )
  const widthSelector = selectors.createSelector(
    "width",
    (_, { chart, width }) => (width ? width : chart.width)
  )
  const heightSelector = selectors.createSelector(
    "height",
    (_, { chart, height }) => (height ? height : chart.height)
  )
  const omnifiltersSelector = selectors.createSelector(
    "omnifilters",
    ({ omnifilters }) => omnifilters
  )
  const crossLinksSelector = selectors.createSelector(
    "crossLinks",
    ({ crossLinks }) => crossLinks
  )
  const crossfilterTokensSelector = selectors.createSelector(
    "crossfilterTokens",
    ({ parameters: { crossfilterTokens } }, { tabId }) =>
      crossfilterTokens?.[tabId] || []
  )
  const lastStreamingDataRequestSelector = selectors.createSelector(
    "lastStreamingDataRequest",
    ({
      dashboard: {
        streaming: { last_request }
      }
    }) => last_request
  )

  const basemapSelector = selectors.createSelector(
    "basemap",
    chartSelector,
    currentBasemapValue
  )

  const dataSourcesSelector = selectors.createSelector(
    "dataSources",
    chartSelector,
    (chart) =>
      isChartMultiSource(chart)
        ? Object.values(chart.multiSources).map(({ table }) => table)
        : [chart.dataSource],
    { equal: shallowEqualArrays }
  )

  const filtersSelector = selectors.createSelector(
    "filters",
    idSelector,
    dataSourcesSelector,
    omnifiltersSelector,
    (id, dataSources, omnifilters) =>
      getFiltersAppliedToChart(id, dataSources, omnifilters, true),
    { equal: shallowEqualArrays }
  )

  const crossLinkFiltersSelector = selectors.createSelector(
    "crossLinkFilters",
    idSelector,
    dataSourcesSelector,
    omnifiltersSelector,
    crossLinksSelector,
    // omnifilters and crosslinks are only here to force updates on change
    (id, dataSources, _omnifilters, _crossLinks) =>
      dataSources.flatMap((ds) => {
        if (ds) {
          return buildCrossLinkFilters(id, [ds])
        }
        return []
      }),
    { equal: isEqual }
  )

  const crossfilterTokenDataSourcesSelector = selectors.createSelector(
    "crossfilterTokenDataSources",
    idSelector,
    dataSourcesSelector,
    crossfilterTokensSelector,
    (id, ourDataSources, crossfilterTokens) => {
      const dataSources = new Set(
        crossfilterTokens.filter((r) => r.chartId === id).map((r) => r.table)
      )
      ourDataSources.forEach((ds) => dataSources.delete(ds))
      return Array.from(dataSources) as string[]
    },
    { equal: shallowEqualArrays }
  )

  const crossfilterTokenFiltersSelector = selectors.createSelector(
    "crossfilterTokenFilters",
    crossfilterTokenDataSourcesSelector,
    omnifiltersSelector,
    (dataSources, omnifilters) =>
      getFiltersAppliedToChart("fakeid", dataSources, omnifilters),
    { equal: shallowEqualArrays }
  )

  const appliedFiltersSelector = selectors.createSelector(
    "appliedFilters",
    filtersSelector,
    crossLinkFiltersSelector,
    (filters, crossLinkFilters) => [...filters, ...crossLinkFilters]
  )

  const querySpecsSelector = selectors.createSelector(
    "querySpecs",
    chartSelector,
    appliedFiltersSelector,
    (chart, appliedFilters) => {
      const querySpecs = deckgl3dChartToQuerySpecs(
        chart,
        appliedFilters,
        prevQuerySpecs
      )
      prevQuerySpecs = querySpecs
      return querySpecs
    },
    { equal: shallowEqualArrays }
  )

  // throttle without a "wait" time is essentially the same as setTimeout(func,
  // 0) - we need this to avoid a react warning about trying to render a
  // component from another component
  //
  // The _lastRequest parameter is updated anytime the user refreshes the
  // dashboard (manually or automatically). The param isn't used for anything,
  // but causes the selector to run when it changes.
  //
  // Likewise, crossfilterTokenFiltersSelector updates if any tables are linked
  // via crossfilter tokens, but isn't used - just forces a refresh.
  selectors.createSelector(
    "fetchData",
    dashboardIdSelector,
    idSelector,
    querySpecsSelector,
    lastStreamingDataRequestSelector,
    crossfilterTokenFiltersSelector,
    throttle((dashboardId, id, querySpecs, lastRequest, lastCrosslink) => {
      // figure out which layers need to reload
      const force =
        lastRequest !== prevFetch.lastRequest ||
        lastCrosslink !== prevFetch.lastCrosslink
      const changedSpecs = querySpecs.map(
        (spec, i) => force || spec !== prevFetch.querySpecs[i]
      )
      prevFetch.querySpecs.length = querySpecs.length
      prevFetch.lastRequest = lastRequest
      prevFetch.lastCrosslink = lastCrosslink

      // abort previous fetch (if it hasn't already finished)
      abortController.abort()
      abortController = new AbortController()

      // start fetch
      const promises = fetch3dData(
        dashboardId,
        id,
        querySpecs,
        changedSpecs,
        dataNotifier,
        abortController.signal
      )
      promises.forEach((promise, idx) =>
        promise.then((finished) => {
          if (finished) {
            // since this layer finished successfully, record it
            prevFetch.querySpecs[idx] = querySpecs[idx]
          }
        })
      )

      return Promise.all(promises)
    })
  )

  // updating the initial view state can be heavily delayed because it only
  // matters when loading the dashboard... delaying improves performance.
  const updateInitialViewState = debounce(
    ({ latitude, longitude, zoom, bearing, pitch, altitude }) => {
      store.dispatch(
        updateChart(idSelector(), {
          deckglViewState: {
            latitude,
            longitude,
            zoom,
            bearing,
            pitch,
            altitude
          }
        })
      )
    },
    UPDATE_VIEWSTATE_DEBOUNCE
  )

  const onViewStateChange = throttle(({ viewState }) => {
    updateInitialViewState(viewState)
    store.dispatch(
      updateViewState(
        tabIdSelector(),
        idSelector(),
        querySpecsSelector(),
        viewState
      )
    )
  }, CROSSFILTER_THROTTLE)

  const visualSpecsSelector = selectors.createSelector(
    "visualSpecs",
    chartSelector,
    (chart) => {
      const visualSpecs = buildVisualSpecs(chart, prevVisualSpecs)
      prevVisualSpecs = visualSpecs
      return visualSpecs
    },
    { equal: shallowEqualArrays }
  )

  return (state, props: Props) => {
    if (initialViewState === null) {
      // this is only set once
      initialViewState = props.chart.deckglViewState || INITIAL_VIEW_STATE
    }

    selectors.recalculate(state, props)
    return {
      basemap: basemapSelector(),
      visualSpecs: visualSpecsSelector(),
      dataNotifier,
      initialViewState,
      onViewStateChange,
      width: widthSelector(),
      height: heightSelector()
    }
  }
}

export function mergeProps(stateProps) {
  return stateProps
}

export const options = {
  pure: true,
  areStatesEqual: (next, prev) =>
    next.omnifilters === prev.omnifilters &&
    next.dashboard.streaming.last_request ===
      prev.dashboard.streaming.last_request
}

export default connect(
  mapStateToProps,
  undefined,
  mergeProps,
  options
)(DeckGLChartComponent)
