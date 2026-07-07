// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { setFilterX } from "vega/actions/filter-action-creators-crossfilter-interop"

export const ADD_BAR_CHART_FILTER = "ADD_BAR_CHART_FILTER"
export const REMOVE_BAR_CHART_FILTER = "REMOVE_BAR_CHART_FILTER"

export function addBarChartFilter(chartId, value) {
  return async (dispatch) => {
    await dispatch({
      type: ADD_BAR_CHART_FILTER,
      id: chartId,
      value
    })
    await dispatch(setFilterX(chartId))
  }
}

export function removeBarChartFilter(chartId, value) {
  return async (dispatch) => {
    await dispatch({
      type: REMOVE_BAR_CHART_FILTER,
      id: chartId,
      value
    })
    await dispatch(setFilterX(chartId))
  }
}
