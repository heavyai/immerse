// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createChart,
  createDashboard,
  expectContainsText,
  waitForVisible,
  saveChart
} from "../utils"

describe("Heat chart", () => {
  it("Creates and renders a Heat chart", async () => {
    await createDashboard("ui-test/creates-heat-chart")
    await createChart("heat", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name", "arrtime"],
      measures: ["# Records"]
    })
    await saveChart()

    await expect(page).toMatchElement("g.heatmap g.box-wrapper g.box-group")
  })

  it("Converts Heat to Pie Chart", async () => {
    await createDashboard("ui-test/converts-heat-to-histogram")
    await createChart("heat", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: ["airtime"]
    })
    await expect(page).not.toMatchElement(".pie-btn.chart-btn-enabled")

    await page.click(".pie-btn")
    await waitForVisible(".error-msg")

    await expectContainsText(".error-msg span", "Pie Chart Requirements")
    await expectContainsText(".error-msg ul li:first-of-type span", "dimension")
    await expectContainsText(
      ".measures-container>div:nth-child(1)>div.selector-pill .button.selector-label",
      "size"
    )
    await expectContainsText(
      ".measures-container>div:nth-child(1)>div.selector-pill .selector-box.button span.selector-label-ellipse",
      "airtime"
    )
  })
})
