// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const { scan, regressions } = require("./architecture.cjs")

test("ratchet catches new static, dynamic and CommonJS dependencies and chart branches", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "immerse-ratchet-"))
  try {
    fs.writeFileSync(
      path.join(dir, "example.tsx"),
      `
      import { call } from "redux-saga/effects";
      export { thing } from "@heavyai/charting";
      const widget = require("@rmwc/button");
      const mui = import("@material-ui/core");
      import store from "store/importableStore";
      if (chart.type === "pie") render();
      switch (props.chart["type"]) { case "number": break; }
      const result = chart.type === "pie" ? 1 : 0;
    `
    )
    fs.writeFileSync(
      path.join(dir, "ignored.unit.test.js"),
      'import x from "@heavyai/test"'
    )
    const sites = scan(dir)
    const categories = Object.keys(sites).map((key) => key.split("|")[0])
    assert.equal(
      Object.values(sites).reduce((sum, count) => sum + count, 0),
      8
    )
    assert.equal(
      categories.filter((category) => category === "chart-type-branch").length,
      2
    )
    assert.equal(regressions(sites, {}).length, 7)
    assert.deepEqual(regressions(sites, sites), [])
    const first = Object.keys(sites)[0]
    assert.equal(
      regressions({ ...sites, [first]: sites[first] + 1 }, sites)[0].added,
      1
    )
    assert.deepEqual(regressions({}, sites), [])
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
