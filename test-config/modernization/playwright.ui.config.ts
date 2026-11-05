// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from "@playwright/test"
export default defineConfig({
  testDir: ".",
  testMatch: "ui-primitives.spec.ts",
  timeout: 60000,
  workers: 1,
  outputDir: "../../test-results/ui-primitives",
  reporter: [
    ["line"],
    ["json", { outputFile: "../../test-results/ui-primitives/report.json" }]
  ],
  use: {
    baseURL: "http://127.0.0.1:8003",
    headless: true,
    viewport: { width: 1000, height: 700 },
    trace: "retain-on-failure"
  },
  webServer: {
    command: "pnpm run test:ui:serve",
    url: "http://127.0.0.1:8003",
    timeout: 120000,
    reuseExistingServer: false
  }
})
