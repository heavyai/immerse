// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { clickAfterVisible, clickByText, waitForVisible } from "./common"
import { expectContainsText } from "./expect"

export const openFilterPanel = async () => {
  await waitForVisible("[data-testid='filter-panel-handle']")
  const filterPanelIsOpen = await page.$(".filter-panel")
  if (!filterPanelIsOpen) {
    await page.click("[data-testid='filter-panel-handle']")
  }
  return await waitForVisible(".filter-panel")
}

export const switchFilterPanelToFiltersView = async () => {
  await openFilterPanel()
  return await page.click("[data-testid='filter-panel-mode-filters']")
}

export const switchFilterPanelToCohortBuilderView = async () => {
  await openFilterPanel()
  return await clickAfterVisible(
    "[data-testid='filter-panel-mode-cohort-builder']"
  )
}

const createIncompleteGlobalFilter = async (column = "flight_month") => {
  await openFilterPanel()
  await switchFilterPanelToFiltersView()

  // click "Add dashboard filter" button
  await clickAfterVisible("[data-testid='add-dashboard-filter-button']")
  await waitForVisible("[data-testid='filter-column-editor']")
  await clickByText(column)

  // there should now be a filter component present
  return await waitForVisible("[data-testid='filter-component']")
}

// Limited to numerical types for now
export const createDashboardFilter = async (
  column = "flight_month",
  value = 12
) => {
  await createIncompleteGlobalFilter(column)

  // select the filter component input, clear the contents, then insert a value
  await page.focus("[data-testid='filter-component-input-value']")
  await page.keyboard.press("End")
  await page.keyboard.press("Backspace")
  await page.keyboard.type(String(value))
  return await page.keyboard.press("Enter")
}

export const editSimpleFilter = async (column = "flight_month", value = 10) => {
  const input = await page.$(
    `[data-testid="simple-filter-input-field-${column}"]`
  )
  await input.click({
    clickCount: 3
  })
  await input.press("Backspace")
  await page.keyboard.type(String(value))
  return await page.keyboard.press("Enter")
}

export const clickApplyButton = async () =>
  await page.click('[data-testid="custom-sql-manager-apply"]')

export const enterCohortBuildingMode = async (cohortDimension) => {
  // switch the filter panel to Cohort Builder mode
  await switchFilterPanelToCohortBuilderView()
  await waitForVisible(".cohort-builder")
  // Select uniquecarrier as our filter column
  await clickByText(cohortDimension)
  // Click apply
  await page.click('[data-testid="cohort-builder-apply"]')
  await expect(page).toMatchElement(".cohort-dimension")
  return await expectContainsText(".cohort-dimension-title", cohortDimension)
}

export const saveCohortName = async (cohortName) => {
  await page.click('[data-testid="cohort-name-modal-input"]')
  await page.keyboard.type(String(cohortName))
  return await page.click('[data-testid="cohort-name-modal-save-apply"]')
}
