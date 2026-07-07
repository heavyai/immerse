// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import moment from "moment"
import * as BarChartFilterActions from "charts/bar-chart/bar-filter-action-creators"
import * as LineChartActions from "charts/line/line-chart-action-creators"
import * as Line2FilterActions from "charts/combo/line-chart2/line2-filter-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import {
  getXAxisDimension,
  isChartMultiSource
} from "reducers/charts/helpers/multi-source-helpers"
import { dcAdapterForChartId } from "utils/chart-adapter-mappings"
import { doRedrawAll } from "vega/actions/filter-action-creators"
import { getTablesForDataSource } from "components/join-manager/utils"

function layerFilterKey(layerSpec) {
  if (
    layerSpec.dimensions.length &&
    layerSpec.dimensions[0].value &&
    layerSpec.geoJoin.column
  ) {
    return "key0"
  } else {
    return "rowid"
  }
}

// there's only one chart with a range chart - combo.
// but we can easily set the rangeFilter for it, at least.
export function setRangeChartFilters(chartId, filters = []) {
  return async (dispatch, getState) => {
    const chart = getState().charts[chartId]
    // only combo has a range filter
    if (chart.type === "line2") {
      await dispatch(updateChart(chartId, { rangeFilter: [] }))
      await dispatch(updateChart(chartId, { rangeFilter: filters }))
    } else if (chart.type === "histogram") {
      await dispatch(LineChartActions.clearFilters(chartId))
      await dispatch(updateChart(chartId, { rangeFilter: filters }))
    }
  }
}

// comparable to convertDateStringsToDateObjects/replaceValuesIfTimeStamp/replaceValuesIfDateFilter
// but, well. Yuck.
//
// this is the fix, doing the surgical strike on setChartFilters to turn date strings back into
// date objects, but we may want to add magic like this to the omnifilters themselves to ensure that all strings
// of dates turn back into date objects, but that's a bigger fix than I want to do right before a code freeze.

function promoteFiltersToDateObjects(val) {
  if (Array.isArray(val)) {
    return val.map((v) => promoteFiltersToDateObjects(v))
  } else if (moment(val, [moment.ISO_8601, "YYYY-MM-DD"], true).isValid()) {
    return new Date(val)
  } else {
    return val
  }
}

// this is why we can't have nice things. But *this* action is freaking magical.
// given a chart ID and a set of filters, will apply the filters to the chart (saving them for later)
// AND apply them in crossfilter (updating other charts) AND redraw everything AND it'll handle the
// weird special cases. AND it's yet another baloney cascade of special cases.

export function setChartFilters(
  chartId,
  filters = [],
  areFiltersInverse = false
) {
  const promotedFilters = promoteFiltersToDateObjects(filters)
  filters = promotedFilters

  return async (dispatch, getState, services) => {
    const chart = getState().charts[chartId]

    if (chart === undefined) {
      return
    }

    if (filters.length === 0 && chart.rangeFilter && chart.rangeFilter.length) {
      await dispatch(setRangeChartFilters(chartId))
    }

    const dcChart = services.get("dc").getChart(chart.dcFlag)
    // okay, we need to handle stacked bar and combo, which pretend to be dc charts via adapters
    // but neither of them fully implement or expose everything necessary to truly masquerade as
    // heavyai-charting charts. Fortunately, we can look deeply enough to find what we need.
    if (chart.type === "bar") {
      // bars are easy. Remove all of the chart's current filters
      for (const filter of chart.filters) {
        await dispatch(
          BarChartFilterActions.removeBarChartFilter(chartId, filter)
        )
      }
      // and then add in the new ones. Nothing to it.
      for (const filter of filters) {
        await dispatch(BarChartFilterActions.addBarChartFilter(chartId, filter))
      }
    } else if (chart.type === "line2") {
      // combos are more of a hassle. We need to explicitly handle a few steps -
      // wipe out the combo filters on the chart and the dcadapter (and it must be done
      // first and in that order), then if we have new filters add them to the chart
      // and the adapter.
      const dcAdapter = dcAdapterForChartId(chartId)
      const xDim = getXAxisDimension(chart.dimensions)
      await dispatch(Line2FilterActions.clearComboChartFilterExtent(chartId))
      dcAdapter.filter([], xDim.timeBin, xDim.extract)
      if (filters.length) {
        await dispatch(
          Line2FilterActions.setComboChartFilterExtent(chartId, filters[0])
        )
        await dcAdapter.filter(filters[0], xDim.timeBin, xDim.extract)
      }
    } else if (dcChart) {
      if (dcChart.clearLayerFilters) {
        await dcChart.clearLayerFilters()
      }

      // Patch in a custom resetFilterHandler for a sec to clear out all the current filters
      // and replace them with the updated set. Doing this in one step prevents
      // async side effects from the intermediate cleared filter state from landing after
      // we set the new filters.
      const resetFilterHandler = dcChart.resetFilterHandler()

      dcChart.resetFilterHandler(() => {
        resetFilterHandler()
        return filters
      })

      await dcChart.filterAll()

      dcChart.resetFilterHandler(resetFilterHandler)

      dcChart.filtersInverse(areFiltersInverse)

      // This'll be fun. Okay, here's what we need to do - for layered charts we need to iterate over our layers
      // and break apart the filters into poly or choropleth filters, and then apply them to
      // only the layers that match.
      if (chart.layers && dcChart.getLayers && dcChart.getLayers()) {
        const dcLayers = dcChart.getLayers()
        const polyFilters = filters.filter((f) => typeof f === "object")
        const choroplethFilters = filters.filter(
          (f) => !polyFilters.includes(f)
        )
        for (const [i, layer] of Object.entries(chart.layers)) {
          const layerFilters =
            layer.type === "choropleth" || layer.type === "backendChoropleth"
              ? choroplethFilters
              : polyFilters

          for (const filter of layerFilters) {
            await dcLayers[i].filter(
              filter,
              false,
              layerFilterKey(chart.layers[i])
            )
          }
        }
      }

      // and finally, redraw the chart's group
      await dcChart.redrawGroup()
    }

    const dataSources = new Set()
    if (isChartMultiSource(chart)) {
      for (const idx of Object.keys(chart.multiSources)) {
        dataSources.add(chart.multiSources[idx].table)
      }
    } else {
      dataSources.add(chart.dataSource)
    }
    const tables = Array.from(dataSources).map(getTablesForDataSource).flat()

    // need to force a re-draw for when cross-linked filters are enabled/disabled
    doRedrawAll(dispatch, getState, tables, { onlyLinked: true })
  }
}
