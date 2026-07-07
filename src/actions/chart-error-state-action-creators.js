// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CLEAR_CHART_HAS_ERROR } from "constants/action-types"

export const SET_CHART_DATA_ERROR = "SET_CHART_DATA_ERROR"

export const setChartDataError = (chartId, error) => (dispatch, getState) => {
  const existingChartError = getState().charts?.[chartId]?.dataError
  if (existingChartError !== error) {
    dispatch({
      type: SET_CHART_DATA_ERROR,
      chartId,
      error
    })
  }
}

export const clearChartDataError = (chartId) => setChartDataError(chartId)

export function clearChartHasError(chartId) {
  return {
    type: CLEAR_CHART_HAS_ERROR,
    chartId
  }
}
