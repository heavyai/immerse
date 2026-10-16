// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createChart,
  createDashboard,
  deleteDashboard,
  saveDashboard,
  expectLegendItems,
  processPause,
  saveChart,
  clickAfterVisible,
  waitForVisible,
  getMapRect
} from "../utils"
import { TWEETS_2017_MAY_COUNTRY_LEGEND } from "../fixtures/tweets-2017-may-country-legend"

describe("Scatter chart", () => {
  it("Applies a lasso filter to the Scatter chart, and it crossfilters and doesn't error on dash reload", async () => {
    await createDashboard()
    await createChart("backendScatter", {
      dataSource: "tweets_nov_feb",
      dimensions: [],
      measures: ["lon", "lat", "followees", "country"]
    })
    await processPause(3)

    const chartCanvas = ".webgl-canvas"
    await expect(page).toMatchElement(chartCanvas)

    await expectLegendItems(TWEETS_2017_MAY_COUNTRY_LEGEND)

    await saveChart()

    await processPause(1)

    // First get the current row count, according to the count widget
    const countSelector = ".count-selected"
    const countSelectedEl = await page.$(countSelector)
    const countSelectedText = await page.evaluate(
      (el) => el.textContent,
      countSelectedEl
    )
    const countSelected = Number(countSelectedText.split(",").join(""))

    expect(countSelected).toBeGreaterThan(0)

    const lassoFilterButton = "button.heavyai-draw-button-lasso"
    await clickAfterVisible(lassoFilterButton)

    // Get the chart container dimensions and set a lasso filter
    const { x, y, width, height } = await getMapRect(chartCanvas)

    await page.mouse.move(x + width / 2, y + height / 3)
    await page.mouse.down()
    await page.mouse.move(x + width / 2, y + height / 2)
    await page.mouse.move(x + width / 2, y + height / 3)
    await page.mouse.move(x + width / 3, y + height / 3)
    await page.mouse.move(x + width / 3, y + height / 2)
    await page.mouse.move(x + width / 2, y + height / 2)
    await page.mouse.up()

    await page.waitForFunction(
      (selector, previousCount) => {
        const count = document.querySelector(selector)?.textContent
        const value = Number(count?.replace(/,/g, ""))
        return value > 0 && value < previousCount
      },
      {},
      countSelector,
      countSelected
    )
    await processPause()

    const newCountSelectedEl = await page.$(countSelector)
    const newCountSelectedText = await page.evaluate(
      (el) => el.textContent,
      newCountSelectedEl
    )
    const newCountSelected = Number(newCountSelectedText.split(",").join(""))

    expect(newCountSelected).toBeGreaterThan(0)
    expect(newCountSelected).toBeLessThan(countSelected)

    const dashboardName = await saveDashboard("ui-test/create-scatter-chart")

    await waitForVisible(chartCanvas)
    await page.waitForFunction(
      (selector, expectedCount) => {
        const count = document.querySelector(selector)?.textContent
        return Number(count?.replace(/,/g, "")) === expectedCount
      },
      {},
      countSelector,
      newCountSelected
    )
    await expect(page).not.toMatchElement('[role="alertdialog"]')

    const finalCountSelectedEl = await page.$(countSelector)
    const finalCountSelectedText = await page.evaluate(
      (el) => el.textContent,
      finalCountSelectedEl
    )
    const finalCountSelected = Number(
      finalCountSelectedText.split(",").join("")
    )
    expect(finalCountSelected).toBeGreaterThan(0)
    expect(finalCountSelected).toBe(newCountSelected)

    // Deleting from the active dashboard page destroys the GPU chart while its
    // final overlay may still be completing. Use the same authenticated browser
    // context for cleanup without navigating away from the chart under test.
    const cleanupPage = await page.browserContext().newPage()
    try {
      await deleteDashboard(dashboardName, cleanupPage)
    } finally {
      await cleanupPage.close()
    }
  })
})
