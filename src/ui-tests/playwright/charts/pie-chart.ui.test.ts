// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from "@playwright/test"
import { createChart, createDashboard, saveChart } from "../utils"

test.describe("Pie chart", () => {
  test("Creates Pie chart", async ({ page }) => {
    await createDashboard(page, "ui-test/creates-pie-chart")
    await createChart(page, "pie", {
      dataSource: "flights_donotmodify",
      dimensions: ["dest"],
      measures: ["# Records", { type: "custom", value: "avg(airtime)" }]
    })

    await saveChart(page)

    await page.waitForSelector("g.pie-wrapper")

    await page.click("g.pie-wrapper > g.pie-slice:nth-child(3)")
    await page.waitForSelector("g.pie-wrapper > g.pie-slice.selected")
    const selectedSlices = await page
      .locator("g.pie-wrapper > g.pie-slice.selected")
      .all()
    const deselectedSlices = await page
      .locator("g.pie-wrapper > g.pie-slice.deselected")
      .all()

    expect(selectedSlices.length).toBe(1)
    expect(deselectedSlices.length).toBeGreaterThan(selectedSlices.length)
  })

  test("Converts Pie to Heat chart", async ({ page }) => {
    await createDashboard(page, "ui-test/converts-pie-to-heat")
    await createChart(page, "pie", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: ["airtime", "carrier_name"]
    })
    await page.locator(".heat-btn.chart-btn-enabled")

    await page.click(".heat-btn")
    await page.waitForSelector(".error-msg")

    expect(
      await page.locator(".error-msg span", { hasText: "Heat Requirements" })
    ).toBeDefined()

    expect(
      await page.locator(".error-msg ul li:first-of-type span", {
        hasText: "X Axis dimension"
      })
    ).toBeDefined()
    expect(
      await page.locator(".error-msg ul li:last-of-type span", {
        hasText: "Y Axis dimension"
      })
    ).toBeDefined()

    expect(
      await page.locator(
        ".measures-container>div:nth-child(1) .selector-label",
        {
          hasText: "color"
        }
      )
    ).toBeDefined()
    expect(
      await page.locator(
        ".measures-container>div:nth-child(1) .drag-area .selector-label-ellipse",
        {
          hasText: "airtime"
        }
      )
    ).toBeDefined()
    expect(
      await page.waitForSelector(
        ".measures-container>div:nth-child(2) .selector-pill.inactive"
      )
    ).toBeDefined()
  })
})
