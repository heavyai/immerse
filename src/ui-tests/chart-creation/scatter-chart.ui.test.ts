// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createChart,
  createDashboard,
  saveDashboard,
  deleteDashboard,
  expectLegendItems,
  processPause,
  saveChart,
  clickAfterVisible,
  waitForCrossfilter,
  getMapRect
} from "../utils"

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

    const countries = [
      "US",
      "BR",
      "ID",
      "AR",
      "TR",
      "GB",
      "JP",
      "MY",
      "ES",
      "PH",
      "FR",
      "SA",
      "TH",
      "RU",
      "MX",
      "CO",
      "IT",
      "PT",
      "CA",
      "UY",
      "CL",
      "IN",
      "NL",
      "ZA",
      "VE",
      "EG",
      "AU",
      "EC",
      "SG",
      "DE",
      "IE",
      "UA",
      "PY",
      "SE",
      "AE",
      "KW",
      "NG",
      "DO",
      "PL",
      "PR",
      "PE",
      "BY",
      "BE",
      "GT",
      "KR",
      "PK",
      "CR",
      "PA",
      "LV",
      "JO",
      "IL"
    ]
    await expectLegendItems(countries)

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

    // Wait for crossfilter to settle
    await waitForCrossfilter()

    const newCountSelectedEl = await page.$(countSelector)
    const newCountSelectedText = await page.evaluate(
      (el) => el.textContent,
      newCountSelectedEl
    )
    const newCountSelected = Number(newCountSelectedText.split(",").join(""))

    expect(newCountSelected).toBeGreaterThan(0)
    expect(newCountSelected).toBeLessThan(countSelected)

    const dashboardName = await saveDashboard("ui-test/create-scatter-chart")

    // Wait for crossfilter to settle
    await waitForCrossfilter()

    await expect(page).not.toMatchElement('[role="alertdialog"]')
    await expect(page).toMatchElement(chartCanvas)

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

    await deleteDashboard(dashboardName)
  })
})
