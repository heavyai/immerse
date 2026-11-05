// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const test = require("node:test")
const assert = require("node:assert/strict")
const { violations } = require("./ui-boundaries.cjs")
test("blocks retired primitive, hot-loader and Enzyme imports", () => {
  for (const module of [
    "@rmwc/dialog",
    "@rmwc/tooltip/tooltip.css",
    "@material-ui/core/Slider",
    "react-hot-loader/root",
    "enzyme"
  ]) {
    assert.equal(
      violations("component.tsx", `import widget from "${module}"`).length,
      1
    )
  }
  assert.equal(
    violations(
      "component.tsx",
      'import { Slider as Range } from "@material-ui/core"'
    ).length,
    1
  )
})
test("permits owned primitives and the remaining vendor domains", () => {
  assert.deepEqual(
    violations(
      "component.tsx",
      'import { Dialog } from "@immerse/ui"; import { DataTable } from "@rmwc/data-table"'
    ),
    []
  )
})
