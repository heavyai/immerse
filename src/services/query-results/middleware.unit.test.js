// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createStore, applyMiddleware } from "redux"
import thunk from "redux-thunk"
import { getQueryRuntime } from "services/query-runtime"
import { vegaResultsMiddleware } from "./middleware"
import { withChartQueryData } from "./index"
import {
  receiveData,
  requestData
} from "vega/actions/vega-data-action-creators"

it("keeps Vega rows and beats out of Redux state and action history", () => {
  const services = new Map()
  const runtime = getQueryRuntime(services)
  const state = {
    dashboard: { id: "d", selectedTabId: "t" },
    charts: { "1": { id: "1", type: "vega-combo" } }
  }
  const received = []
  const store = createStore((value = state, action) => {
    received.push(action)
    return value
  }, applyMiddleware(thunk.withExtraArgument(services), vegaResultsMiddleware(runtime)))
  store.dispatch(requestData("1", "d", "t", "focus", 0, "10"))
  store.dispatch(
    receiveData("1", "d", "t", "focus", 0, "10", {
      table: [{ marker: "query-row" }],
      incomplete: false
    })
  )
  expect(store.getState().charts["1"]).not.toHaveProperty("data")
  expect(JSON.stringify(received)).not.toContain("query-row")
  const view = withChartQueryData(state.charts["1"], "1", runtime)
  expect(view.data.focus[0]["10"].table).toEqual([{ marker: "query-row" }])
  expect(runtime.readChart("1")).toBeUndefined()
  store.dispatch(
    receiveData("1", "other-dashboard", "t", "focus", 0, "11", {
      table: [{ marker: "stale" }]
    })
  )
  expect(withChartQueryData(state.charts["1"], "1", runtime)).toBe(view)
})
