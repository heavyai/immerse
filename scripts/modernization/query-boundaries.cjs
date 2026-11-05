// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// This CLI reads fixed source files synchronously and reports CI violations.
/* eslint-disable no-sync, no-console */
const fs = require("node:fs")
const path = require("node:path")

function violations({ utilities, rootReducer, vegaReducer, rootSaga }) {
  const errors = []
  if (/\bgetStore\s*\(|importableStore/.test(utilities)) {
    errors.push("Filter utilities must receive explicit state snapshots")
  }
  if (/\bchartData\b/.test(rootReducer)) {
    errors.push(
      "Chart query results belong in query-runtime, not a Redux slice"
    )
  }
  if (/RECEIVE_DATA|RECEIVE_ERROR|REQUEST_DATA/.test(vegaReducer)) {
    errors.push("Vega result/beat accumulation belongs in query-runtime")
  }
  if (/dashboard-filter-sagas/.test(rootSaga)) {
    errors.push("Dashboard filter workflows must use application services")
  }
  return errors
}
if (require.main === module) {
  const root = path.resolve(__dirname, "../..")
  const read = (file) => fs.readFileSync(path.join(root, file), "utf8")
  const errors = violations({
    utilities: read("src/services/ImmerseCrossFilter/utils.js"),
    rootReducer: read("src/reducers/index.js"),
    vegaReducer: read("src/vega/reducers/vega-data-reducer.ts"),
    rootSaga: read("src/sagas/root-saga.js")
  })
  if (errors.length) {
    console.error(errors.join("\n"))
    process.exitCode = 1
  } else {
    console.log(
      "Filter state ports, external query/beat ownership and filter service boundaries passed."
    )
  }
}
module.exports = { violations }
