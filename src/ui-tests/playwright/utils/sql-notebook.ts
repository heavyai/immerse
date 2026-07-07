// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Page } from "@playwright/test"

export function waitForAutoQuery(page: Page) {
  return page.waitForResponse("**/iq/auto/query**")
}

export function waitForQuery(page: Page) {
  return page.waitForResponse("**/iq/query**")
}

export function waitForAnswer(page: Page) {
  return page.waitForResponse("**/iq/answer**")
}

/**
 * Sets a vega chart multiselect ChartField to a value
 *
 * @param page - Playwright page object
 * @param measureName - The name of the measure to set (should === select box label)
 * @param targetFieldValue - The value to find and select in the dropdown list
 */
export const setChartField = async (
  page: Page,
  measureName: string,
  targetFieldValue: string
) => {
  await page.getByRole("combobox", { name: measureName }).click()
  await page.locator(".select__menu-list").getByText(targetFieldValue).click()
}
