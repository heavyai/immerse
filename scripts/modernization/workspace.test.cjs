// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { test } = require("node:test")
const assert = require("node:assert/strict")
const { dependencyErrors, cycleErrors } = require("./workspace.cjs")
test("catalog/workspace checks reject drift while allowing independent local ranges", () => {
  const names = new Set(["@immerse/a"]),
    catalog = { react: "^16.14.0" }
  assert.deepEqual(
    dependencyErrors(
      {
        name: "b",
        dependencies: {
          react: "catalog:",
          "@immerse/a": "workspace:*",
          other: "1.0.0"
        }
      },
      catalog,
      names
    ),
    []
  )
  assert.equal(
    dependencyErrors(
      {
        name: "b",
        dependencies: { react: "^18", "@immerse/a": "*", missing: "catalog:" }
      },
      catalog,
      names
    ).length,
    3
  )
})
test("cycles fail and shared acyclic dependencies pass", () => {
  assert.equal(cycleErrors({ a: ["b"], b: ["a"] }).length, 1)
  assert.deepEqual(cycleErrors({ a: ["c"], b: ["c"], c: [] }), [])
})
