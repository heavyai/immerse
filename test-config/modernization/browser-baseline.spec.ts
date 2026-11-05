// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from "@playwright/test"
// Explicitly opt-in: requires the isolated backend with synthetic-data.sql loaded
// and a development server. This does not run in the normal unit CI job.
test("record a saved Vega dashboard load and crossfilter result", async ({
  page
}, testInfo) => {
  const filterQueryPath = process.env.IMMERSE_FILTER_QUERY_PATH || "compare"
  await page.addInitScript((mode) => {
    ;(window as any).immerseModernizationMetrics = {}
    const flags = JSON.parse(localStorage.getItem("featureflags") || "{}")
    flags["modernization/filterQueryPath"] = mode
    localStorage.setItem("featureflags", JSON.stringify(flags))
  }, filterQueryPath)
  const start = Date.now()
  await page.goto("/dashboard")
  await page.getByTestId("dashboard-title-placeholder").click()
  await page
    .getByTestId("dashboard-title-input")
    .fill(`modernization-wave-0-${Date.now()}`)
  await page.getByTestId("dashboard-title-input").press("Enter")
  const startupToEditorMs = Date.now() - start
  // Use the same application selectors as the CI chart-creation helpers, without
  // importing their legacy Puppeteer dependency chain into this focused harness.
  await page.locator(".add-chart").click()
  await page.locator(".vega-combo-btn").click()
  await page.locator(".chart-editor-left-panel .data-source-selector").click()
  await page
    .locator('.chart-editor-left-panel [data-testid="autocomplete-input"]')
    .fill("modernization_wave0_sales")
  await page
    .getByTestId("autocomplete-dropdown-item")
    .locator("div")
    .first()
    .click()
  await page.locator(".selector-loading").waitFor({ state: "hidden" })
  await page
    .locator(".chart-editor-left-panel .dimensions-container>div:nth-child(1)")
    .click()
  await page.keyboard.type("region")
  await page.keyboard.press("Enter")
  await page.locator(".selector-loading").waitFor({ state: "hidden" })
  await page
    .locator(".chart-editor-left-panel .measures-container>div:nth-child(1)")
    .click()
  await page.locator(".selector-column-dropdown").waitFor()
  await page.getByText("# Records", { exact: true }).click()
  await page.keyboard.press("Enter")
  await page.getByTestId("chart-edit-apply").click()
  await page.getByTestId("save-dashboard-button").click()
  await page.locator('.success[data-testid="save-dashboard-button"]').waitFor()
  const savedUrl = page.url()
  const samples = []
  for (let sample = 0; sample < 3; sample += 1) {
    const loadStart = Date.now()
    await page.goto(savedUrl)
    await expect(page.locator(".count-selected").first()).toHaveText("8")
    const westBar = page
      .locator('.role-mark.bar path[data-annotation-formatted="West"]')
      .first()
    await expect(westBar).toBeVisible()
    const dashboardLoadToCountAndBarMs = Date.now() - loadStart
    const startupActions = await page.evaluate(() =>
      (window as any).immerseModernizationMetrics.read()
    )
    const filterStart = Date.now()
    await westBar.click()
    await expect(page.locator(".count-selected").first()).toHaveText("2")
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )
    )
    const filterToCountAndPaintMs = Date.now() - filterStart
    const after = await page.evaluate(() =>
      (window as any).immerseModernizationMetrics.read()
    )
    samples.push({
      dashboardLoadToCountAndBarMs,
      filterToCountAndPaintMs,
      startupActions,
      filterActions: Object.fromEntries(
        Object.entries(after)
          .map(([key, value]) => [
            key,
            Number(value) - (startupActions[key] || 0)
          ])
          .filter(([, count]) => count)
      )
    })
  }
  const queryRuntime = await page.evaluate(() => {
    const app = window as any
    const ownership = app.immerseModernizationMetrics.readQueryOwnership()
    return {
      cachedChartCount: ownership.runtimeQueryCharts.length,
      comparison: app.immerseModernizationMetrics.filterQueryComparison || null,
      ownership
    }
  })
  expect(queryRuntime.cachedChartCount).toBeGreaterThan(0)
  expect(queryRuntime.ownership.reduxChartCache).toBe(false)
  expect(queryRuntime.ownership.reduxVegaResultCharts).toEqual([])
  expect(queryRuntime.ownership.runtimeRenderCharts.length).toBeGreaterThan(0)
  if (filterQueryPath === "compare") {
    expect(queryRuntime.comparison?.compared).toBeGreaterThan(0)
    expect(queryRuntime.comparison?.mismatches).toBe(0)
  }
  await testInfo.attach("browser-baseline.json", {
    body: JSON.stringify(
      {
        schemaVersion: 1,
        filterQueryPath,
        queryRuntime,
        dataset: "synthetic eight-row modernization_wave0_sales",
        mode: "development-fast",
        startupToEditorMs,
        samples,
        limitations:
          "Warm browser context; count and one Vega bar are readiness markers, not all-engine completion; no production data."
      },
      null,
      2
    ),
    contentType: "application/json"
  })
})
