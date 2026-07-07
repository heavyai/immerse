// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export {}

xdescribe("Vega bar chart with existing crossfilter placeholder", () => {
  xit("Test placeholder", () => {
    expect(true).toBe(true)
  })
})

import {
  createChart,
  createDashboard,
  waitForVisible,
  saveChart,
  processPause,
  createVegaChart
} from "../../utils"

describe("Vega bar chart with existing crossfilter", () => {
  it("Renders correctly with an existing crossfilter", async () => {
    await createDashboard("ui-test/create-vega-combo-chart")

    await createChart("pie", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"],
      measures: ["# Records"]
    })
    await saveChart()
    await waitForVisible(".chart-type-pie .pie-wrapper")

    await expect(page).toClick(".pie-wrapper > .pie-slice._0")

    await processPause()
    await createVegaChart("vega-combo", {
      dataSource: "flights_donotmodify",
      dimensions: ["uniquecarrier"],
      measures: ["airtime"]
    })
    await saveChart()

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
})
