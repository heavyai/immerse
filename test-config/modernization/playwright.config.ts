// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: ".",
  testMatch: "browser-baseline.spec.ts",
  timeout: 180000,
  workers: 1,
  retries: 0,
  outputDir: "../../test-results/modernization",
  reporter: [
    ["line"],
    ["json", { outputFile: "../../test-results/modernization/report.json" }]
  ],
  use: {
    baseURL: process.env.IMMERSE_TEST_URL || "http://127.0.0.1:8002",
    headless: true,
    viewport: { width: 1440, height: 960 },
    trace: "retain-on-failure"
  }
})
