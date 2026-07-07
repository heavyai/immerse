// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from "@playwright/test"
import { createChart, createDashboard, setFeatureFlag } from "../utils"
import { asTestId, chartSelectors } from "../ui-automation/selectors"
import { datasets } from "../ui-automation/datasets"
import {
  saveChart,
  waitForMapboxChartLoad,
  waitForRenderVega
} from "../utils/charts"

test.describe("Zoom to filters", () => {
  test.beforeEach(async ({ page }) => {
    await setFeatureFlag(page, "ui/enable_zoom_to_filters", true)
  })
  test("Create line chart, zoom to various filters", async ({ page }) => {
    await createDashboard(page, "ui-test/zoom-to-filters")
    await createChart(page, "linemap", {
      dataSource: datasets.hurricaneTracks
    })
    await waitForMapboxChartLoad(page)
    // Screenshot initial load
    expect(await page.locator(".mapboxgl-canvas")).toHaveScreenshot()

    // Apply filter
    // TODO: Ripe for some utility-izing, but there are many filter types
    // to accomodate, save for a later date
    await page.getByText("+ Add filter").click()
    const nameColumn = await page.getByText("NAME", { exact: true })
    await nameColumn.scrollIntoViewIfNeeded()
    await nameColumn.click()
    await page.getByTestId("filter-component-input-value").type("NICOLE")
    await page.keyboard.press("Enter")
    await waitForRenderVega(page)

    await saveChart(page)
    await expect(
      await page.getByTestId(chartSelectors.chartContainer)
    ).toBeInViewport()
    await waitForRenderVega(page)

    // Zoom to filters
    await page.hover(`.chart-type-linemap ${asTestId("chart-title")}`)
    await page.click(".ztf-button")
    await page.waitForSelector(".mapboxgl-canvas")

    // I think this is calling the thrift endpoint during zoom... wait for a few responses
    await Promise.all([waitForRenderVega(page), waitForRenderVega(page)])
    await page.getByText("1000km") // Wait for zoom to finish

    await expect(await page.locator(".mapboxgl-canvas")).toHaveScreenshot()
  })

  test.afterEach(async ({ page }) => {
    await setFeatureFlag(page, "ui/enable_zoom_to_filters", false)
  })
})
