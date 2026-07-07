// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export {}

xdescribe("Vega bar chart with existing dashboard filter placeholder", () => {
  xit("Test placeholder", () => {
    expect(true).toBe(true)
  })
})

import {
  createDashboard,
  saveChart,
  processPause,
  createVegaChart
} from "../../utils"
import { createDashboardFilter } from "../../utils/filter-panel"

describe("Vega bar chart with existing dashboard filter", () => {
  it("Renders correctly with an existing dashboard filter", async () => {
    await createDashboard("ui-test/create-vega-combo-chart")

    // We need to create a chart before applying a dashboard filter
    await createVegaChart("vega-combo", {
      dataSource: "flights_donotmodify",
      dimensions: ["uniquecarrier"],
      measures: ["airtime"]
    })
    await saveChart()
    await processPause(1)

    await createDashboardFilter("flightnum", 7720)
    await expect(page).toClick(".filter-operator-selector > .operator")
    await expect(page).toClick(
      "[data-testid='filter-component-dropdown-menu-=']"
    )

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
