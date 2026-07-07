// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Page, expect } from "@playwright/test"
import { BASE_TEST_URL } from "../../utils/common"
import {
  DASHBOARD_TITLE_INPUT_ID,
  DASHBOARD_TITLE_PLACEHOLDER_ID
} from "../../../constants/dashboards"
import { waitForThriftResponse } from "./common"

export async function inputDashboardTitle(
  page: Page,
  name: string,
  addTimestamp = true
): Promise<string> {
  const fuzzedDashboardName = addTimestamp
    ? `${name}/${new Date().toISOString()}`
    : name
  await page.getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID).click()
  await page.getByTestId(DASHBOARD_TITLE_INPUT_ID).fill(fuzzedDashboardName)
  await page.getByTestId(DASHBOARD_TITLE_INPUT_ID).press("Enter")

  return fuzzedDashboardName
}
export async function createDashboard(
  page: Page,
  name = "ui-test-dashboard",
  addTimestamp = true
): Promise<string> {
  await page.goto("/dashboard")
  await page.waitForSelector(
    `[data-testid="${DASHBOARD_TITLE_PLACEHOLDER_ID}"]`
  )
  if (name) {
    const fuzzedDashboardName = await inputDashboardTitle(
      page,
      name,
      addTimestamp
    )
    // eslint-disable-next-line no-console
    console.log("Created dashboard: ", fuzzedDashboardName)
    return fuzzedDashboardName
  } else {
    // eslint-disable-next-line no-console
    console.log("Created a dashboard, but didn't save.")
    return ""
  }
}
export async function deleteDashboard(page: Page, dashboardName: string) {
  await page.goto(BASE_TEST_URL)
  await searchDashboardList(page, dashboardName)
  const dashboardItem = await page.waitForSelector(
    `.dashboard-name[title="${dashboardName}"]`
  )
  await expect(dashboardItem).toBeDefined()

  const dashboardActionMenuSelector = `.dashboard-action-menu-button[data-dashboard-name="${dashboardName}"]`
  const dashboardActionDeleteSelector = `.dashboard-action-delete-button[data-dashboard-name="${dashboardName}"]`
  const dashboardDeleteConfirmSelector =
    ".mdc-dialog .mdc-dialog__actions .mdc-button--unelevated"

  dashboardItem.hover()
  await page.locator(dashboardActionMenuSelector).click()
  await page.locator(dashboardActionDeleteSelector).click()
  await page.locator(dashboardDeleteConfirmSelector).click()

  await waitForThriftResponse(page, "delete_dashboard")

  return page.getByTestId("no-search-results")
}

export async function pressSaveDashboardButton(page: Page) {
  await page.getByTestId("save-dashboard-button").click()
  return await page.waitForSelector(
    '.success[data-testid="save-dashboard-button"]'
  )
}

export async function saveDashboard(page: Page, name = "") {
  if (name) {
    await page.getByTestId("save-dashboard-button").click()
    await page.waitForSelector('.success[data-testid="save-dashboard-button"]')
    // eslint-disable-next-line no-console
    console.log("Saved dashboard: ", name)
    return name
  } else {
    await pressSaveDashboardButton(page)
    // eslint-disable-next-line no-console
    console.log("Saved dashboard.")
    return ""
  }
}

export async function searchDashboardList(page: Page, dashboardName: string) {
  await page.type('[data-testid="dashboard-search-bar-field"]', dashboardName, {
    delay: 50
  })
}
