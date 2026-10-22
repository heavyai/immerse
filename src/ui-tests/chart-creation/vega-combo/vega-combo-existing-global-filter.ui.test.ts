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
  createVegaChart,
  waitForCrossfilter,
  waitForVisible
} from "../../utils"
import { createDashboardFilter } from "../../utils/filter-panel"

const chartSelector = ".chart-type-vega-combo .vega-container"
const browserDiagnostics: string[] = []

const captureConsoleError = (message) => {
  if (["error", "warn"].includes(message.type())) {
    browserDiagnostics.push(`[console:${message.type()}] ${message.text()}`)
  }
}

const capturePageError = (error) => {
  browserDiagnostics.push(`[pageerror] ${error.stack || error.message}`)
}

async function waitForVegaText(text: string, state: string) {
  try {
    await page.waitForFunction(
      (selector, expectedText) =>
        document.querySelector(selector)?.textContent?.includes(expectedText),
      { timeout: 15000 },
      chartSelector,
      text
    )
  } catch (error) {
    const diagnostics = await page.evaluate((selector) => {
      const filterInput = document.querySelector<HTMLInputElement>(
        "[data-testid='filter-component-input-value']"
      )
      return {
        chartText: document.querySelector(selector)?.textContent,
        filterValue: filterInput?.value,
        operator: document.querySelector(
          ".filter-operator-selector > .operator"
        )?.textContent
      }
    }, chartSelector)

    throw new Error(
      `Vega chart did not contain ${JSON.stringify(text)} in ${state} state. ` +
        `Diagnostics: ${JSON.stringify(diagnostics)}. ` +
        `Browser errors: ${JSON.stringify(browserDiagnostics)}. ` +
        `${error instanceof Error ? error.message : String(error)}`
    )
  }
}

describe("Vega bar chart with existing dashboard filter", () => {
  beforeEach(() => {
    browserDiagnostics.length = 0
    page.on("console", captureConsoleError)
    page.on("pageerror", capturePageError)
  })

  afterEach(() => {
    page.off("console", captureConsoleError)
    page.off("pageerror", capturePageError)
  })

  it("Renders correctly with an existing dashboard filter", async () => {
    await createDashboard("ui-test/create-vega-combo-chart")

    // We need to create a chart before applying a dashboard filter
    await createVegaChart("vega-combo", {
      dataSource: "flights_donotmodify",
      dimensions: ["uniquecarrier"],
      measures: ["airtime"]
    })
    await saveChart()
    await waitForVisible(chartSelector)
    await waitForCrossfilter()

    // Confirm the unfiltered chart has completed its initial render before
    // creating a filter that should remove this carrier.
    await waitForVegaText("AA", "unfiltered")

    await createDashboardFilter("flightnum", 5849, "=")
    await waitForCrossfilter()
    await waitForVegaText("9E", "filtered")

    // This carrier has rows for flight 5849 in the restored CI fixture.
    await expect(page).toMatchElement(chartSelector, { text: "9E" })

    // This one was visible on the chart at first but should not be now
    await expect(page).not.toMatchElement(chartSelector, { text: "AA" })
  })
})
