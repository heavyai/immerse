// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const os = require("node:os")
const { dependencyLicenseFilter } = require("../../webpack.license-filter")
const {
  getLicenseInformationForCompilation,
  getLicenseViolations
} = require("license-checker-webpack-plugin/src/licenseUtils")

test("license discovery handles scoped, nested pnpm and Windows paths without treating the store as a package", () => {
  for (const [filename, name] of [
    ["/repo/node_modules/react/index.js", "react"],
    [
      "/repo/node_modules/.pnpm/renderer@1/node_modules/@scope/renderer/src/index.js",
      "@scope/renderer"
    ],
    [
      "C:\\repo\\node_modules\\.pnpm\\react@16\\node_modules\\react\\index.js",
      "react"
    ]
  ])
    assert.equal(filename.match(dependencyLicenseFilter)[2], name)
  assert.equal(
    "/repo/node_modules/.pnpm/package.json".match(dependencyLicenseFilter),
    null
  )
  for (const metadata of [
    "/repo/node_modules/.pnpm",
    "/repo/node_modules/@material",
    "/repo/node_modules/@material/package.json"
  ])
    assert.equal(metadata.match(dependencyLicenseFilter), null)
})
test("the real license checker still rejects an unlicensed nested pnpm dependency", () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "immerse-license-"))
  try {
    const packageRoot = path.join(
      temporary,
      "node_modules/.pnpm/fixture@1/node_modules/fixture"
    )
    fs.mkdirSync(packageRoot, { recursive: true })
    fs.writeFileSync(
      path.join(packageRoot, "package.json"),
      JSON.stringify({
        name: "fixture",
        version: "1.0.0",
        license: "UNLICENSED"
      })
    )
    const info = getLicenseInformationForCompilation(
      {
        fileDependencies: [
          path.join(temporary, "node_modules/.pnpm/package.json"),
          path.join(packageRoot, "index.js")
        ]
      },
      dependencyLicenseFilter
    )
    assert.equal(getLicenseViolations(info, "MIT").length, 1)
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
})
