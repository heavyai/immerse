// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from "@playwright/test"
import { createChart, createDashboard, saveChart } from "../utils"
import { createVegaComboChart } from "../utils/vega-charts"

test.describe("Vega combo filters", () => {
  test("Chart should filter itself when creating a categorical chart filter", async ({
    page
  }) => {
    await createDashboard(page)

    await createVegaComboChart(page, {
      dimensions: ["carrier_name"],
      measures: ["# Records"],
      dataSource: "flights_donotmodify"
    })

    await test.step(
      "Create a categorical exact match chart filter",
      async () => {
        await page.getByText("Add filter").click()
        await page.keyboard.type("carrier_name")
        await page.keyboard.press("Enter")
        await page
          .getByTestId("filter-component-input-value")
          .type("Skywest Airlines")
        await page.keyboard.press("Enter")
      }
    )

    await expect(
      page.getByText("Southwest Airlines"),
      "Filtered out bar should not be visible on chart"
    ).toHaveCount(0)

    await test.step("Only matching bar should be visible", async () => {
      await expect(page.locator(".role-mark.bar")).toHaveCount(1)
      await expect(
        page.locator(".mark-text.role-axis-label").getByText("Skywest Airlines")
      ).toHaveCount(1)
    })
  })

  test("Should create a crossfilter", async ({ page }) => {
    await createDashboard(page)

    await createVegaComboChart(page, {
      dimensions: ["carrier_name"],
      measures: ["# Records"],
      dataSource: "flights_donotmodify"
    })
    await test.step(
      "Filter should be visible on originating chart",
      async () => {
        const primaryAxisContainerSelector =
          ".mark-group.role-scope.barChart .role-mark.bar"
        await page
          .locator(
            `${primaryAxisContainerSelector} path[data-annotation-formatted="Expressjet Airlines"]`
          )
          .click()

        const unselectedBar = await page.locator(
          `${primaryAxisContainerSelector} path[data-annotation-formatted="Southwest Airlines"]`
        )

        const unselectedBarOpacity = await unselectedBar.evaluate((e) => {
          return window.getComputedStyle(e).getPropertyValue("fill-opacity")
        })

        await expect(
          unselectedBarOpacity,
          "Filtered out bars should be visible but have lower opacity"
        ).not.toEqual("1")
      }
    )

    await saveChart(page)

    await test.step("Crossfilter should filter table chart", async () => {
      await createChart(page, "table", {
        // Since we already have a chart that uses this, we don't wait for deets
        tableAlreadyLoaded: true,
        dataSource: "flights_donotmodify",
        dimensions: ["carrier_name"]
      })

      await saveChart(page)

      const tableRows = page.locator(".table-row.grouped-data td")
      await expect(tableRows).toHaveCount(1)
      await expect(tableRows.getByText("Expressjet Airlines")).toHaveCount(1)
    })
  })
})
