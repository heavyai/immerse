// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  createChart,
  createDashboard,
  deleteSelector,
  expectContainsText,
  waitForVisible
} from "../utils"

describe("Number chart", () => {
  it("Creates a Number chart", async () => {
    await createDashboard("ui-test/create-number-chart")
    await createChart("number", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: ["airtime"]
    })
    await waitForVisible(".available-without-select")

    await expectContainsText(".available-without-select", "None Required")
    await expectContainsText(".measures-container .selector-label", "value")
    await expectContainsText(".measures-container .selector-agg", "Avg")
    await expectContainsText(
      ".measures-container .selector-label-ellipse",
      "airtime"
    )

    await deleteSelector("measures", 1)
    await waitForVisible(".error-msg")
    await expectContainsText(".error-msg span", "Number Requirements")
    await expectContainsText(".error-msg ul li span", "value measure")
  })

  it("Creates a Number chart with aggregate measure", async () => {
    await createDashboard("ui-test/create-number-chart-agg")
    await createChart("number", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: [{ name: "airtime", aggregate: "Stddev" }]
    })

    await expectContainsText(".measures-container .selector-agg", "Stddev")
    await expectContainsText(
      ".measures-container .selector-label-ellipse",
      "airtime"
    )
  })

  it("Converts a Number chart to Pie chart", async () => {
    await createDashboard("ui-test/convert-number-to-row")
    await createChart("number", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: ["airtime"]
    })
    await expect(page).not.toMatchElement(".pie-btn.chart-btn-enabled")

    await page.click(".pie-btn")
    await waitForVisible(".error-msg")

    await expectContainsText(".error-msg span", "Pie Chart Requirements")
    await expectContainsText(".error-msg ul li span", "dimension")
  })

  it("Edits a Number chart", async () => {
    await createDashboard("ui-test/number-chart-editing")
    await createChart("number", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: ["taxiout"]
    })
    await clickAfterVisible(".measures-container > .selector-pill-wrapper")
    await expect(page).toMatchElement(".measure-settings")

    await clickAfterVisible(".dimensions-container > div:nth-child(1)")
    await expect(page).not.toMatchElement(
      ".dimensions-container > .selector-pill-wrapper > .react-popover"
    )
  })
})
