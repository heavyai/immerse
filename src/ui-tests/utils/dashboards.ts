// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  getTestUrl,
  BASE_TEST_URL,
  processPause
} from "./common"
import { DASHBOARD_TITLE_PLACEHOLDER_ID } from "../../constants/dashboards"
import { Page } from "@playwright/test"

export async function clearDashboards(dashboardSubstring: string) {
  const firstDashboardInList = "#dashboards-list .row-item:first-of-type"
  const firstDashboardMenu = "[data-testid='dashboard-menu-0']"
  const firstDashboardActionMenu = `${firstDashboardMenu} .dashboard-action-menu-button`
  const firstDashboardActionDelete = `${firstDashboardMenu} .dashboard-action-delete-button`
  const dashboardDeleteConfirm =
    ".mdc-dialog .mdc-dialog__actions .mdc-button--unelevated"

  await goToDashboardList()
  await searchDashboardList(dashboardSubstring)
  await processPause()

  let dashboardListed = await page.$(firstDashboardInList)

  while (dashboardListed !== null) {
    await page.hover(firstDashboardMenu)
    await clickAfterVisible(firstDashboardActionMenu)
    await clickAfterVisible(firstDashboardActionDelete)
    await clickAfterVisible(dashboardDeleteConfirm)
    await processPause()

    dashboardListed = await page.$(firstDashboardInList)
  }

  return await processPause()
}

export async function inputDashboardTitle(
  dashboardName: string,
  fuzzDashboardName = true
): Promise<string> {
  const fuzzedDashboardName = fuzzDashboardName
    ? `${dashboardName}/${new Date().toISOString()}`
    : dashboardName
  const placeholderSelector = `[data-testid='${DASHBOARD_TITLE_PLACEHOLDER_ID}']`

  await page.waitForSelector(placeholderSelector)
  await page.click(placeholderSelector)

  await page.keyboard.type(fuzzedDashboardName)
  await page.keyboard.press("Enter")
  await processPause()

  return fuzzedDashboardName
}

export async function inputDashboardTitlePlaywright(
  page: Page,
  name: string,
  addTimestamp = true
): Promise<string> {
  const fuzzedDashboardName = addTimestamp
    ? `${name}/${new Date().toISOString()}`
    : name

  const title = await page.getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID)
  await title.focus()
  await title.click()

  await page
    .getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID)
    .fill(fuzzedDashboardName)
  await page.getByTestId(DASHBOARD_TITLE_PLACEHOLDER_ID).press("Enter")

  return fuzzedDashboardName
}

export async function createDashboardPlaywright(
  page: Page,
  name = "ui-test-dashboard",
  addTimestamp = true
): Promise<string> {
  await page.goto("/dashboard")
  await page.waitForSelector(
    `[data-testid="${DASHBOARD_TITLE_PLACEHOLDER_ID}"]`
  )
  if (name) {
    const fuzzedDashboardName = await inputDashboardTitlePlaywright(
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

export async function createDashboard(
  dashboardName = "",
  fuzzDashboardName = true
): Promise<string> {
  await page.goto(getTestUrl("dashboard"), { waitUntil: "networkidle0" })
  if (dashboardName) {
    const fuzzedDashboardName = await inputDashboardTitle(
      dashboardName,
      fuzzDashboardName
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

export async function findDashboard(dashboardName: string) {
  await processPause()
  return await page.$(`.dashboard-name[title="${dashboardName}"]`)
}

export async function goToDashboardList() {
  return await page.goto(BASE_TEST_URL, { waitUntil: "networkidle0" })
}

export async function loadDashboard(dashboardName: string) {
  await goToDashboardList()
  await searchDashboardList(dashboardName)
  const dashboardFound = (await findDashboard(dashboardName)) !== null
  if (dashboardFound) {
    return await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click(`.dashboard-name[title="${dashboardName}"]`)
    ])
  } else {
    throw new Error("Dashboard not found")
  }
}

export async function deleteDashboardPlaywright(
  page: Page,
  dashboardName: string
) {
  await page.goto(BASE_TEST_URL)
  await searchDashboardListPlaywright(page, dashboardName)
  await expect(
    page.waitForSelector(`.dashboard-name[title="${dashboardName}"]`)
  ).toBeDefined()

  const dashboardActionMenuSelector = `.dashboard-action-menu-button[data-dashboard-name="${dashboardName}"]`
  const dashboardActionDeleteSelector = `.dashboard-action-delete-button[data-dashboard-name="${dashboardName}"]`
  const dashboardDeleteConfirmSelector =
    ".mdc-dialog .mdc-dialog__actions .mdc-button--unelevated"

  await page.locator(dashboardActionMenuSelector).hover()
  await page.locator(dashboardActionMenuSelector).click()
  await page.locator(dashboardActionDeleteSelector).click()
  await page.locator(dashboardDeleteConfirmSelector).click()

  return page.getByTestId("no-search-results")
}

export async function deleteDashboard(dashboardName: string) {
  await goToDashboardList()
  await searchDashboardList(dashboardName)
  const dashboardFound = (await findDashboard(dashboardName)) !== null

  if (dashboardFound) {
    const dashboardActionMenuSelector = `.dashboard-action-menu-button[data-dashboard-name="${dashboardName}"]`
    const dashboardActionDeleteSelector = `.dashboard-action-delete-button[data-dashboard-name="${dashboardName}"]`
    const dashboardDeleteConfirmSelector =
      ".mdc-dialog .mdc-dialog__actions .mdc-button--unelevated"

    await page.hover(dashboardActionMenuSelector)
    await clickAfterVisible(dashboardActionMenuSelector)
    await clickAfterVisible(dashboardActionDeleteSelector)
    await clickAfterVisible(dashboardDeleteConfirmSelector)

    return await page.waitForSelector('[data-testid="no-search-results"]')
  } else {
    throw new Error("Dashboard not found")
  }
}

export async function pressSaveDashboardButton() {
  await clickAfterVisible('[data-testid="save-dashboard-button"]')
  return await page.waitForSelector(
    '.success[data-testid="save-dashboard-button"]'
  )
}

export async function saveDashboard(dashboardName = "") {
  if (dashboardName) {
    const fuzzedDashboardName = await inputDashboardTitle(dashboardName)
    // eslint-disable-next-line no-console
    console.log("Saved dashboard: ", fuzzedDashboardName)
    await pressSaveDashboardButton()
    return fuzzedDashboardName
  } else {
    await pressSaveDashboardButton()
    // eslint-disable-next-line no-console
    console.log("Saved dashboard.")
    return ""
  }
}

export async function saveDashboardPlaywright(page: Page, name = "") {
  if (name) {
    const fuzzedDashboardName = await inputDashboardTitlePlaywright(page, name)
    // eslint-disable-next-line no-console
    console.log("Saved dashboard: ", fuzzedDashboardName)

    const saveButton = page.getByTestId("save-dashboard-button")
    saveButton.click()
    await page.waitForSelector('.success[data-testid="save-dashboard-button"]')
    return fuzzedDashboardName
  } else {
    await pressSaveDashboardButton()
    // eslint-disable-next-line no-console
    console.log("Saved dashboard.")
    return ""
  }
}

export async function searchDashboardList(dashboardName: string) {
  // 50ms delay to type slower likes a user
  return await page.type(
    '[data-testid="dashboard-search-bar-field"]',
    dashboardName,
    {
      delay: 50
    }
  )
}

export async function searchDashboardListPlaywright(
  page: Page,
  dashboardName: string
) {
  await page.type('[data-testid="dashboard-search-bar-field"]', dashboardName, {
    delay: 50
  })
}
