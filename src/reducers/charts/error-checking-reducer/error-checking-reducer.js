// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ActionTypes from "constants/action-types"
import { SET_CHART_DATA_ERROR } from "actions/chart-error-state-action-creators"
import { compose } from "ramda"
import updateHasError from "reducers/charts/error-checking-reducer/update-has-error"
import { updateChart } from "reducers/charts/charts-reducer-helpers"
import checkForDimensionErrors from "./check-for-errors/check-for-dimension-errors"
import checkForMeasureErrors from "./check-for-errors/check-for-measure-errors"
import checkForMissingDimensions from "./check-for-missing/check-for-missing-dimensions"
import checkForMissingMeasures from "./check-for-missing/check-for-missing-measures"
import { isChartMultiSource } from "reducers/charts/helpers/multi-source-helpers"
import { isVegaChart } from "constants/charts"

const blacklist = {
  [ActionTypes.CLEAR_CHARTS]: true,
  [ActionTypes.CLEAR_CHART_FILTERS]: true,
  [ActionTypes.SET_CHART_HAS_ERROR]: true,
  [SET_CHART_DATA_ERROR]: true
}

const isUpdateFilterAction = ({ type, payload }) =>
  type === ActionTypes.UPDATE_CHART && payload.filters

const isChartWithNoType = (chart, { chartType }) =>
  !chart || (!chart.type && !chartType)

const hasFixedSortError = (state, action) => {
  const chart = state[action.chartId || action.id]
  if (chart.hasError === "sort") {
    const { payload, type } = action
    return payload
      ? !payload.sort && !payload.sortColumn
      : type !== ActionTypes.REMOVE_SELECTOR
  } else {
    return false
  }
}

const shouldBypassErrorChecking = (state, action) => {
  const chart = state[action.chartId || action.id]
  return (
    blacklist[action.type] ||
    isChartWithNoType(chart, action) ||
    isVegaChart(chart.type) ||
    isUpdateFilterAction(action) ||
    hasFixedSortError(state, action)
  )
}

export default function chartsErrorCheckReducer(state, action, oldState) {
  const chartId = action.chartId || action.id
  const chart = state[chartId]

  if (
    chartId &&
    chart &&
    !oldState[chartId] &&
    action.type !== ActionTypes.CREATE_CHART &&
    /^\d+$/.test(chartId)
  ) {
    // If an action is kicked off, but the chart is removed before the action
    // completes (such as loading data), a lot of reducer functions will
    // accidentally recreate the removed chart's state, but it will be missing
    // the vast majority of values. This will inevitably cause something to
    // blow up because a lot of code assumes that if the chart's state exists,
    // it's valid (ie, has dimensions, measures, etc).
    //
    // The all-digits regex is necessary because the count chart creates
    // "charts" in redux whose "ids" are table names.
    return oldState
  } else if (shouldBypassErrorChecking(state, action)) {
    return state
  } else if (action.type === ActionTypes.SET_SELECTOR_ERROR) {
    return updateHasError(chartId)(state)
  } else {
    const multiSource = isChartMultiSource(chart)

    const newState = compose(
      updateHasError(chartId),
      updateChart(
        chartId,
        "measures",
        checkForMeasureErrors(chart.type, chart.dimensions)
      ),
      updateChart(
        chartId,
        "measures",
        checkForMissingMeasures(chart.type, multiSource)
      ),
      updateChart(
        chartId,
        "dimensions",
        checkForDimensionErrors(chart.type, chart.dimensions)
      ),
      updateChart(chartId, "dimensions", checkForMissingDimensions(chart.type))
    )(state)

    const newChart = newState[chartId]
    if (
      newChart &&
      chart.hasError &&
      !newChart.hasError &&
      newChart.dataError
    ) {
      // If the user did something that caused hasError to go from true to
      // false, we'll clear the dataError, too.
      newChart.dataError = undefined
    }
    return newState
  }
}
