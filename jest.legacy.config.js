// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Deliberate opt-in for previously unselected tests. Do not silently enable
// these in the default suite before reviewing the failure inventory.
const config = require("./jest.config")
module.exports = {
  ...config,
  projects: [
    {
      ...config.projects[0],
      displayName: "LEGACY",
      testMatch: [
        "<rootDir>/src/**/*.unit.spec.js",
        "<rootDir>/src/**/*.unit.spec.ts"
      ]
    }
  ]
}
