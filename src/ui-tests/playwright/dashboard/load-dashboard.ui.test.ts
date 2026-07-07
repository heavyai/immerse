// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from "@playwright/test"

test.beforeEach(({ page }) => {
  page.goto("/dashboard/66666666666666")
})

test.describe("Load Dashboard", () => {
  test("should show an error message if the dashboard doesn't exist", async ({
    page
  }) => {
    await page.waitForSelector(".mdc-dialog--open.mdc-dialog")
    await expect(page.getByTestId("app-overlay")).toBeDefined()
  })

  test("should show the dashboard list after you close the error message", async ({
    page
  }) => {
    const button = page.getByText("Ok")
    await button.click()
    await expect(page.getByTestId("dashboards-list")).toBeDefined()
  })
})
