// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { test } = require("node:test")
const assert = require("node:assert/strict")
const { violations } = require("./query-boundaries.cjs")
const clean = {
  utilities: "export function filter(state) {}",
  rootReducer: "combineReducers({charts})",
  vegaReducer: "DATA_LOADED",
  rootSaga: "rasterChartSaga()"
}
test("accepts explicit filter state and external query ownership", () =>
  assert.deepEqual(violations(clean), []))
test("rejects reintroduction of store reads, query reducers and filter sagas", () => {
  assert.equal(
    violations({ ...clean, utilities: "getStore().getState()" }).length,
    1
  )
  assert.equal(
    violations({ ...clean, rootReducer: "combineReducers({chartData})" })
      .length,
    1
  )
  assert.equal(
    violations({ ...clean, vegaReducer: "RECEIVE_DATA_MULTI" }).length,
    1
  )
  assert.equal(
    violations({ ...clean, rootSaga: 'import "sagas/dashboard-filter-sagas"' })
      .length,
    1
  )
})
