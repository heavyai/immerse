// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Page, Response, expect } from "@playwright/test"
import { selectors as immerseSelectors } from "../ui-automation/selectors"

export async function setFeatureFlag(
  page: Page,
  featureFlag: string,
  value: any
) {
  await page.goto("/control-panel") // a page must be loaded in order to interact with localStorage
  await page.waitForSelector(".control-panel")
  const featureFlags = await page.evaluate(() => {
    return window.localStorage?.featureflags ?? false
  })
  if (featureFlags) {
    const featureFlagsParsed = JSON.parse(featureFlags)
    featureFlagsParsed[featureFlag] = value
    const featureFlagsJSON = JSON.stringify(featureFlagsParsed)
    await page.evaluate((featureFlagsJSONVal) => {
      window.localStorage.featureflags = featureFlagsJSONVal
    }, featureFlagsJSON)
  }
  return await page.reload({ waitUntil: "domcontentloaded" })
}

/**
 * Waits for a response from a call to a thrift method matching both the
 * thrift method name and the thrift response content type. Use this to
 * wait for any thrift RPC responses
 *
 * @param page Playwright page object
 * @param thriftMethod String name of the thrift method
 */
export function waitForThriftResponse(page: Page, thriftMethod: string) {
  return page.waitForResponse(async (response: Response) => {
    const body = await response.body()
    const contentType = await response.headerValue("content-type")
    return body.includes(thriftMethod) && contentType === "application/x-thrift"
  })
}

/**
 * Asserts a filtered and total count from the count chart.
 * Count chart reads "filtered of total", caller can make
 * assertions about the filtered and total if provided
 *
 * @param page - Playwright page object
 * @param count - Filtered count to expect
 * @param total - Total count to expect
 * @param options - index of the count chart if showing multi count
 */
export async function expectCountOf(
  page: Page,
  count: string,
  total: string | null = null,
  {
    index = 0 // If multi-count chart is displayed
  }: { index?: number } = {}
) {
  await expect(page.locator(".count-selected").nth(index)).toHaveText(count)
  if (total !== null) {
    await expect(page.locator(".count-all").nth(index)).toHaveText(total)
  }
}

/**
 *
 * @param page Playwright page object
 * @param chartId - Chart ID to get the wrapper for
 * @returns Playwright Locator object
 */
export async function getChartById(page: Page, chartId: string | number) {
  return await page.getByTestId(`chart${chartId}-wrapper`)
}

/**
 * Clicks the _chart_ zoom to filters button for a specific chart
 *
 * @param page - PLaywright page object
 * @param chartId - Chart id to click zoom to filters button on
 */
export async function zoomToChartFilters(page: Page, chartId: string | number) {
  const chart = await getChartById(page, chartId)
  await chart.locator(".ztf-overlay-container > .ztf-button").click()
}

/**
 * When editing a chart you can grab the chart ID from the url
 * this can be important when needing to  performing actions on
 * specific charts
 *
 * @param page - Playwright page object
 * @returns string chart ID pulled from the URL
 */
export function getChartIdFromPage(page: Page): string {
  const url = page.url()
  const chartIdRegex = new RegExp(".*/chart/(\\d+)/")
  const groups = url.match(chartIdRegex)
  return groups?.[1]
}

/**
 * Looks for text in a specific table chart and clicks the value
 * TODO: Take a column value as well.
 *
 * @param page Playwright page object
 * @param options - Provide the chart and column value to search for
 */
export async function selectTableCell(
  page: Page,
  { chartId, columnValue }: { chartId: string | number; columnValue: string }
) {
  const chart = await getChartById(page, chartId)
  await chart.getByText(columnValue).click()
}

/**
 * Uses the account panel to select the database provided
 *
 * @param page Playwright page object
 * @param database Database name to select from the list (matches exactly)
 */
export async function switchDatabase(page: Page, database: string) {
  await page.getByTestId(immerseSelectors.accountPanelButton).click()
  await page.locator(immerseSelectors.databaseSwitcher).click()
  await page
    .locator(immerseSelectors.databaseSwitcher)
    .getByText(database, {
      exact: true
    })
    .click()

  // Reload page when DB switched
  await page.waitForURL(`**/${database}/**`)
}
