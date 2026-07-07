// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CHART_REDRAW_SUCCESS,
  CHART_RENDER_SUCCESS,
  INITIAL_RENDER_DONE,
  INITIAL_RENDER_ERROR,
  REDRAW_ALL_SUCCESS,
  RENDER_ALL_SUCCESS,
  RENDER_ALL_ERROR
} from "constants/action-types"
import * as vegaConstants from "vega/constants/vega-data-action-types"
import { inDashboard, onEditPath } from "utils/routerPath"

const RENDER_REDRAW_RETURN_ACTIONS = [
  CHART_RENDER_SUCCESS,
  CHART_REDRAW_SUCCESS,
  INITIAL_RENDER_DONE,
  RENDER_ALL_SUCCESS,
  REDRAW_ALL_SUCCESS,
  INITIAL_RENDER_ERROR,
  RENDER_ALL_ERROR,
  vegaConstants.REQUEST_DATA,
  vegaConstants.RECEIVE_DATA_MULTI,
  vegaConstants.RECEIVE_ERROR
]

function isOutdatedRequest(requestState, getState) {
  const {
    id: currentDashboardId,
    selectedTabId: currentTabId
  } = getState().dashboard

  // currentDashboardId may be null if we are creating a new dashboard
  // currentTabId may be null if tabs are disabled
  const isMissingDashboardId = currentDashboardId && !requestState.dashboardId
  const isMissingTabId = currentTabId && !requestState.tabId

  if (isMissingDashboardId || isMissingTabId) {
    // eslint-disable-next-line no-console
    console.warn(
      requestState.type,
      "is missing identifier, dashboard:",
      currentDashboardId,
      "tab:",
      currentTabId,
      "received:",
      requestState
    )

    return false
  }

  // Check if we're in a different dashboard than the request started in, or not
  // in a dashboard (or chart editor) at all.
  if (
    requestState.dashboardId !== currentDashboardId ||
    (!isMissingTabId && requestState.tabId !== currentTabId) ||
    !(
      inDashboard(getState().router.location.pathname) ||
      onEditPath(getState().router.location.pathname)
    )
  ) {
    return true
  }

  return false
}

export default function cancelAsyncMiddleware() {
  return ({ getState }) => (next) => (action) => {
    // Stop any post-render actions if a request returns after the triggering
    // view is no longer active.
    if (RENDER_REDRAW_RETURN_ACTIONS.includes(action.type)) {
      if (isOutdatedRequest(action, getState)) {
        // We *should* be able to get away without additional cleanup, as
        // redux state should have been cleared if the dashboard view changed.
        return
      }
    }
    // eslint-disable-next-line consistent-return
    return next(action)
  }
}
