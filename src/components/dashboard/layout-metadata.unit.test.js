// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { preserveLayoutMetadata } from "./dashboard-helpers"
it("retains opaque saved layout metadata while applying engine positions and constraints", () => {
  const opaque = { plugin: { value: "retained" } }
  const previous = [{ i: "1", x: 0, y: 0, w: 10, h: 5, opaque }]
  const next = [{ i: "1", x: 2, y: 0, w: 8, h: 5, minW: 2 }]
  expect(preserveLayoutMetadata(previous, next)).toEqual([
    { ...previous[0], ...next[0], opaque }
  ])
  expect(previous[0].x).toBe(0)
  expect(next[0]).not.toHaveProperty("opaque")
  expect(preserveLayoutMetadata(previous, [])).toEqual([])
})
