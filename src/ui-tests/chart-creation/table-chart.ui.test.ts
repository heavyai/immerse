// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createChart,
  createDashboard,
  expectContainsText,
  saveChart,
  waitForVisible,
  setInputText,
  clickAfterVisible
} from "../utils"

describe("Table chart", () => {
  xit("Creates and renders a Table chart", async () => {
    await createDashboard("ui-test/create-table-chart")
    await createChart("table", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"],
      measures: ["# Records", { type: "custom", value: "avg(airtime)" }]
    })
    await expectContainsText(".table-sort span", "carrier_name")

    await saveChart()

    await waitForVisible(".docked-table-header")

    await expectContainsText(
      ".docked-table-header > div:nth-child(1) span",
      "carrier_name"
    )
    await expectContainsText(
      ".docked-table-header > div:nth-child(2) span",
      "# Records"
    )
    await expectContainsText(
      ".docked-table-header > div:nth-child(3) span",
      "Custom measure"
    )

    await page.click("table > tr:nth-child(3) td")
    await waitForVisible("table > tr.selected")
    const selectedRows = await page.$$("table > tr.selected")
    const deselectedRows = await page.$$("table > tr.deselected")

    expect(selectedRows.length).toBe(1)
    expect(deselectedRows.length).toBeGreaterThan(selectedRows.length)
  })

  it("Converts a Table chart to Number chart", async () => {
    await createDashboard("ui-test/convert-table-to-number")
    await createChart("table", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: ["airtime"]
    })
    await expect(page).toMatchElement(".number-btn.chart-btn-enabled")

    await page.click(".number-btn")
    await waitForVisible(".available-without-select")

    await expectContainsText(".available-without-select", "None Required")
    await expect(page).toMatchElement(".number-btn.chart-btn-selected")
  })

  it("Sets a filter on a Table chart that has an ungrouped numerical measure", async () => {
    const addChartLevelFilter =
      '[data-testid="chart-editor-add-prefilter-button"]'
    const columnSelector = '[data-testid="data-table-row"]'
    const filterComponentInput =
      '[data-testid="filter-component-data-expression"]'
    const filterValueInput = '[data-testid="filter-component-input-value"]'

    await createDashboard("ui-test/convert-table-to-number")
    await createChart("table", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: ["airtime"]
    })

    await page.click(addChartLevelFilter)

    await waitForVisible(columnSelector)
    await setInputText(filterComponentInput, "airtime")

    await page.click(columnSelector)

    await waitForVisible(filterValueInput)
    await setInputText(filterValueInput, "50")

    await saveChart()

    await clickAfterVisible("table > tr:nth-child(2) td")

    await expectContainsText(".count-selected", "67,280")

    await expect(page).toMatchElement('td[class="filtered cell-align-left"]')
    await expect(page).toMatchElement('[class="unfilter-btn"]')

    const filterCount = await page.evaluate(
      () =>
        document.querySelector('span[class="filter-set-item__filter-count"]')
          .innerText
    )
    expect(filterCount).toBe(" (1)")

    await expect(page).not.toMatchElement("table > tr.deselected")
  })
})
