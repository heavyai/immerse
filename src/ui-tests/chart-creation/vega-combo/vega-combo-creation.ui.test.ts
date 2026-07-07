// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export {}

xdescribe("Vega Bar chart creation placeholder", () => {
  xit("Test placeholder", () => {
    expect(true).toBe(true)
  })
})

import {
  createVegaChart,
  createDashboard,
  expectContainsText,
  selectChartDataSource,
  selectVegaDimension,
  selectVegaMeasureMulti,
  processPause,
  waitForVisible
} from "../../utils"

describe("Vega combo chart creation", () => {
  it("Creates a Vega Bar chart", async () => {
    await createDashboard("ui-test/create-vega-combo-chart")
    await createVegaChart("vega-combo", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"],
      measures: ["airtime"]
    })

    const dimensionInputValue = await page.evaluate(() => {
      const dimensionInput = document.querySelector(
        ".dimensions-container .selector-search-input input"
      )
      return dimensionInput ? dimensionInput.value : null
    })
    expect(dimensionInputValue).toBe("carrier_name")

    await expectContainsText(
      ".chart-editor-left-panel .measures-container .selector-sub-section .multi-select",
      "Average"
    )

    const measureInputValue = await page.evaluate(() => {
      const measureInput = document.querySelector(
        ".measures-container .selector-search-input input"
      )
      return measureInput ? measureInput.value : null
    })
    expect(measureInputValue).toBe("airtime")
  })

  xit("Creates a Vega bar chart with a color dimension", async () => {
    await createDashboard("ui-test/create-vega-combo-chart")
    await createVegaChart("vega-combo", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name", "dest"],
      measures: ["airtime"]
    })

    const baseDimensionInputValue = await page.evaluate(() => {
      const dimensionInput = document.querySelector(
        ".dimensions-container>div:nth-child(1) .selector-search-input input"
      )
      return dimensionInput ? dimensionInput.value : null
    })
    expect(baseDimensionInputValue).toBe("carrier_name")

    const colorDimensionInputValue = await page.evaluate(() => {
      const dimensionInput = document.querySelector(
        ".dimensions-container>div:nth-child(3) .selector-search-input input"
      )
      return dimensionInput ? dimensionInput.value : null
    })
    expect(colorDimensionInputValue).toBe("dest")

    await expectContainsText(
      ".chart-editor-left-panel .measures-container .selector-sub-section .multi-select",
      "Average"
    )

    const measureInputValue = await page.evaluate(() => {
      const measureInput = document.querySelector(
        ".measures-container .selector-search-input input"
      )
      return measureInput ? measureInput.value : null
    })
    expect(measureInputValue).toBe("airtime")

    await processPause(10)

    const numBarMarks = await page.$$(
      ".vega-container .mark-rect.role-mark.bar > path"
    )

    expect(numBarMarks.length).toEqual(97)
  })

  it("Creates a Vega bar chart with a binned numerical dimension", async () => {
    await createDashboard("ui-test/create-vega-combo-chart")
    await createVegaChart("vega-combo", {
      dataSource: "tweets_nov_feb",
      dimensions: ["followers"],
      measures: ["followees"]
    })

    const dimensionInputValue = await page.evaluate(() => {
      const dimensionInput = document.querySelector(
        ".dimensions-container .selector-search-input input"
      )
      return dimensionInput ? dimensionInput.value : null
    })
    expect(dimensionInputValue).toBe("followers")

    await expectContainsText(
      ".chart-editor-left-panel .measures-container .selector-sub-section .multi-select",
      "Average"
    )

    const measureInputValue = await page.evaluate(() => {
      const measureInput = document.querySelector(
        ".measures-container .selector-search-input input"
      )
      return measureInput ? measureInput.value : null
    })
    expect(measureInputValue).toBe("followees")

    await processPause(1)

    await expect(page).toMatchElement(
      ".chart-type-vega-combo .vega-container",
      { text: "12" }
    )
  })

  it("Creates a Vega bar chart with an unbinned numerical dimension", async () => {
    await createDashboard("ui-test/create-vega-combo-chart")
    await createVegaChart("vega-combo", {
      dataSource: "flights_donotmodify",
      dimensions: ["flight_month"],
      measures: ["airtime"]
    })

    const dimensionInputValue = await page.evaluate(() => {
      const dimensionInput = document.querySelector(
        ".dimensions-container .selector-search-input input"
      )
      return dimensionInput ? dimensionInput.value : null
    })
    expect(dimensionInputValue).toBe("flight_month")

    await expectContainsText(
      ".chart-editor-left-panel .measures-container .selector-sub-section .multi-select",
      "Average"
    )

    const measureInputValue = await page.evaluate(() => {
      const measureInput = document.querySelector(
        ".measures-container .selector-search-input input"
      )
      return measureInput ? measureInput.value : null
    })
    expect(measureInputValue).toBe("airtime")

    // toggle binning OFF
    await page.click(
      ".dimensions-container .selector-wrapper .selector-sub-section"
    )

    await waitForVisible(".numerical-bin-container")
    await waitForVisible(".numerical-bin-container .mdc-switch")
    await page.click(".numerical-bin-container .mdc-switch .mdc-switch__thumb")

    await processPause(1)

    await expect(page).toMatchElement(
      ".chart-type-vega-combo .vega-container",
      { text: "12" }
    )
  })

  it("Creates a Vega bar chart with multiple data layers", async () => {
    await createDashboard("ui-test/create-vega-combo-chart")
    await createVegaChart("vega-combo", {
      dataSource: "flights_donotmodify",
      dimensions: ["dest_state"],
      measures: ["airtime"]
    })

    await expect(page).toClick("[data-testid='add-data-layer-button']")

    await processPause(1)

    await selectChartDataSource("tweets_nov_feb", 2)
    await processPause()
    await selectVegaDimension(1, "state_abbr", 2)
    await processPause()
    await selectVegaMeasureMulti(1, "followers", 2)
    await processPause(3)

    const numBarMarks = await page.$$(
      ".vega-container .mark-rect.role-mark.bar > path"
    )

    // This is the number of base paths expected to appear for these two layers,
    // 52 rows from flights and 51 rows from tweets
    expect(numBarMarks.length).toEqual(103)
  })

  it("Creates a Vega bar chart with a binned date dimension", async () => {
    await createDashboard("ui-test/create-vega-combo-chart")
    await createVegaChart("vega-combo", {
      dataSource: "tweets_nov_feb",
      dimensions: ["join_time"],
      measures: ["followees"]
    })

    const dimensionInputValue = await page.evaluate(() => {
      const dimensionInput = document.querySelector(
        ".dimensions-container .selector-search-input input"
      )
      return dimensionInput ? dimensionInput.value : null
    })
    expect(dimensionInputValue).toBe("join_time")

    await expectContainsText(
      ".chart-editor-left-panel .measures-container .selector-sub-section .multi-select",
      "Average"
    )

    const measureInputValue = await page.evaluate(() => {
      const measureInput = document.querySelector(
        ".measures-container .selector-search-input input"
      )
      return measureInput ? measureInput.value : null
    })
    expect(measureInputValue).toBe("followees")

    await processPause(1)

    await expect(page).toMatchElement(
      ".chart-type-vega-combo .vega-container",
      { text: "12" }
    )
  })
})
