// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import DashboardsReducer, { initialState } from "reducers/dashboards-reducer"
import action from "utils/redux/action"

import {
  DELETE_DASHBOARD_ERROR,
  DELETE_DASHBOARD_REQUEST,
  DELETE_DASHBOARD_SUCCESS,
  GET_DASHBOARDS_ERROR,
  GET_DASHBOARDS_REQUEST,
  GET_DASHBOARDS_SUCCESS
} from "constants/action-types"

describe("Dashboards Reducer", () => {
  it("should return the correct initial state", () => {
    const state = DashboardsReducer(undefined, {})
    expect(state).toEqual(initialState)
  })

  it("should handle the GET_DASHBOARDS_REQUEST action action type", () => {
    const state = DashboardsReducer(
      initialState,
      action(GET_DASHBOARDS_REQUEST)
    )
    expect(state.loading).toEqual(true)
  })

  it("should handle the GET_DASHBOARDS_SUCCESS action action type", () => {
    const dasboards = [{ name: "flights" }, { name: "donations" }]
    const state = DashboardsReducer(
      initialState,
      action(GET_DASHBOARDS_SUCCESS, { response: dasboards })
    )
    expect(state.loading).toEqual(false)
    expect(state.error).toEqual(false)
    expect(state.list).toEqual(dasboards)
  })

  it("should handle the GET_DASHBOARDS_ERROR action action type", () => {
    const dashboardsError = "dashboardsError"
    const state = DashboardsReducer(
      initialState,
      action(GET_DASHBOARDS_ERROR, { error: dashboardsError })
    )
    expect(state.loading).toEqual(false)
    expect(state.error).toEqual(dashboardsError)
  })

  it("should handle the DELETE_DASHBOARD_REQUEST action action type", () => {
    const state = DashboardsReducer(
      initialState,
      action(DELETE_DASHBOARD_REQUEST)
    )
    expect(state.delete.loading).toEqual(true)
    expect(state.delete.error).toEqual(false)
  })

  it("should handle the DELETE_DASHBOARD_SUCCESS action action type", () => {
    const list = [{ dashboard_id: 123 }, { dashboard_id: 456 }]
    const state = DashboardsReducer(
      Object.assign({}, initialState, { list }),
      action(DELETE_DASHBOARD_SUCCESS, { id: 123 })
    )
    expect(state.delete.loading).toEqual(false)
    expect(state.delete.error).toEqual(false)
    expect(state.list).toEqual([{ dashboard_id: 456 }])
  })

  it("should handle the DELETE_DASHBOARD_ERROR action action type", () => {
    const error = "TEST"
    const state = DashboardsReducer(
      initialState,
      action(DELETE_DASHBOARD_ERROR, { error })
    )
    expect(state.delete.loading).toEqual(false)
    expect(state.delete.error).toEqual(error)
  })
})
