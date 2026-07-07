// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from "@playwright/test"
import { createDashboard, saveChart } from "../utils"
import { createVegaComboChart } from "../utils/vega-charts"

test.describe("Filter panel", () => {
  test("Crossfilter created from vega combo should appear in panel", async ({
    page
  }) => {
    await createDashboard(page)

    await createVegaComboChart(page, {
      dimensions: ["carrier_name"],
      measures: ["# Records"],
      dataSource: "flights_donotmodify"
    })

    await test.step("Click vega combo bar", async () => {
      const barGroupSelector = '[aria-label="Group of all bars in the chart."]'
      await page
        .locator(
          `${barGroupSelector} [data-annotation-formatted="Expressjet Airlines"]`
        )
        .first()
        .click()
    })

    await saveChart(page)
    await page.getByTestId("filter-panel-handle").click()
    await expect(
      page.getByText("\"carrier_name\" = 'Expressjet Airlines'")
    ).toHaveCount(1)
  })
})
