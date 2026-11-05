// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { createVegaResultReducers } = require("./index")
const types = {
  REQUEST_DATA: "request",
  RECEIVE_DATA_MULTI: "receive",
  RECEIVE_ERROR: "error"
}
const reducers = createVegaResultReducers({
  types,
  getErrorMessageFromBackendError: () => "failed"
})
it("orders multi-digit beats numerically and rejects older rows and errors", () => {
  const scope = { chartId: "1", dataKey: "focus", layerIndex: 0 }
  const initial = { "1": {} }
  const a = reducers.request(initial, { ...scope, beatId: "9" })
  const b = reducers.request(a, { ...scope, beatId: "10" })
  const rows = reducers.receive(b, {
    ...scope,
    beatId: "10",
    data: { table: [10] }
  })
  expect(
    reducers.receive(rows, { ...scope, beatId: "9", data: { table: [9] } })
  ).toBe(rows)
  expect(
    reducers.error(rows, { ...scope, beatId: "9", error: new Error() })
  ).toBe(rows)
  expect(rows["1"].data.focus[0]["10"].table).toEqual([10])
  expect(initial).toEqual({ "1": {} })
})
