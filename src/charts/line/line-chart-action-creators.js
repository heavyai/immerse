// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mergeR } from "utils/ramda-helpers"
import { SERIES_ENCODING_INDEX } from "./line-chart-constants"

export const CREATE_LINE_CHART = "CREATE_LINE_CHART"
export const UPDATE_LINE_CHART = "UPDATE_LINE_CHART"
export const UPDATE_LINE_CHART_COLOR_PALETTE = "UPDATE_LINE_CHART_COLOR_PALETTE"
export const SET_LINE_CHART_MEASURE = "SET_LINE_CHART_MEASURE"
export const SET_LINE_CHART_DIMENSION = "SET_LINE_CHART_DIMENSION"
export const SET_LINE_CHART_SERIES_DIMENSION = "SET_LINE_CHART_SERIES_DIMENSION"
export const ADD_LINE_CHART_MEASURE = "ADD_LINE_CHART_MEASURE"
export const ADD_LINE_CHART_DIMENSION = "ADD_LINE_CHART_DIMENSION"
export const UPDATE_LINE_CHART_MEASURE = "UPDATE_LINE_CHART_MEASURE"
export const UPDATE_LINE_CHART_DIMENSION = "UPDATE_LINE_CHART_DIMENSION"
export const REMOVE_LINE_CHART_MEASURE = "REMOVE_LINE_CHART_MEASURE"
export const REMOVE_LINE_CHART_DIMENSION = "REMOVE_LINE_CHART_DIMENSION"
export const UPDATE_MEASURES_DOMAINS = "UPDATE_MEASURES_DOMAINS"
export const UPDATE_LINE_SOLID_COLOR = "UPDATE_LINE_SOLID_COLOR"
export const TOGGLE_RANGE_CHART_ON = "TOGGLE_RANGE_CHART_ON"
export const TOGGLE_RANGE_CHART_OFF = "TOGGLE_RANGE_CHART_OFF"
export const UPDATE_EXTRACT_INTERVAL = "UPDATE_EXTRACT_INTERVAL"
export const UPDATE_DATETRUNC_INTERVAL = "UPDATE_DATETRUNC_INTERVAL"
export const UPDATE_LINE_MEASURE_AGGTYPE = "UPDATE_LINE_MEASURE_AGGTYPE"
export const DESTROY_LINE_CHART = "DESTROY_LINE_CHART"
export const UPDATE_BIN_EXTENT = "UPDATE_BIN_EXTENT"
export const UPDATE_NUM_BINS = "UPDATE_NUM_BINS"
export const RESET_LINE_CHART = "RESET_LINE_CHART"
export const CLEAR_LINE_CHART_FILTERS = "CLEAR_LINE_CHART_FILTERS"
export const SYNC_BIN_INTERVAL = "SYNC_BIN_INTERVAL"
export const TOGGLE_BINNING = "TOGGLE_BINNING"

export function toggleBinning(id) {
  return {
    type: TOGGLE_BINNING,
    id
  }
}

export function syncBinInterval(id, interval) {
  return {
    type: SYNC_BIN_INTERVAL,
    id,
    interval
  }
}

export function clearFilters(id) {
  return {
    type: CLEAR_LINE_CHART_FILTERS,
    id
  }
}

export function resetLineChart(id, spec) {
  return {
    type: RESET_LINE_CHART,
    id,
    spec
  }
}

export function updateNumBins(id, numBins) {
  return {
    type: UPDATE_NUM_BINS,
    id,
    numBins
  }
}

export function updateBinExtent(id, extent) {
  return {
    type: UPDATE_BIN_EXTENT,
    id,
    extent
  }
}

export function destroyLineChart(dcFlag, chartId) {
  return {
    type: DESTROY_LINE_CHART,
    chartId,
    dcFlag
  }
}

export function updateDateTruncInterval(id, interval) {
  return {
    type: UPDATE_DATETRUNC_INTERVAL,
    id,
    interval
  }
}

export function updateExtractInterval(id, interval) {
  return {
    type: UPDATE_EXTRACT_INTERVAL,
    id,
    interval
  }
}

export function toggleRangeChartOn(id) {
  return {
    type: TOGGLE_RANGE_CHART_ON,
    id
  }
}

export function toggleRangeChartOff(id) {
  return {
    type: TOGGLE_RANGE_CHART_OFF,
    id
  }
}

export function updateLineSolidColor(id, updates) {
  return {
    type: UPDATE_LINE_SOLID_COLOR,
    id,
    updates
  }
}

export function removeLineChartMeasure(id, index) {
  return {
    type: REMOVE_LINE_CHART_MEASURE,
    id,
    index
  }
}

export function removeLineChartDimension(id, index) {
  return {
    type: REMOVE_LINE_CHART_DIMENSION,
    id,
    index
  }
}

export function createLineChart(id, chartSpec) {
  return {
    type: CREATE_LINE_CHART,
    id,
    chartSpec
  }
}

export function updateLineChart(id, updates) {
  return {
    type: UPDATE_LINE_CHART,
    id,
    updates
  }
}

export function setLineChartMeasure(id, selector, index) {
  return {
    type: SET_LINE_CHART_MEASURE,
    id,
    index,
    selector
  }
}

export function setLineChartDimension(id, selector, index) {
  return {
    type: SET_LINE_CHART_DIMENSION,
    id,
    index,
    selector
  }
}

export function addMeasure({ index, id, selector }) {
  return {
    type: ADD_LINE_CHART_MEASURE,
    index,
    id,
    measure: Object.assign({}, selector, {
      loading: true
    })
  }
}

export function addDimension({ index, id, selector, loading }) {
  return {
    type: ADD_LINE_CHART_DIMENSION,
    index,
    id,
    dimension: Object.assign({}, selector, {
      loading: typeof loading === "undefined" ? true : loading
    })
  }
}

export function updateMeasure({ id, index, setter, ...updates }) {
  return {
    type: UPDATE_LINE_CHART_MEASURE,
    id,
    index,
    setter:
      setter ||
      mergeR({
        ...updates
      })
  }
}

export function updateDimension({ id, index, setter, ...updates }) {
  return {
    type: UPDATE_LINE_CHART_DIMENSION,
    id,
    index,
    setter:
      setter ||
      mergeR({
        ...updates
      })
  }
}

export function setLineChartSeriesDimension(id, selector) {
  return {
    type: SET_LINE_CHART_SERIES_DIMENSION,
    index: SERIES_ENCODING_INDEX,
    id,
    selector
  }
}

export function updateLineMeasureAggType(id, aggType) {
  return {
    type: UPDATE_LINE_MEASURE_AGGTYPE,
    id,
    aggType
  }
}

export function xAxisDomainDimensionUpdate(chartId, domain) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId]
    const xDim = chart.dimensions[0]
    const extent = domain ? domain : [xDim.min_val, xDim.max_val]

    dispatch({
      type: "UPDATE_SELECTOR",
      chartId,
      selectorType: "dimensions",
      selectorIndex: 0,
      setter: mergeR({
        currentHighValue: extent[1],
        currentLowValue: extent[0]
      })
    })
    if (xDim.isBinned) {
      dispatch(updateBinExtent(chartId, extent))
    }
  }
}
