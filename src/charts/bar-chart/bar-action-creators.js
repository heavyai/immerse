// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as SelectorActions from "actions/selector-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import { addCustomColorDomain } from "actions/charts-color-action-creators"
import {
  addBarChartFilter,
  removeBarChartFilter
} from "./bar-filter-action-creators"
import genSQL, { genTopKSQL } from "./sql-utils"
import { CHARTS_DEFAULT_OTHER_ALIASES } from "constants/charts"
import { getLabel } from "./utils"
import { setAppError } from "actions/app-action-creators"
import { createQueuedConnector } from "services/ConnectorWithQueue"

export const REQUEST_BAR_CHART_DATA = "REQUEST_BAR_CHART_DATA"
export const RECEIVE_BAR_CHART_DATA = "RECEIVE_BAR_CHART_DATA"
export const RECEIVE_BAR_CHART_DATA_ERROR = "RECEIVE_BAR_CHART_DATA_ERROR"
export const RECEIVE_ERROR = "RECEIVE_ERROR"
export const RESET_BAR_CHART_COLORS = "RESET_BAR_CHART_COLORS"
export const DESTROY_CHART = "DESTROY_CHART"
export const SET_BAR_CHART_X_AXIS_LABEL = "SET_BAR_CHART_X_AXIS_LABEL"
export const SET_BAR_CHART_Y_AXIS_LABEL = "SET_BAR_CHART_Y_AXIS_LABEL"
export const SET_BAR_CHART_BINNING = "SET_BAR_CHART_BINNING"
export const SET_BAR_CHART_AUTO_BIN = "SET_BAR_CHART_AUTO_BIN"
export const SET_BAR_CHART_X_AXIS_DOMAIN = "SET_BAR_CHART_X_AXIS_DOMAIN"
export const SET_BAR_CHART_Y_AXIS_DOMAIN = "SET_BAR_CHART_Y_AXIS_DOMAIN"
export const TOGGLE_BAR_CHART_X_DOMAIN_LOCK = "TOGGLE_BAR_CHART_X_DOMAIN_LOCK"
export const TOGGLE_BAR_CHART_Y_DOMAIN_LOCK = "TOGGLE_BAR_CHART_Y_DOMAIN_LOCK"
export const ENABLE_BAR_CHART_MEASURE = "ENABLE_BAR_CHART_MEASURE"
export const ENABLE_BAR_CHART_DIMENSION = "ENABLE_BAR_CHART_DIMENSION"
export const DISABLE_BAR_CHART_MEASURE = "DISABLE_BAR_CHART_MEASURE"
export const DISABLE_BAR_CHART_DIMENSION = "DISABLE_BAR_CHART_DIMENSION"
export const ADD_BAR_CHART_FILTER = "ADD_BAR_CHART_FILTER"
export const REMOVE_BAR_CHART_FILTER = "REMOVE_BAR_CHART_FILTER"

const DEFAULT_NUM_OF_LINES = 5 // [SCAFFOLDING]: Remove this? Used below in preFlight

export function destroyChart(id) {
  return {
    type: DESTROY_CHART,
    id
  }
}

export function setXAxisLabel(id, label) {
  return {
    type: SET_BAR_CHART_X_AXIS_LABEL,
    id,
    label
  }
}

export function setYAxisLabel(id, label) {
  return {
    type: SET_BAR_CHART_Y_AXIS_LABEL,
    id,
    label
  }
}

export function setBinning(id, bin) {
  return {
    type: SET_BAR_CHART_BINNING,
    id,
    bin
  }
}

export function setAutoBin(id, { isSelected }) {
  // TO DO: reducer
  return {
    type: SET_BAR_CHART_AUTO_BIN,
    id,
    isSelected
  }
}

export function setXAxisDomain(id, extent) {
  return {
    type: SET_BAR_CHART_X_AXIS_DOMAIN,
    id,
    extent
  }
}

export function setYAxisDomain(id, extent) {
  return {
    type: SET_BAR_CHART_Y_AXIS_DOMAIN,
    id,
    extent
  }
}

export function toggleXDomainLock(id, isLocked) {
  return {
    type: TOGGLE_BAR_CHART_X_DOMAIN_LOCK,
    id,
    isLocked
  }
}

export function toggleYDomainLock(id, isLocked, extent) {
  return {
    type: TOGGLE_BAR_CHART_Y_DOMAIN_LOCK,
    id,
    isLocked,
    extent
  }
}

export function requestData(id) {
  return {
    type: REQUEST_BAR_CHART_DATA,
    id
  }
}

export function receiveData(data, id) {
  return {
    type: RECEIVE_BAR_CHART_DATA,
    data,
    receivedAt: Date.now(),
    id
  }
}

// not currently used, is it necessary to have a separate error handler for stacked bar & line2?
export function receiveError(error, id) {
  return {
    type: RECEIVE_ERROR,
    error,
    receivedAt: Date.now(),
    id
  }
}

export function enableBarChartDimension(id, index) {
  return {
    type: ENABLE_BAR_CHART_DIMENSION,
    id,
    index
  }
}

export function disableBarChartDimension(id, index) {
  return {
    type: DISABLE_BAR_CHART_DIMENSION,
    id,
    index
  }
}

export function enableBarChartMeasure(id, index) {
  return {
    type: ENABLE_BAR_CHART_MEASURE,
    id,
    index
  }
}

export function disableBarChartMeasure(id, index) {
  return {
    type: DISABLE_BAR_CHART_MEASURE,
    id,
    index
  }
}

export function setChartFilterString(chartId, filterString) {
  return (dispatch) => {
    dispatch(updateChart(chartId, { filterString }))
  }
}

export function clearChartFilterString(chartId) {
  return (dispatch) => {
    dispatch(updateChart(chartId, { filterString: null, filters: [] }))
  }
}

export function addChartFilter(chartId, value) {
  return addBarChartFilter(chartId, value)
}

export function removeChartFilter(chartId, value) {
  return removeBarChartFilter(chartId, value)
}

export function resetColors(id) {
  return {
    type: RESET_BAR_CHART_COLORS,
    id
  }
}

function getTopN(querySpec, queuedConnector) {
  const query = genTopKSQL({ ...querySpec })

  return queuedConnector
    .queryAsync(query, {}, "genTopKSQL")
    .then((data) => data.map((o) => o.key0).slice(0, DEFAULT_NUM_OF_LINES))
}

function preFlight(querySpec, queuedConnector, colorGroupsShouldReset) {
  if (querySpec.dimensions[1].value) {
    if (
      !colorGroupsShouldReset &&
      querySpec.customColorAssignment &&
      querySpec.customColorAssignment.length
    ) {
      return Promise.resolve(querySpec.customColorAssignment)
    } else {
      return getTopN(querySpec, queuedConnector)
    }
  } else {
    return Promise.resolve(null)
  }
}

function colorSideEffects(id, topN, querySpec, configSpec, dispatch) {
  if (topN && topN.length) {
    dispatch(
      SelectorActions.updateSelectorAction(id, "dimensions", 1, (dim) => ({
        ...dim,
        topN
      }))
    )
    dispatch(
      addCustomColorDomain(id, querySpec.dimensions[1].value, topN, "other")
    )
  } else if (configSpec.measures.length > 0) {
    const measureNames = configSpec.measures.map(getLabel)
    dispatch(addCustomColorDomain(id, null, measureNames, "other"))
  } else {
    dispatch(resetColors(id))
  }
}

// Track fetchData requests in flight per chart, for async cancellation -
// format is { [chartId]: number }, where number is unique per request
const fetchesInFlight = {}

export function fetchData(querySpec, configSpec, id, colorGroupsShouldReset) {
  return (dispatch, _getState, services) => {
    const connector = services.get("DbCon")
    const dashboardId = _getState().dashboard.id
    const queuedConnector = createQueuedConnector({
      connector,
      dashboardId,
      chartId: id,
      tableName: querySpec.dataSource
    })

    let topNCache = null

    const currentFetchEpoch = (fetchesInFlight[id] || 0) + 1
    fetchesInFlight[id] = currentFetchEpoch

    dispatch(requestData(id))

    return preFlight(querySpec, queuedConnector, colorGroupsShouldReset)
      .then((topN) => {
        const query = genSQL({
          ...querySpec,
          groups: topN,
          showOther: querySpec.showOther
        })
        topNCache = topN

        // If in-flight epoch is newer, another request came in before this one returned.
        // So just ignore the results and bail.
        if (fetchesInFlight[id] === currentFetchEpoch) {
          return queuedConnector.queryAsync(query)
        } else {
          return []
        }
      })
      .then((_data) => {
        // If in-flight epoch is newer, another request came in before this one returned.
        // So just ignore the results and bail.
        if (fetchesInFlight[id] === currentFetchEpoch) {
          let data = []

          if (_data && _data.length && _data[0].key1) {
            data = _data.filter(
              (d) =>
                typeof d.key1 !== "undefined" &&
                d.key1 !== "undefined" &&
                d.key1 !== null
            )
          } else {
            data = _data.slice()
          }

          data.forEach((d) => {
            if (d.key1 === "other") {
              d.key1 = CHARTS_DEFAULT_OTHER_ALIASES.other
            }
          })

          colorSideEffects(id, topNCache, querySpec, configSpec, dispatch)
          dispatch(receiveData(data, id))
        }
      })
      .catch((error) => {
        dispatch(setAppError(RECEIVE_BAR_CHART_DATA_ERROR, error))
      })
  }
}
