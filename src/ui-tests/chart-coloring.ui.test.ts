// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  createChart,
  createDashboard,
  deleteSelector,
  expectAttribute,
  waitForVisible,
  processPause
} from "./utils"

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

    await expectAttribute(".pie-slice._0 > path", "fill", "#d0f400")
    await expectAttribute(".pie-slice._3 > path", "fill", "#48b5c4")
    await expectAttribute(".pie-slice._6 > path", "fill", "#1984c5")
    await expectAttribute(".pie-slice._9 > path", "fill", "#115f9a")

    await deleteSelector("measures", 2)
    await processPause()

    await expectAttribute(".pie-slice._0 > path", "fill", "#bdcf32")
    await expectAttribute(".pie-slice._3 > path", "fill", "#ef9b20")
    await expectAttribute(".pie-slice._6 > path", "fill", "#27aeef")
    await expectAttribute(".pie-slice._9 > path", "fill", "#ede15b")
  })

  it("Adding Solid Colors", async () => {
    await clickAfterVisible(".color-picker-widget .color-swatch")
    await processPause()

    await clickAfterVisible(".swatch-group.solid > div:nth-child(2)")
    await processPause()

    await expectAttribute(".pie-slice._0 > path", "fill", "#f46a9b")
    await expectAttribute(".pie-slice._3 > path", "fill", "#f46a9b")
    await expectAttribute(".pie-slice._6 > path", "fill", "#f46a9b")
    await expectAttribute(".pie-slice._9 > path", "fill", "#f46a9b")
  })

  it("Adding Ordinal Colors", async () => {
    await clickAfterVisible(".color-swatch.selected")
    await clickAfterVisible(".swatch-group.ordinal > div:nth-child(2)")
    await processPause()

    await expectAttribute(".pie-slice._0 > path", "fill", "#ea5545")
    await expectAttribute(".pie-slice._3 > path", "fill", "#87bc45")
    await expectAttribute(".pie-slice._6 > path", "fill", "#ede15b")
    await expectAttribute(".pie-slice._9 > path", "fill", "#ea5545")

    await clickAfterVisible(".color-swatch.selected")
    await clickAfterVisible(".swatch-group.ordinal > div:nth-child(3)")
    await processPause()

    await expectAttribute(".pie-slice._0 > path", "fill", "#22a7f0")
    await expectAttribute(".pie-slice._3 > path", "fill", "#d4e666")
    await expectAttribute(".pie-slice._6 > path", "fill", "#3ad6cd")
    await expectAttribute(".pie-slice._9 > path", "fill", "#22a7f0")

    await clickAfterVisible(".color-swatch.selected")
    await clickAfterVisible(".swatch-group.ordinal > div:nth-child(4)")
    await processPause()

    await expectAttribute(".pie-slice._0 > path", "fill", "#ede15b")
    await expectAttribute(".pie-slice._3 > path", "fill", "#27aeef")
    await expectAttribute(".pie-slice._6 > path", "fill", "#ede15b")
    await expectAttribute(".pie-slice._9 > path", "fill", "#ede15b")

    await clickAfterVisible(".color-swatch.selected")
    await clickAfterVisible(".swatch-group.ordinal > div:nth-child(5)")
    await processPause()

    await expectAttribute(".pie-slice._0 > path", "fill", "#27aeef")
    await expectAttribute(".pie-slice._3 > path", "fill", "#ef9b20")
    await expectAttribute(".pie-slice._6 > path", "fill", "#b33dc6")
    await expectAttribute(".pie-slice._9 > path", "fill", "#bdcf32")
  })
})
