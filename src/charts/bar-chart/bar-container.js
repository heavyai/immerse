// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  addChartFilter,
  removeChartFilter,
  clearChartFilterString,
  destroyChart,
  fetchData,
  setAutoBin,
  setBinning,
  setChartFilterString,
  setXAxisDomain,
  setXAxisLabel,
  setYAxisDomain,
  setYAxisLabel,
  toggleXDomainLock,
  toggleYDomainLock
} from "./bar-action-creators"
import { getLabel, getLockedDomain } from "./utils"
import {
  CHARTS_DEFAULT_OTHER_ALIASES,
  Y_AXIS_ORIENTATIONS
} from "constants/charts"
import {
  UI_CONFIG_AXIS_TICK_LABEL,
  STYLE_PROPERTY_FONT_SIZE
} from "components/ui-config-panel/constants"
import { connect } from "react-redux"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"
import BarComponent from "./bar-component"
import { append, any, pick, path } from "ramda"

import { makeGetParameterValuesForChart } from "components/parameters/selectors"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

function translateSortColumn(sortColumnObj) {
  let sortString = null

  if (typeof sortColumnObj === "object") {
    const name = path(["col", "name"], sortColumnObj)
    const order = path(["order"], sortColumnObj)

    if (name === "val" && order === "asc") {
      sortString = "totalAscending"
    } else if (name === "val" && order === "desc") {
      sortString = "totalDescending"
    } else if (name === "countval" && order === "asc") {
      sortString = "countvalAscending"
    } else if (name === "countval" && order === "desc") {
      sortString = "countvalDescending"
    } else if (name === "key0" && order === "asc") {
      sortString = "alphaAscending"
    } else if (name === "key0" && order === "desc") {
      sortString = "alphaDescending"
    } else {
      sortString = "totalAscending"
    }
  }

  return sortString
}

export function mapStateToProps(state, { id }) {
  const chartState = state.charts[id]
  const dim = chartState.dimensions[0]
  const translateType = {
    SMALLINT: "number",
    DECIMAL: "number",
    INT: "number",
    FLOAT: "number",
    TIMESTAMP: "time",
    DATE: "time",
    STR: "string"
  }
  const keyType =
    translateType[dim.type] === "time" && dim.extract
      ? "number"
      : translateType[dim.type] // [SCAFFOLDING]: FIX ME
  const measures = chartState.measures.filter((e) => e.value) // remove placeholder measures
  const hasMultipleMeasures = measures.filter((d) => d.label).length > 1
  const yMeasures = measures.filter(
    (d) => d.yAxisOrientation !== Y_AXIS_ORIENTATIONS.RIGHT
  ) // [SCAFFOLDING]: FIX ME
  const yLabel = yMeasures.map(getLabel).join(", ")
  const dimensions = chartState.dimensions.filter((d) => d.value)
  const hasColorDimension = Boolean(chartState.dimensions[1].label)
  const hasOther = any((d) => d.key1 === CHARTS_DEFAULT_OTHER_ALIASES.other)(
    chartState.data || []
  )
  const palette = getColor(chartState, hasOther)

  let topN = path(["dimensions", 1, "topN"], chartState) || []
  if (hasColorDimension && chartState.showOther && topN.length) {
    topN = append(CHARTS_DEFAULT_OTHER_ALIASES.other, topN)
  }

  const measureFormats = measures
    .filter((d) => d.numberFormat)
    .map((d) => ({ key: d.label, format: d.numberFormat }))

  const dimensionFormats = dimensions
    .filter((d) => d.dateFormat)
    .map((d) => ({ key: d.label, format: d.dateFormat }))

  const userConfigurableUISettings = getUserConfigurableUISettings(state)

  const omnifilters = state.omnifilters.filter((f) => f.chartId === id)

  const last_streaming_request = state.dashboard.streaming.last_request

  return {
    id,
    data: chartState.data || [],
    isLoadingData: chartState.isLoadingData,
    filters: chartState.filters,
    omnifilters,
    last_streaming_request,
    dataSource: chartState.dataSource,
    userConfiguredAxisLength:
      userConfigurableUISettings.label.axisTruncationLength,
    userConfiguredAxisFontSize:
      userConfigurableUISettings.text[UI_CONFIG_AXIS_TICK_LABEL][
        STYLE_PROPERTY_FONT_SIZE
      ],
    querySpec: {
      dimensions: chartState.dimensions,
      measures: measures.map((measure) => pick(["value", "aggType"], measure)),
      dataSource: chartState.dataSource,
      filterString: chartState.filterString,
      showOther: chartState.showOther,
      sortColumn: chartState.sortColumn,
      showNullDimensions: chartState.showNullDimensions,
      numberGroups: chartState.cap,
      customColorAssignment: chartState.color.customDomain
    },
    configSpec: {
      palette,
      topN,
      xAxisLabel: dim.axisLabel || dim.label,
      yAxisLabel: yLabel,
      timeBin: dim.timeBin,
      autoBin: dim.timeBin === "auto",
      extract: dim.extract,
      binExtent: [dim.currentLowValue, dim.currentHighValue],
      keyType,
      legendTitle: chartState.dimensions[1].label
        ? process(chartState.dimensions[1].label, { useDisplayName: true })
        : "",
      legendIsEnabled: hasColorDimension || hasMultipleMeasures,
      yDomain: getLockedDomain(yMeasures),
      percentageViewEnabled: chartState.percentageViewEnabled,
      xLock: !chartState.elasticX,
      yLock: !chartState.elasticY,
      measures: measures.map((measure) =>
        pick(["axisLabel", "label", "aggType", "yAxisOrientation"], measure)
      ),
      dimensions: dimensions.map(pick(["label"])),
      hasLeftAxis: Boolean(yMeasures.length) || hasColorDimension,
      sortBy: translateSortColumn(chartState.sortColumn),
      measureFormats,
      dimensionFormats
    },
    parameterValues: makeGetParameterValuesForChart(state)(id)
  }
}

// [SCAFFOLDING]: review this
function getColor(chartState, hasOther) {
  const colorRange = chartState.color.customRange
  const colorDomain = chartState.color.customDomain
  const otherDomain = chartState.color.defaultOtherDomain
  const otherRange = chartState.color.defaultOtherRange
  let color = []
  const styles = chartState.color.lineStyles || chartState.color.lineStyle
  if (colorRange) {
    color = colorRange.map((d, i) => ({
      key: colorDomain[i],
      id: i,
      value: d,
      style: Array.isArray(styles) && styles[i] ? styles[i] : "solid"
    }))
    // add "other" color
    if (otherDomain && hasOther) {
      color.push({
        key: CHARTS_DEFAULT_OTHER_ALIASES.other,
        id: color.length,
        value: otherRange,
        style: "solid" // to do set style of "other" domain
      })
    }
  } else {
    color = [
      {
        key: 0, // hardcoded data key for single line
        id: 0,
        value: chartState.color.val,
        style: [].concat(styles) || ["solid"]
      }
    ]
  }
  return chartState.color.reverse ? color.slice().reverse() : color
}

export const mapDispatchToProps = {
  fetchData,
  addChartFilter, // needs id
  removeChartFilter, // needs id
  setFilterString: setChartFilterString, // needs id
  clearChartFilterString, // needs id
  destroyChart, // needs id
  setXAxisLabel, // needs id
  setYAxisLabel, // needs id
  setBinning, // needs id
  setAutoBin, // needs id
  setXAxisDomain, // needs id
  setYAxisDomain, // needs id
  toggleXDomainLock, // needs id
  toggleYDomainLock // needs id
}

export default connect(mapStateToProps, mapDispatchToProps)(BarComponent)
