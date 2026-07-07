// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createDashboard,
  deleteDashboard,
  getTestUrl,
  goToDashboardList,
  saveDashboard
} from "./utils"
import { expectDashboardTitleInputToMatch } from "./utils/expect"

describe("Sessionization", () => {
  it("maintains session on dashboard list refresh", async () => {
    await goToDashboardList()

    await page.reload()

    await expect(page).toMatchElement(".dashboards-container")
  })

  it("maintains session on dashboard refresh and navigates directly to a saved dashboard ", async () => {
    const dashboardName = await createDashboard(
      "ui-tests/sessionization-dashboard"
    )
    await saveDashboard()

    await expectDashboardTitleInputToMatch(dashboardName)

    await page.reload({
      waitUntil: "networkidle0"
    })

    await expectDashboardTitleInputToMatch(dashboardName)

    const dashboardUrl = page.url()

    await page.goto(dashboardUrl, { waitUntil: "networkidle0" })

    await expectDashboardTitleInputToMatch(dashboardName)

    await deleteDashboard(dashboardName)
  })

  it("redirects to page requested after connection", async () => {
    await page.goto(getTestUrl("sql-editor"), { waitUntil: "networkidle0" })
    await expect(page).toMatchTextContent("SQL Editor")
  })

  it("should show 'New Dashboard' button with createDashboard privilege", async () => {
    await page.goto(getTestUrl(""), { waitUntil: "networkidle0" })
    await expect(page).toMatchTextContent("New Dashboard")
  })
})
