// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const fs = require("node:fs")
const path = require("node:path")
const zlib = require("node:zlib")
const { filesUnder } = require("./architecture.cjs")
const root = path.resolve(__dirname, "../..")

async function measure() {
  const mode = process.argv[2]
  const target = process.argv[3]
  if (mode === "bundle") {
    const directory = path.resolve(target || path.join(root, "dist"))
    const files = filesUnder(directory)
      .filter((name) => /\.(js|css)$/.test(name))
      .map((name) => {
        const data = fs.readFileSync(name)
        return {
          file: path.relative(directory, name),
          bytes: data.length,
          gzipBytes: zlib.gzipSync(data).length
        }
      })
    if (!files.length)
      throw new Error(`No JS/CSS assets in ${directory}; build first.`)
    console.log(
      JSON.stringify(
        {
          schemaVersion: 1,
          kind: "bundle",
          files,
          totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
          totalGzipBytes: files.reduce((sum, file) => sum + file.gzipBytes, 0)
        },
        null,
        2
      )
    )
    return
  }
  if (mode !== "browser" || !target)
    throw new Error(
      "Usage: node scripts/modernization/measure.cjs bundle [dist-dir] | browser scenario.json"
    )
  const scenario = JSON.parse(fs.readFileSync(path.resolve(target), "utf8"))
  if (
    !scenario.url ||
    !scenario.readySelector ||
    !scenario.filter?.triggerSelector ||
    !scenario.filter?.completionSelector ||
    !scenario.filter?.completionText
  )
    throw new Error(
      "Scenario needs url, readySelector, and filter triggerSelector/completionSelector/completionText"
    )
  const { chromium } = require("@playwright/test")
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext(
      scenario.storageState
        ? { storageState: path.resolve(scenario.storageState) }
        : {}
    )
    const samples = []
    for (let index = 0; index < (scenario.samples || 5); index += 1) {
      const page = await context.newPage()
      await page.addInitScript(() => {
        window.immerseModernizationMetrics = {}
      })
      const start = performance.now()
      await page.goto(scenario.url)
      await page.locator(scenario.readySelector).waitFor({ state: "visible" })
      const dashboardReadyMs = performance.now() - start
      const navigation = await page.evaluate(() => {
        const timing = performance.getEntriesByType("navigation")[0]
        return {
          domContentLoadedMs: timing.domContentLoadedEventEnd,
          loadEventMs: timing.loadEventEnd
        }
      })
      const before = await page.evaluate(() =>
        window.immerseModernizationMetrics.read?.()
      )
      if (!before)
        throw new Error(
          "Action metrics unavailable: run a development build with the opt-in recorder"
        )
      const completion = page.locator(scenario.filter.completionSelector)
      if (
        (await completion.allTextContents())
          .join("\n")
          .includes(scenario.filter.completionText)
      )
        throw new Error(
          "Filter completion is already present before interaction; choose an observable changed result"
        )
      const filterStart = performance.now()
      await page.locator(scenario.filter.triggerSelector).click()
      await completion
        .filter({ hasText: scenario.filter.completionText })
        .first()
        .waitFor({ state: "visible" })
      // Let the browser paint the asserted changed result.
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          )
      )
      const filterToObservedResultMs = performance.now() - filterStart
      const after = await page.evaluate(() =>
        window.immerseModernizationMetrics.read()
      )
      samples.push({
        dashboardReadyMs,
        ...navigation,
        filterToObservedResultMs,
        startupActions: before,
        filterActions: Object.fromEntries(
          Object.entries(after)
            .map(([key, count]) => [key, count - (before[key] || 0)])
            .filter(([, count]) => count)
        )
      })
      await page.close()
    }
    console.log(
      JSON.stringify(
        {
          schemaVersion: 1,
          kind: "browser",
          label: scenario.label,
          samples,
          methodology:
            "Fresh page per sample, shared browser context; dashboardReadyMs includes navigation until the scenario ready marker; filtering ends at asserted changed DOM plus two animation frames. This is not engine-wide render completion."
        },
        null,
        2
      )
    )
  } finally {
    await browser.close()
  }
}
measure().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
