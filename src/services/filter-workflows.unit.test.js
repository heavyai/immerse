// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createFilterWorkflows } from "./filter-workflows"
import { getQueryRuntime } from "./query-runtime"
import {
  GET_FILTER_SIZE_REQUEST,
  GET_FILTER_SIZE_SUCCESS
} from "actions/dashboard-filters-action-creators"

it.each(["dashboard", "row", "dispose"])(
  "discards a late filter metadata response after %s changes",
  async (change) => {
    let finish = null
    const query = new Promise((resolve) => {
      finish = resolve
    })
    const services = new Map([["DbCon", { queryAsync: () => query }]])
    const workflows = createFilterWorkflows(services)
    let state = {
      dashboard: { id: "a" },
      filters: [{ dataSource: "sales", value: "region" }]
    }
    const dispatch = jest.fn()
    const next = jest.fn()
    workflows.middleware({ getState: () => state, dispatch })(next)({
      type: GET_FILTER_SIZE_REQUEST,
      index: 0
    })
    if (change === "dashboard") {
      state = { ...state, dashboard: { id: "b" } }
      getQueryRuntime(services).invalidate()
    } else if (change === "row") {
      state = { ...state, filters: [{ dataSource: "sales", value: "amount" }] }
    } else {
      workflows.dispose()
    }
    finish([{ n: 8 }])
    await query
    await Promise.resolve()
    expect(
      dispatch.mock.calls.some(
        ([action]) => action.type === GET_FILTER_SIZE_SUCCESS
      )
    ).toBe(false)
    workflows.dispose()
  }
)
