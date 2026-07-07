// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export {}

xdescribe("Vega Bar chart filtering placeholder", () => {
  xit("Test placeholder", () => {
    expect(true).toBe(true)
  })
})

import {
  createChart,
  createDashboard,
  waitForCrossfilter,
  waitForVisible,
  saveChart,
  processPause,
  createVegaChart
} from "../../utils"
import { waitUntilHTMLRendered } from "../../utils/recorder"
import { createDashboardFilter } from "../../utils/filter-panel"

describe("Vega Bar chart filtering", () => {
  beforeAll(async () => {
    await createDashboard("ui-test/create-vega-combo-chart")

    // We use two columns that make it easy to verify discrete-value crossfilters,
    // because they represent the same set of unique values (airline carriers)
    await createVegaChart("vega-combo", {
      dataSource: "flights_donotmodify",
      dimensions: ["uniquecarrier"],
      measures: ["airtime"]
    })
    await saveChart()

    await createChart("pie", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"],
      measures: ["# Records"]
    })
    await saveChart()

    await Promise.all([
      waitForVisible(".chart-type-vega-combo .vega-container"),
      waitForVisible(".chart-type-pie .pie-wrapper")
    ])

    // Wait for chart queries to finish
    await waitForCrossfilter()
  })

  afterEach(async () => {
    await page.keyboard.down("Alt")
    await expect(page).toClick("#dashboard-clear-cross-filters")
    await page.keyboard.up("Alt")

    // Wait for chart queries to finish
    await waitForCrossfilter()
  })

  it("Accepts an incoming crossfilter", async () => {
    // Click on 'Southwest Airlines' on pie chart (corresponding to 'WN' uniquecarrier)
    await expect(page).toClick(".pie-wrapper > .pie-slice._0")

    // Wait for the queries to settle
    await waitForCrossfilter()

    // Wait for the HTML to settle (renders not firing for about half a second)
    await waitUntilHTMLRendered(page)
    await processPause()

    // This should be the only bar left now
    await expect(page).toMatchElement(
      ".chart-type-vega-combo .vega-container",
      { text: "WN" }
    )

    // This one was visible on the chart at first but should not be now
    await expect(page).not.toMatchElement(
      ".chart-type-vega-combo .vega-container",
      {
        text: "AA"
      }
    )
  })

  it("Sends an outgoing crossfilter", async () => {
    // Click one of the bars
    await expect(page).toClick(
      "div.vega-wrapper g.mark-group.barChart > g:nth-child(1) > g > g > path"
    )

    // Wait for the queries to settle
    await waitForCrossfilter()

    // Wait for the HTML to settle (renders not firing for about half a second)
    await waitUntilHTMLRendered(page)
    await processPause()

    // Pie chart should now only have one slice for the clicked airline
    const pieSlices = await page.$$(".pie-wrapper > .pie-slice")
    await expect(pieSlices.length).toEqual(1)
  })

  it("Receives a new incoming dashboard filter", async () => {
    await createDashboardFilter("flightnum", 7720)
    await expect(page).toClick(".filter-operator-selector > .operator")
    await expect(page).toClick(
      "[data-testid='filter-component-dropdown-menu-=']"
    )

    // Wait for the queries to settle
    await waitForCrossfilter()

    // Wait for the HTML to settle (renders not firing for about half a second)
    await waitUntilHTMLRendered(page)
    await processPause()

    // This should be the only bar left now
    await expect(page).toMatchElement(
      ".chart-type-vega-combo .vega-container",
      { text: "XE" }
    )

    // This one was visible on the chart at first but should not be now
    await expect(page).not.toMatchElement(
      ".chart-type-vega-combo .vega-container",
      {
        text: "AA"
      }
    )
  })
})
