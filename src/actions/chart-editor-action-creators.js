// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  APPLY_CHART_EDITS,
  CANCEL_CHART_EDITS,
  INIT_CHART_EDITOR_TABLE_PREVIEW,
  SAVE_CHARTS_SNAPSHOT,
  SAVE_CURRENT_CHART,
  SET_CHART_EDITOR_TABLE_PREVIEW,
  SET_CHART_EDITOR_TO_INITIAL_STATE
} from "constants/action-types"
import {
  deleteChart,
  removeCountChart,
  resetChartState
} from "actions/charts-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import { setDataSources } from "actions/dashboard-action-creators"
import { cancelChartFilterChanges } from "vega/actions/filter-action-creators"
import { getActiveChartDataSources } from "utils/currently-active-datasources"
import {
  findRasterLayerIndexById,
  getRasterLayersDiff,
  isMultiLayer
} from "../charts/raster-chart/raster-utils"
import { deleteRasterLayer } from "../charts/raster-chart/raster-chart-actions"
import {
  cleanupUnusedCustomSqlParameterDefinitions,
  resetCustomSqlParametersFromSnapshot,
  resetParametersUsageFromSnapshot
} from "../components/parameters/actions"
import {
  getParameterDefinitions,
  getSelectedTab,
  makeGetParameterUsage,
  makeGetParameterValuesForChart
} from "components/parameters/selectors"
import { addParameterToPanel } from "components/parameters/actions/parameter-visibility-action-creators"
import { isCustomSqlParameter } from "components/parameters/parameters-types"
import { getTablesForDataSource } from "components/join-manager/utils"

export function initChartEditorTablePreview(tableName) {
  return {
    type: INIT_CHART_EDITOR_TABLE_PREVIEW,
    tableName
  }
}

export function setChartEditorTablePreview(tableName) {
  return {
    type: SET_CHART_EDITOR_TABLE_PREVIEW,
    tableName
  }
}

export function saveDataSources(savedDataSources) {
  return {
    type: "SAVE_DATASOURCES",
    savedDataSources
  }
}

export function saveCurrentChart(chartId, chart = {}) {
  return (dispatch, getState) => {
    const filtersForChart = getState().omnifilters.filter(
      (f) =>
        (f.appliesTo === "CHART" || f.appliesTo === "CROSSFILTER") &&
        f.chartId === chartId
    )

    dispatch({
      type: SAVE_CURRENT_CHART,
      chartId,
      chart,
      filtersForChart
    })
  }
}

export function saveChartsSnapshot(charts) {
  return {
    type: SAVE_CHARTS_SNAPSHOT,
    charts
  }
}

export function setChartEditorToInitialState() {
  return {
    type: SET_CHART_EDITOR_TO_INITIAL_STATE
  }
}

export function applyChartEdits(chartId, chartType) {
  return (dispatch, getState) => {
    // when we're sucessfully leaving the chart editor, yank out  all the params this chart uses
    const params = Object.keys(
      makeGetParameterValuesForChart(getState())(chartId)
    )
    // and add them to the panel (if they're not there already)
    params.forEach((parameter) => {
      dispatch(addParameterToPanel(parameter))
    })
    const activeDataSources = getActiveChartDataSources(getState(), chartId)
    const activeTablesForChart = activeDataSources
      .map(getTablesForDataSource)
      .flat()

    dispatch({
      type: APPLY_CHART_EDITS,
      chartId,
      chartType,
      activeTablesForChart
    })
  }
}

export function cancelChartEdits(chartId, chartType) {
  return {
    type: CANCEL_CHART_EDITS,
    chartId,
    chartType
  }
}

export const revertFilters = (savedChart, chartId) =>
  updateChart(chartId, {
    areFiltersInverse: false,
    filters: [...savedChart.filters]
  })

export const revertRangeFilters = (savedChart, chartId) =>
  updateChart(chartId, {
    areFiltersInverse: false,
    rangeFilter: [...savedChart.rangeFilter]
  })

const resetChartsUsingParameterizedCustomDimensions = (
  parametersSnapshot,
  savedCharts
) => async (dispatch, getState) => {
  const definitions = getParameterDefinitions(getState())
  const customSelectorParameters = Object.keys(definitions).filter((p) =>
    isCustomSqlParameter(definitions[p])
  )
  const getParameterUsage = makeGetParameterUsage({
    parameters: parametersSnapshot
  })
  const selectedTab = getSelectedTab(getState())
  const chartsUsingParameterizedCustomSelectors = customSelectorParameters.reduce(
    (charts, parameter) => {
      return new Set([...charts, ...getParameterUsage(parameter, selectedTab)])
    },
    new Set()
  )
  await Promise.all(
    [...chartsUsingParameterizedCustomSelectors].map((id) =>
      savedCharts[id]
        ? dispatch(resetChartState(id, savedCharts[id], getState().charts[id]))
        : Promise.resolve()
    )
  )
}

const revertSelectorParameters = (parametersSnapshot, savedCharts) => async (
  dispatch
) => {
  dispatch(resetCustomSqlParametersFromSnapshot(parametersSnapshot))

  await dispatch(
    resetChartsUsingParameterizedCustomDimensions(
      parametersSnapshot,
      savedCharts
    )
  )
}

export function maybeRevertChartToOldState(
  chartId,
  hasSaved,
  savedChart,
  newChart,
  savedDataSources,
  currentDataSource,
  shouldResetChart,
  savedChartFilters,
  parametersSnapshot,
  savedCharts
) {
  return async (dispatch, getState) => {
    const { charts } = getState()
    const currentChart = charts[chartId]
    // editingSavedChart = whether the user is editing a pre-existing chart (vs
    // creating a new chart). hasSaved = whether the dashboard is saved.
    const editingSavedChart = Object.keys(savedChart).length > 0
    if (!hasSaved && !editingSavedChart) {
      dispatch(deleteChart(chartId))

      // Ugh. maybeRevertChartToOldState can be called without ever even entering
      // chart editor. Make sure we’ve actually done so and have set a parametersSnapshot.
      if (parametersSnapshot) {
        dispatch(resetParametersUsageFromSnapshot(parametersSnapshot.usage))
        dispatch(revertSelectorParameters(parametersSnapshot, savedCharts))
        dispatch(cleanupUnusedCustomSqlParameterDefinitions(parametersSnapshot))
      }
    } else if (!hasSaved && (editingSavedChart || shouldResetChart)) {
      if (savedChart.type) {
        if (
          currentDataSource &&
          !Object.keys(savedDataSources.dataSources)[currentDataSource]
        ) {
          dispatch(removeCountChart(currentDataSource))
          if (isMultiLayer(savedChart.type)) {
            const savedChartLayers = savedChart.layers
            const newChartLayers = newChart.layers
            getRasterLayersDiff(
              savedChartLayers,
              newChartLayers
            ).forEach((layer) =>
              dispatch(
                deleteRasterLayer(
                  chartId,
                  findRasterLayerIndexById(newChartLayers, layer.rasterLayerId),
                  savedChart.currentLayer
                )
              )
            )
          }
        }

        dispatch(setDataSources(savedDataSources))

        if (parametersSnapshot) {
          dispatch(revertSelectorParameters(parametersSnapshot, savedCharts))
          dispatch(resetParametersUsageFromSnapshot(parametersSnapshot.usage))
        }

        await dispatch(resetChartState(chartId, savedChart, currentChart))

        dispatch(cancelChartFilterChanges(chartId, savedChartFilters))

        if (parametersSnapshot !== null) {
          dispatch(
            cleanupUnusedCustomSqlParameterDefinitions(parametersSnapshot)
          )
        }
      } else {
        dispatch(deleteChart(chartId))
      }
    }
  }
}
