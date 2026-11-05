// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
const { test } = require("node:test")
const assert = require("node:assert/strict")
const { errorsFor } = require("./git-sources.cjs")
test("approved nested Git revisions pass; new repositories and short hashes fail", () => {
  const hash = "a".repeat(40),
    pin = `git+https://github.com/heavyai/example.git#${hash}`
  const pins = { example: pin },
    workspace = { catalog: pins, overrides: pins }
  assert.deepEqual(
    errorsFor(
      workspace,
      { tarball: `https://codeload.github.com/heavyai/example/tar.gz/${hash}` },
      pins
    ),
    []
  )
  assert.ok(
    errorsFor(
      workspace,
      { tarball: `https://codeload.github.com/unknown/example/tar.gz/${hash}` },
      pins
    ).length
  )
  assert.ok(
    errorsFor(
      workspace,
      { version: "git+https://github.com/heavyai/example.git#abc" },
      pins
    ).length
  )
})
