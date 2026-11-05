// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createActionMetrics } from "./metrics"

it("records completed action names without payloads and preserves dispatch results", () => {
  const target = {}
  const next = jest.fn().mockReturnValue("dispatch-result")
  const middleware = createActionMetrics(target)()(next)
  expect(middleware({ type: "FILTER", payload: "private-value" })).toBe(
    "dispatch-result"
  )
  middleware({ type: "FILTER" })
  expect(target.read()).toEqual({ FILTER: 2 })
  const snapshot = target.read()
  snapshot.FILTER = 99
  expect(target.read()).toEqual({ FILTER: 2 })
  target.reset()
  expect(target.read()).toEqual({})
  next.mockImplementation(() => {
    throw new Error("reducer failure")
  })
  expect(() => middleware({ type: "FAIL" })).toThrow("reducer failure")
  expect(target.read()).toEqual({})
})
