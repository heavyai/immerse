// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { createChartRegistry } = require("./index")
it("retains persisted identifiers, isolates registries, and returns definition identity", () => {
  const registry = createChartRegistry()
  const other = createChartRegistry()
  const plugin = { type: "legacy-pie", version: 1 }
  expect(registry.register(plugin)).toBe(plugin)
  expect(registry.get("legacy-pie")).toBe(plugin)
  expect(registry.list()).toEqual([plugin])
  expect(other.get("legacy-pie")).toBeUndefined()
  expect(() => registry.register({})).toThrow("persisted chart type")
})
