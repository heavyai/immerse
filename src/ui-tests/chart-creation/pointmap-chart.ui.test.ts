// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createChart,
  createDashboard,
  expectContainsText,
  expectLegendItems,
  processPause,
  waitForVisible,
  waitForCrossfilter,
  saveChart,
  getMapRect
} from "../utils"

describe("Pointmap chart", () => {
  it("Creates a Pointmap chart", async () => {
    await createDashboard("ui-test/create-pointmap-chart")
    await createChart("pointmap", {
      dataSource: "tweets_nov_feb",
      dimensions: [],
      measures: ["lon", "lat", "followees", "country"]
    })
    await processPause(3)
    await expect(page).toMatchElement(".mapboxgl-canvas")

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
  })

  it("Applies a circle filter to the Pointmap, and it crossfilters", async () => {
    await createDashboard("ui-test/draw-filter-pointmap-chart")
    await createChart("pointmap", {
      dataSource: "tweets_nov_feb",
      dimensions: [],
      measures: ["lon", "lat"]
    })
    await processPause(3)
    await expect(page).toMatchElement(".mapboxgl-canvas")
    await saveChart()
    await processPause(1)

    // First get the current row count, according to the count widget
    const countSelectedEl = await page.$("#charttweets_nov_feb .count-selected")
    const countSelectedText = await page.evaluate(
      (el) => el.textContent,
      countSelectedEl
    )
    const countSelected = Number(countSelectedText.replace(",", ""))

    expect(countSelected).toBeGreaterThan(0)

    await page.click("button.heavyai-draw-button-circle")

    // Get the map container dimensions
    const { x, y, width, height } = await getMapRect()

    await page.mouse.move(x + width / 2, y + height / 3)
    await page.mouse.down()
    await page.mouse.move(x + width / 2, y + height / 2)
    await page.mouse.up()

    // Wait for crossfilter to settle
    await waitForCrossfilter()

    const newCountSelectedEl = await page.$(
      "#charttweets_nov_feb .count-selected"
    )
    const newCountSelectedText = await page.evaluate(
      (el) => el.textContent,
      newCountSelectedEl
    )
    const newCountSelected = Number(newCountSelectedText.replace(",", ""))

    expect(newCountSelected).toBeGreaterThan(0)
    expect(newCountSelected).toBeLessThan(countSelected)
  })

  it("Converts Pointmap to Choropleth", async () => {
    await createDashboard("ui-test/converts-pointmap-to-choropleth")
    await createChart("pointmap", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: ["dest_lon", "dest_lat"]
    })
    await expect(page).not.toMatchElement(
      ".backendChoropleth-btn.chart-btn-enabled"
    )

    await page.click(".backendChoropleth-btn")
    await waitForVisible(".error-msg")

    await expectContainsText(".error-msg", "Choropleth Requirements")
    await expectContainsText(
      ".error-msg ul li:first-of-type span",
      "Invalid geo measure"
    )
    await expectContainsText(
      ".measures-container>div:nth-child(1) .selector-label",
      "geo"
    )
    await expectContainsText(
      ".measures-container>div:nth-child(2) .selector-label",
      "color"
    )
    await expect(page).toMatchElement(
      ".measures-container>div:nth-child(1) .selector-pill.is-error"
    )
  })
})
