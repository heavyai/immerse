// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  createChart,
  createDashboard,
  expectContainsText,
  saveChart,
  setInputText,
  waitForHidden,
  waitForVisible
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

    const countSelector = ".count-selected"
    const cellSelector = "table > tr:nth-child(2) td"

    await waitForVisible(countSelector)
    await page.waitForFunction(
      (selector) => {
        const count = document.querySelector(selector)?.textContent
        return Number(count?.replace(/,/g, "")) > 0
      },
      {},
      countSelector
    )
    const initialCount = await page.$eval(countSelector, (element) =>
      Number(element.textContent?.replace(/,/g, ""))
    )
    const selectedCell = await page.$eval(
      cellSelector,
      (element) => element.textContent?.trim() || "<empty>"
    )

    await waitForHidden(".invisible-overlay")
    await waitForHidden(".selector-loading")
    await clickAfterVisible(cellSelector)

    try {
      await page.waitForFunction(
        (selector, previousCount) => {
          const count = document.querySelector(selector)?.textContent
          const value = Number(count?.replace(/,/g, ""))
          return value > 0 && value < previousCount
        },
        {},
        countSelector,
        initialCount
      )
    } catch (error) {
      const currentCount = await page.$eval(countSelector, (element) =>
        Number(element.textContent?.replace(/,/g, ""))
      )
      throw new Error(
        `Table row click did not reduce the selected count: ` +
          `before=${initialCount}, after=${currentCount}, cell=${JSON.stringify(
            selectedCell
          )}. ${error instanceof Error ? error.message : String(error)}`
      )
    }

    const filteredCount = await page.$eval(countSelector, (element) =>
      Number(element.textContent?.replace(/,/g, ""))
    )
    expect(filteredCount).toBeGreaterThan(0)
    expect(filteredCount).toBeLessThan(initialCount)

    await expect(page).toMatchElement("td.filtered.cell-align-left")
    await expect(page).toMatchElement(".unfilter-btn")

    const filterCount = await page.evaluate(
      () =>
        document.querySelector<HTMLElement>(".filter-set-item__filter-count")
          ?.innerText
    )
    expect(filterCount).toBe(" (1)")

    await expect(page).not.toMatchElement("table > tr.deselected")
  })
})
