// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getQueryRuntime, queryLifecycleMiddleware } from "./query-runtime"
import {
  populateImportableStore,
  saveStore,
  resetStore
} from "store/importableStore"
import {
  getChartData,
  registerAPIChartDataFormatter
} from "services/external-messenger-api/api/getChartData"
import {
  registerForChartDataNotifications,
  unregisterForChartDataNotifications
} from "services/external-messenger-api/api/registerForChartDataNotifications"
import { saveChartData } from "components/chart-data/chart-data-action-creators"

it("keeps embed data/notifications compatible without a Redux query cache", async () => {
  saveStore()
  const state = { charts: { "1": { type: "wave2-fixture", filters: [1] } } }
  populateImportableStore({ getState: () => state })
  const runtime = getQueryRuntime()
  runtime.invalidate()
  registerAPIChartDataFormatter("wave2-fixture", (_, data) => data?.rows)
  const handler = jest.fn()
  const message = { payload: { chartId: "1" }, responseKey: "wave2-test" }
  try {
    const ticket = runtime.begin({ chartId: "1", channel: "rows" })
    registerForChartDataNotifications(message, handler)
    await saveChartData({ chartId: "1", token: "rows", data: [1], ticket })(
      null,
      null
    )
    expect(getChartData({ payload: { chartId: "1" } }).payload).toEqual({
      data: [1],
      chartId: "1",
      type: "wave2-fixture",
      filters: [1]
    })
    expect(handler).toHaveBeenCalledTimes(1)
    runtime.invalidate({ chartId: "1" })
    await saveChartData({ chartId: "1", token: "rows", data: [2], ticket })(
      null,
      null
    )
    expect(handler).toHaveBeenCalledTimes(1)
    expect(state).not.toHaveProperty("chartData")
  } finally {
    unregisterForChartDataNotifications(message, handler)
    runtime.invalidate()
    resetStore()
  }
})
it.each([
  "CLEAR_DASHBOARD",
  "RESET_APP_STATE",
  "LOAD_DASHBOARD_SUCCESS",
  "CONNECTION_REQUEST",
  "DROP_CONNECTION"
])("invalidates cached and pending results on %s", (type) => {
  const runtime = getQueryRuntime(new Map())
  const ticket = runtime.begin({ chartId: "1" })
  runtime.commit(ticket, "rows", [1])
  const next = jest.fn()
  queryLifecycleMiddleware(runtime)()(next)({ type })
  expect(runtime.getSnapshot()).toEqual({})
  expect(runtime.commit(ticket, "rows", [2])).toBe(false)
  expect(next).toHaveBeenCalledTimes(1)
})
