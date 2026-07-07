// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clearDashboards,
  createDashboard,
  deleteDashboard,
  findDashboard,
  loadDashboard,
  saveDashboard
} from "./utils"
import { expectDashboardTitleInputToMatch } from "./utils/expect"

describe("Dashboard Utils", () => {
  // TODO: Remove commonly named dashboard clearing,
  // uniquely name dashboards in this test suite
  beforeAll(async () => await clearDashboards("ui-tests"))

  it("createDashboard util should route to new /dashboard page", async () => {
    const dashboardName = await createDashboard("ui-tests/new-dashboard")
    await expectDashboardTitleInputToMatch(dashboardName)
    expect(new URL(page.url()).pathname).toEqual("/mapd/dashboard")
  })

  it("createDashboard util should title the dashboard", async () => {
    const dashboardName = await createDashboard("ui-tests/new-dashboard")

    await expectDashboardTitleInputToMatch(dashboardName)
  })

  it("deleteDashboard util should delete a created dashboard", async () => {
    const dashboardName = await createDashboard("ui-tests/dashboard-to-delete")
    await saveDashboard()

    await deleteDashboard(dashboardName)

    const dashboardNotFound = (await findDashboard(dashboardName)) === null

    expect(dashboardNotFound).toBe(true)
  })

  it("loadDashboard util should load a created dashboard", async () => {
    const dashboardName = await createDashboard("ui-tests/dashboard-to-load")
    await saveDashboard()

    await loadDashboard(dashboardName)

    expect(new URL(page.url()).pathname).not.toEqual("/dashboard")

    await expectDashboardTitleInputToMatch(dashboardName)

    await deleteDashboard(dashboardName)
  })
})
