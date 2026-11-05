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

it.each([
  [CLEAR_DASHBOARD, clearDashboard],
  [RESET_APP_STATE, resetAppState]
])(
  "%s discards every observed stale dashboard-owned slice and returns fresh state",
  (type, wrapper) => {
    const state = {
      ...cloneDeep(mixed),
      dc: cloneDeep(dc),
      chartData: { old: { rows: [1] } },
      columnValues: { old: [1] },
      chartEditor: { editId: "old", editing: true }
    }
    const reducer = wrapper(passthrough)
    const result = reducer(state, { type })
    for (const key of ["omnifilters", "crossLinks", "joinDataSources"]) {
      expect(result[key]).toEqual([])
    }
    for (const key of [
      "filterZones",
      "cohorts",
      "chartAddons",
      "chartData",
      "columnValues"
    ]) {
      expect(result[key]).toEqual({})
    }
    expect(result.annotations).toEqual({
      annotations: {},
      enabled: true,
      editMode: false
    })
    expect(result.parameters).toEqual({
      definitions: {},
      values: {},
      sets: {},
      usage: {},
      crossfilterTokens: {}
    })
    expect(result.chartEditor.editId).toBe("")
    expect(result.chartEditor.editing).toBe(false)
    result.parameters.values.poison = "must not survive"
    result.dc.initialRender.pending = true
    const again = reducer(state, { type })
    expect(again.parameters.values).toEqual({})
    expect(again.dc.initialRender.pending).toBe(false)
    expect(state.chartData).toEqual({ old: { rows: [1] } })
  }
)
it("loading another document invalidates prior query results and chart-editor work", () => {
  const reducer = loadDashboard(passthrough)
  const state = {
    ...cloneDeep(mixed),
    dc: cloneDeep(dc),
    chartData: { old: { rows: [1] } },
    columnValues: { old: [1] },
    chartEditor: { editId: "old", editing: true }
  }
  const result = reducer(state, {
    type: LOAD_DASHBOARD_SUCCESS,
    dashboardState: cloneDeep(mixed),
    dashboardId: "new"
  })
  expect(result.chartData).toEqual({})
  expect(result.columnValues).toEqual({})
  expect(result.chartEditor.editId).toBe("")
  expect(result.chartEditor.editing).toBe(false)
  expect(state.chartData).toEqual({ old: { rows: [1] } })
})
