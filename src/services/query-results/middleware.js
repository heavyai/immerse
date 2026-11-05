// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createVegaResultReducers } from "@immerse/query-runtime"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"
import * as types from "vega/constants/vega-data-action-types"
import { withChartQueryData } from "./index"

const reducers = createVegaResultReducers({
  types,
  getErrorMessageFromBackendError
})

export function recordVegaResult(runtime, applicationState, action) {
  const id = action.chartId ?? action.id
  const chart = applicationState.charts?.[id]
  if (!chart || action.error?.name === "AbortError") {
    return false
  }
  if (
    action.dashboardId !== undefined &&
    action.dashboardId !== applicationState.dashboard?.id
  ) {
    return false
  }
  if (
    action.tabId !== undefined &&
    action.tabId !== applicationState.dashboard?.selectedTabId
  ) {
    return false
  }
  const state = { [id]: withChartQueryData(chart, id, runtime) }
  const result = reducers[action.type](state, action)
  if (result[id]?.data !== state[id].data) {
    runtime.writeRender(id, result[id].data)
  }
  return true
}

export function vegaResultsMiddleware(runtime) {
  return ({ getState }) => (next) => (action) => {
    const id = action.chartId ?? action.id
    const reduceResult = reducers[action.type]
    if (
      reduceResult &&
      action.type !== types.DATA_LOADED &&
      !action.queryResultAvailable
    ) {
      if (!recordVegaResult(runtime, getState(), action)) {
        return undefined
      }
      // Legacy direct result actions are sanitized before reaching Redux state
      // and DevTools; the normal application path publishes metadata directly.
      const { data, error, ...metadata } = action
      return next({ ...metadata, queryResultAvailable: true })
    }
    const before = getState().charts?.[id]
    // Reducers must run before checking whether a chart's query inputs changed.
    // eslint-disable-next-line callback-return
    const result = next(action)
    const after = getState().charts?.[id]
    if (
      before &&
      after &&
      (before.dataSelections !== after.dataSelections ||
        before.dataSource !== after.dataSource)
    ) {
      runtime.invalidate({ chartId: id })
    }
    return result
  }
}
