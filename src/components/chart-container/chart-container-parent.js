// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import ChartContainer from "./chart-container"
import compose from "recompose/compose"
import { connect } from "react-redux"
import connectToMapDServices from "utils/connect-to-mapd-services"
import { dissoc } from "ramda"
import filter from "ramda/src/filter"
import { onEditPath } from "utils/routerPath"
import { selectChartComponent } from "charts/components/registered-components"
import { updateSagaChart } from "actions/charts-action-creators"
import { isVegaChart } from "constants/charts"
import {
  vegaChartHasError,
  vegaChartSelectorsEmpty,
  vegaChartSelectorsLoading
} from "vega/utils/data-selection"
import { makeGetParameterValuesForChart } from "components/parameters/selectors"
import { getChartAddonOfType } from "chart-addons/chart-addon-registry"

const isSelectorUsable = (selector) =>
  selector.value && !selector.isError && !selector.inactive && !selector.loading

function selectChartStateForDCChart(chart) {
  return Object.assign({}, chart, {
    measures: filter(isSelectorUsable, chart.measures),
    dimensions: filter(isSelectorUsable, chart.dimensions)
  })
}

const removeStateFromDCChart = compose(
  dissoc("loading"),
  dissoc("hasError"),
  dissoc("dataError"),
  dissoc("dcFlag")
)

const areSelectorsLoading = (chart) =>
  chart.dimensions.concat(chart.measures).some((selector) => selector.loading)

function addGeoMetaIfChoropleth(geoJsonConfig) {
  return (chart) =>
    chart.type === "choropleth"
      ? Object.assign({}, chart, { geoJsonConfig })
      : chart
}

function hasDCError(cid, { render, redraw }) {
  return (
    (redraw.error && redraw.id === cid) || (render.error && render.id === cid)
  )
}

function requiredAttributes(chartSpec) {
  switch (chartSpec.type) {
    case "choropleth":
      return Boolean(chartSpec.geoJson)
    case "backendChoropleth":
      return true
    default:
      return true
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    updateChart(id, update) {
      dispatch(updateSagaChart(id, update))
    }
  }
}

export function mapStateToProps(state, props) {
  const {
    chartEditor,
    connection,
    router,
    dc,
    dashboard: { id: dashboardId, selectedTabId: tabId }
  } = state
  const { cid, MapD, chart } = props
  const {
    location: { pathname }
  } = router

  const chartSpec = compose(
    addGeoMetaIfChoropleth(connection.geoJsonConfig),
    removeStateFromDCChart,
    selectChartStateForDCChart
  )(chart)

  // Vega integration - This branches several properties that control whether the
  // chart 'error message' should show (which could just be showing that you're
  // still missing some required selectors, not really an error)
  const vega = isVegaChart(chart.type)
  // Whether the chart has any 'error' in the data selection that means
  // it can't yet render - could be invalid selectors or just ones that
  // are empty and haven't yet been chosen
  const hasError = vega
    ? vegaChartHasError(chart)
    : Boolean(
        chart.hasError ||
          chart.dataError ||
          (hasDCError(cid, dc) && onEditPath(pathname))
      )
  // Whether no selectors at all are chosen (hasError can be false here)
  const areSelectorsEmpty = vega
    ? vegaChartSelectorsEmpty(chart)
    : chartSpec.dimensions.length + chartSpec.measures.length === 0

  let addon = undefined
  if (chart.addon) {
    const addonObj = state.chartAddons[chart.addon]
    const addonType = getChartAddonOfType(addonObj.type)

    addon = { addon: addonObj, addonType, id: chart.addon }
  }

  return {
    dcFlag: chart.dcFlag,
    // Vega integration
    areSelectorsLoading: vega
      ? vegaChartSelectorsLoading(chart)
      : areSelectorsLoading(chart),
    hasError,
    errorType: typeof chart.hasError === "string" ? chart.hasError : "",
    // Vega has its own GD error handling. Hngh.
    dataError: !vega && chart.dataError,
    chartSpec,
    baseCrossfilter: MapD.get("crossfilter"),
    crossfilter:
      chart.dataSource &&
      MapD.get("crossfilter").getCrossfilter(chart.dataSource, cid),
    loading: chart.loading,
    ChartComponent: selectChartComponent(chart.type),
    allChartsInitialized: dc.initialRender.done,
    areSelectorsEmpty,
    requiredAttributes: requiredAttributes(chartSpec),
    quickFilterNotchVisible: props.quickFilterNotchVisible,
    dashboardId,
    tabId,
    isEditingChart: chartEditor.editing,
    parameterValues: makeGetParameterValuesForChart(state)(cid),
    addon
  }
}

export default compose(
  connectToMapDServices,
  connect(mapStateToProps, mapDispatchToProps)
)(ChartContainer)
