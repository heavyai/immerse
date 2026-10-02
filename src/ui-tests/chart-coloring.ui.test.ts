// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  createChart,
  createDashboard,
  deleteSelector,
  waitForVisible,
  processPause
} from "./utils"

const getPieColors = () =>
  page.$$eval(".pie-slice > path", (slices) =>
    slices.map((slice) => slice.getAttribute("fill"))
  )

describe("Chart coloring", () => {
  beforeAll(async () => {
    await createDashboard("ui-test/chart-coloring")
    await createChart("pie", {
      dataSource: "flights_donotmodify",
      dimensions: ["dest"],
      measures: ["# Records", "# Records"]
    })
  })

  it("Adding and Removing Color Measure", async () => {
    await waitForVisible(".pie-slice")

    const colorsWithMeasure = await getPieColors()
    expect(colorsWithMeasure.length).toBeGreaterThan(3)

    await deleteSelector("measures", 2)
    await processPause()

    const colorsWithoutMeasure = await getPieColors()
    expect(colorsWithoutMeasure).not.toEqual(colorsWithMeasure)
    expect(new Set(colorsWithoutMeasure).size).toBeGreaterThan(1)
  })

  it("Adding Solid Colors", async () => {
    await clickAfterVisible(".color-picker-widget .color-swatch")
    await processPause()

    await clickAfterVisible(".swatch-group.solid > div:nth-child(2)")
    await processPause()

    const solidColors = await getPieColors()
    expect(new Set(solidColors)).toEqual(new Set(["#f46a9b"]))
  })

  it("Adding Ordinal Colors", async () => {
    let previousColors = await getPieColors()

    for (let paletteIndex = 2; paletteIndex <= 5; paletteIndex += 1) {
      await clickAfterVisible(".color-swatch.selected")
      await clickAfterVisible(
        `.swatch-group.ordinal > div:nth-child(${paletteIndex})`
      )
      await processPause()

      const ordinalColors = await getPieColors()
      expect(new Set(ordinalColors).size).toBeGreaterThan(1)
      expect(ordinalColors).not.toEqual(previousColors)
      previousColors = ordinalColors
    }
  })
})
