// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import clearDashboard from "./clear-dashboard"

import { CLEAR_DASHBOARD } from "constants/action-types"
import * as dashboard from "reducers/dashboard"
import * as ui from "reducers/ui-reducer"

describe("Clear Dashboard Reducer", () => {
  let initialState = {}
  let clearDashboardReducer = undefined
  let reducer = undefined

  beforeEach(() => {
    initialState = {
      charts: { "1": [] },
      dashboard: {
        dashData: "data",
        loadState: { request: false, error: false }
      },
      ui: { uiData: "data" },
      filters: ["SomeFilter"],
      joinDataSources: ["jds"]
    }

    reducer = jest.fn()
    clearDashboardReducer = clearDashboard(reducer)
  })

  it("should clear all reducers to initialstate", () => {
    const state = clearDashboardReducer({}, { type: CLEAR_DASHBOARD })
    expect(state).toEqual({
      charts: {},
      dashboard: dashboard.initialState,
      ui: ui.initialState,
      filters: [],
      joinDataSources: [],
      sharedSettings: {
        mappings: []
      },
      sharedSettingsImport: {
        error: "",
        loading: false,
        sharedSettings: {
          mappings: []
        }
      }
    })
  })

  it("should have other reducers run if action is not clear chart", () => {
    clearDashboardReducer(
      { data: "data" },
      { type: "SOME_OTHER_ACTION", dashboardState: initialState }
    )
    expect(reducer).toHaveBeenCalled()
  })
})
