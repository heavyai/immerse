// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { createLegacyQueryRuntime } = require("./index")
it("keeps the existing queue factory's sharing/identity and error behavior", () => {
  const connector = {}
  const options = { chartId: "1" }
  const factory = jest.fn(() => connector)
  const runtime = createLegacyQueryRuntime(factory)
  expect(runtime.forChart(options)).toBe(connector)
  expect(runtime.forChart(options)).toBe(connector)
  expect(factory).toHaveBeenLastCalledWith(options)
  factory.mockImplementation(() => {
    throw new Error("legacy failure")
  })
  expect(() => runtime.forChart(options)).toThrow("legacy failure")
})
