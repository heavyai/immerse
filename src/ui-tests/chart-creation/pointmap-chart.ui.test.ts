// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createChart,
  createDashboard,
  expectLegendItems,
  processPause,
  saveChart,
  getMapRect,
  waitForVisible
} from "../utils"
import { TWEETS_2017_MAY_COUNTRY_LEGEND } from "../fixtures/tweets-2017-may-country-legend"

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

    await expectLegendItems(TWEETS_2017_MAY_COUNTRY_LEGEND)
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
    const countSelector = ".count-selected"
    await waitForVisible(countSelector)
    const countSelected = await page.$eval(countSelector, (element) =>
      Number(element.textContent?.replace(/,/g, ""))
    )

    expect(countSelected).toBeGreaterThan(0)

    await page.click("button.heavyai-draw-button-circle")

    // Get the map container dimensions
    const { x, y, width, height } = await getMapRect()

    await page.mouse.move(x + width / 2, y + height / 3)
    await page.mouse.down()
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
    const newCountSelected = await page.$eval(countSelector, (element) =>
      Number(element.textContent?.replace(/,/g, ""))
    )

    expect(newCountSelected).toBeGreaterThan(0)
    expect(newCountSelected).toBeLessThan(countSelected)
  })

  it("Does not convert an incompatible Pointmap to Choropleth", async () => {
    await createDashboard("ui-test/converts-pointmap-to-choropleth")
    await createChart("pointmap", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: ["dest_lon", "dest_lat"]
    })
    await expect(page).not.toMatchElement(
      ".backendChoropleth-btn.chart-btn-enabled"
    )
    await expect(page).toMatchElement(".pointmap-btn.chart-btn-selected")
  })
})
