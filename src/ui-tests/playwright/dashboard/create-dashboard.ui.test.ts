// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from "@playwright/test"
import { createDashboard, saveDashboard, deleteDashboard } from "../utils"

test.describe("Create Dashboard", () => {
  test("should show an error message if you attempt to create a dashboard that already exists", async ({
    page
  }) => {
    const DUPLICATE_DASHBOARD_NAME = `ui-test/duplicate-dashboard-name`

    const fuzzedName = await createDashboard(page, DUPLICATE_DASHBOARD_NAME)
    await saveDashboard(page, DUPLICATE_DASHBOARD_NAME)
    await page.getByTestId("dashboards-nav-link").click()
    await createDashboard(page, fuzzedName, false)
    await page.getByTestId("save-dashboard-button").click()

    const pageOverlay = page.getByTestId("app-overlay")
    expect(pageOverlay).toBeDefined()
    expect(page.getByTestId("app-overlay"))
    await expect(
      page.getByText(
        `Dashboard with name: ${DUPLICATE_DASHBOARD_NAME} already exists.`
      )
    ).toBeDefined()

    // Ensure this test can be run repeatedly
    await deleteDashboard(page, fuzzedName)

    // deleteDashboard works by searching for the dashboard name and deleting the search result.
    // This is an extra expect to make sure the dashboard is truly deleted and we don't leave
    // behind a trail of `ui-test/duplicate-dashboard-name-1482738228` etc
    await expect(page.getByTestId("no-search-results")).toBeDefined()
  })
})
