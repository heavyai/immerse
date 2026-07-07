// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapToMetadata, nextChar } from "reducers/dashboard"
import R from "ramda"
import {
  getActiveDataSources,
  getActiveChartDataSources
} from "utils/currently-active-datasources"
import { DATA_SOURCE_UPDATED } from "actions/data-source-action-creators"

function updateChartsState(
  state,
  { chartId: { chartId }, dataSource, multiSourceIndex }
) {
  if (multiSourceIndex || multiSourceIndex === 0) {
    const oldMultiSources = state.charts[chartId].multiSources || {}

    const multiSources = {
      ...oldMultiSources,
      [multiSourceIndex]: {
        ...oldMultiSources[multiSourceIndex],
        table: dataSource
      }
    }

    return {
      ...state,
      charts: {
        ...state.charts,
        [chartId]: {
          ...state.charts[chartId],
          multiSources
        }
      }
    }
  } else if (chartId) {
    return {
      ...state,
      charts: {
        ...state.charts,
        [chartId]: {
          ...state.charts[chartId],
          dataSource,
          hoverSelectedColumns: []
        }
      }
    }
  } else {
    return state
  }
}

function sources(state, action) {
  if (
    action.dataSource === null ||
    state.dashboard.dataSources[action.dataSource]
  ) {
    return {
      ...state,
      dashboard: {
        ...state.dashboard,
        currentDataSource: action.dataSource
      }
    }
  } else {
    return {
      ...state,
      dashboard: {
        ...state.dashboard,
        currentDataSource: action.dataSource,
        dataSources: {
          ...state.dashboard.dataSources,
          [action.dataSource]: {
            alias: nextChar(state.dashboard.dataSources),
            columnMetadata: mapToMetadata(action.columnMetaData)
          }
        }
      }
    }
  }
}

function nextDataSource(state, action) {
  const all = getActiveDataSources(state)
  if (action.previous === null) {
    return state
  } else if (all.filter((a) => a === action.previous).length) {
    return state
  } else {
    return {
      ...state,
      dashboard: {
        ...state.dashboard,
        dataSources: {
          ...R.dissoc(action.previous, state.dashboard.dataSources)
        }
      }
    }
  }
}

function getPrevious(state, action) {
  if (typeof action.chartId.filterIndex === "number") {
    return state.filters[action.chartId.filterIndex]
      ? state.filters[action.chartId.filterIndex].dataSource
      : null
  } else if (action.chartId.chartId) {
    return state.charts[action.chartId.chartId].dataSource
  } else {
    return ""
  }
}

export default function dataSourceHigherOrderReducer(reducer) {
  return function dataSourceReducer(state, action) {
    switch (action.type) {
      case "SELECT_DATA_SOURCE": {
        const params = {
          ...action,
          previous: getPrevious(state, action)
        }
        const updatedChartsState = updateChartsState(state, params)
        const updatedDashboardState = nextDataSource(updatedChartsState, params)
        const nextState = sources(updatedDashboardState, params)
        return nextState
      }
      case DATA_SOURCE_UPDATED: {
        return {
          ...state,
          dashboard: {
            ...state.dashboard,
            dataSources: {
              ...state.dashboard.dataSources,
              [action.dataSource]: {
                ...state.dashboard.dataSources[action.dataSource],
                columnMetadata: mapToMetadata(action.columnMetadata)
              }
            }
          }
        }
      }
      case "APPLY_CHART_EDITS": {
        const chartDataSources = getActiveChartDataSources({
          ...state,
          charts: R.dissoc(action.chartId, state.charts)
        })
        const chart = state.charts[action.chartId]
        if (
          chart.type === "text" &&
          chartDataSources.indexOf(chart.dataSource) === -1
        ) {
          const dashboard = {
            ...state.dashboard,
            currentDataSource: null
          }

          delete dashboard.dataSources[chart.dataSource]

          return {
            ...state,
            dashboard,
            charts: {
              ...state.charts,
              [action.chartId]: {
                ...chart,
                dataSource: null
              }
            }
          }
        } else {
          return reducer(state, action)
        }
      }
      default:
        return reducer(state, action)
    }
  }
}
