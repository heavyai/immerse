// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash"
import clearDashboard from "reducers/clear-dashboard"
import resetAppState from "reducers/reset-app-state-higher-order-reducer"
import loadDashboard from "reducers/load-dashboard-higher-order-reducer"
import { initialState as dc } from "reducers/dc-reducer"
import {
  CLEAR_DASHBOARD,
  RESET_APP_STATE,
  LOAD_DASHBOARD_SUCCESS
} from "constants/action-types"
import mixed from "../../../test-config/modernization/fixtures/mixed-engines.json"

const passthrough = (state) => state
const documentSlices = [
  "annotations",
  "charts",
  "dashboard",
  "filters",
  "omnifilters",
  "filterZones",
  "cohorts",
  "parameters",
  "crossLinks",
  "chartAddons",
  "joinDataSources",
  "sharedSettings"
]

it.each([
  [CLEAR_DASHBOARD, clearDashboard],
  [RESET_APP_STATE, resetAppState]
])(
  "%s clears core document state while preserving connection/session",
  (type, wrapper) => {
    const state = {
      ...cloneDeep(mixed),
      dc: cloneDeep(dc),
      connection: { version: "9.0.0" },
      session: { user: "fixture-user" }
    }
    const result = wrapper(passthrough)(state, { type })
    expect(result.charts).toEqual({})
    expect(result.filters).toEqual([])
    expect(result.dashboard).not.toBe(state.dashboard)
    expect(result.connection).toBe(state.connection)
    expect(result.session).toBe(state.session)
  }
)

it("loading B after A replaces every persisted document slice and preserves connection/session", () => {
  const reducer = loadDashboard(passthrough)
  const a = {
    ...cloneDeep(mixed),
    dashboard: { id: "dashboard-a" },
    dc: cloneDeep(dc),
    connection: { version: "9.0.0" },
    session: { user: "fixture-user" }
  }
  const b = cloneDeep(mixed)
  b.dashboard.title = "Dashboard B"
  b.charts = {}
  b.dashboard.chartContainers = []
  b.omnifilters = []
  b.joinDataSources = []
  const action = {
    type: LOAD_DASHBOARD_SUCCESS,
    dashboardState: b,
    dashboardId: "dashboard-b"
  }
  const afterA = reducer(a, cloneDeep(action))
  const freshB = reducer(
    { dashboard: {}, dc: cloneDeep(dc) },
    cloneDeep(action)
  )
  for (const key of documentSlices) {
    expect(afterA[key]).toEqual(freshB[key])
  }
  expect(afterA.connection).toBe(a.connection)
  expect(afterA.session).toBe(a.session)
})

// Known gaps are explicitly tracked, not approved as desired behavior.
// See docs/modernization/README.md: reset/load ownership matrix and Wave 1 work.
it.todo(
  "CLEAR_DASHBOARD clears omnifilters, parameters, cohorts, filterZones, annotations, crossLinks, chartAddons and chartData"
)
it.todo(
  "RESET_APP_STATE clears omnifilters, parameters, cohorts, filterZones, annotations, chartAddons, joinDataSources and chartData"
)
it.todo(
  "LOAD_DASHBOARD_SUCCESS invalidates prior chartData and chart-editor workflow state"
)
