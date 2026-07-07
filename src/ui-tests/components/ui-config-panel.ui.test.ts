// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  createVegaChart,
  createDashboard,
  getTestId,
  saveChart
} from "../utils"

import { waitUntilHTMLRendered } from "../utils/recorder"

describe("UI Config Panel", () => {
  beforeEach(async () => {
    await createDashboard("ui-test/ui-config-panel")
  })

  it("toggles the UI Config panel when user clicks the config panel handle", async () => {
    // Panel should start closed
    await expect(page).not.toMatchElement(getTestId("ui-config-panel"))

    // Clicking handle should open config panel
    await clickAfterVisible(getTestId("ui-config-panel-handle"))
    await expect(page).toMatchElement(getTestId("ui-config-panel"))

    // You should be able to switch to the filter panel
    await clickAfterVisible(getTestId("filter-panel-handle"))
    await expect(page).not.toMatchElement(getTestId("ui-config-panel"))
    await expect(page).toMatchElement(getTestId("filter-panel"))

    // You should be able to switch back to the config panel
    await clickAfterVisible(getTestId("ui-config-panel-handle"))
    await expect(page).toMatchElement(getTestId("ui-config-panel"))

    // Clicking the config panel handle again should collapse the panel
    await clickAfterVisible(getTestId("ui-config-panel-handle"))
    await expect(page).not.toMatchElement(getTestId("ui-config-panel"))
  })

  // TODO:
  //
  // it("has correct enabled/disabled save/reset interactions", async () => {
  //   await clickAfterVisible(getTestId("ui-config-panel-handle"))

  //   // Reset dashboard settings buttons should start disabled
  //   await expect(page).toMatchElement(
  //     `${getTestId("ui-config-action-reset")}:disabled`
  //   )

  //   // Reset dashboard settings button should revert changes
  //   await clickAfterVisible(getTestId("toggle-high-contrast-colors"))
  //   await clickAfterVisible(
  //     `${getTestId("ui-config-action-reset")}:not(disabled)`
  //   )
  //   await waitUntilHTMLRendered(page)
  //   await expect(page).toMatchElement(
  //     `${getTestId("toggle-high-contrast-colors")}:not(checked)`
  //   )

  //   // Open admin actions. With no changes, Save/Reset should be disabled
  //   await clickAfterVisible(getTestId("ui-config-action-toggle"))
  //   await waitUntilHTMLRendered(page)
  //   await expect(page).toMatchElement(
  //     `${getTestId("ui-config-action-reset-original")}:disabled`
  //   )
  //   await expect(page).toMatchElement(
  //     `${getTestId("ui-config-action-save")}:disabled`
  //   )

  //   // Making a change should update dashboard save button
  //   await clickAfterVisible(getTestId("axisTickLabel-font-increase"))
  //   await expectContainsText(getTestId("save-dashboard-button"), "Save *")

  //   // Clicking save should open warning modal
  //   await clickAfterVisible(getTestId("ui-config-action-save"))
  //   await expect(page).toMatchElement(getTestId("app-overlay"))
  //   await expectContainsText(
  //     getTestId("app-overlay"),
  //     "Set Default Theme for Database"
  //   )
  //   await clickByText("Cancel")
  //   await expect(page).not.toMatchElement(getTestId("app-overlay"))
  // })

  it("updates chart styles", async () => {
    await createVegaChart("vega-combo", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"],
      measures: ["airtime"]
    })

    await saveChart()
    await clickAfterVisible(getTestId("ui-config-panel-handle"))
    await clickAfterVisible(getTestId("chartTitle-font-increase"))
    await clickAfterVisible(getTestId("chartTitle-font-bold"))
    await expect(page).toMatchElement(getTestId("chart-title"))

    await waitUntilHTMLRendered(page)

    const chartTitle = await page.$(getTestId("chart-title"))
    const chartTitleStyles = await page.evaluate((element) => {
      const styles = window.getComputedStyle(element)
      return [
        styles.getPropertyValue("font-size"),
        styles.getPropertyValue("font-weight")
      ]
    }, chartTitle)

    // Up from our default 16px
    await expect(chartTitleStyles[0]).toBe("18px")
    await expect(chartTitleStyles[1]).toBe("700")
  })

  it("allows users to update color palettes", async () => {
    await clickAfterVisible(getTestId("ui-config-panel-handle"))

    await waitUntilHTMLRendered(page)

    // Counting how many swatches of this color before we do anything prevents
    // this test from getting tripped up by existing color swatches of color #FF00000
    const initialMatchingSwatches = await page.$$(
      getTestId("color-palette-swatch-ff0000")
    )
    await clickAfterVisible(getTestId("color-palette-add"))
    await expect(page).toMatchElement(getTestId("color-palette-popup"))
    await expect(page).toMatchElement(getTestId("color-palette-swatch-ffffff"))

    // Add a new color swatch
    await page.click(`${getTestId("color-palette-input")} input`)
    // A way to select all
    Array.from(Array(8)).forEach(async () => {
      // Make sure cursor is at the start of the input
      await page.keyboard.press("ArrowLeft")
    })
    await page.keyboard.down("Shift")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.up("Shift")
    await page.type(getTestId("color-palette-input"), "#ff0000")
    await expect(page).toMatchElement(getTestId("color-palette-swatch-ff0000"))

    // Delete swatch
    await clickAfterVisible(getTestId("color-palette-swatch-ff0000"))
    await clickAfterVisible(getTestId("color-palette-swatch-delete"))
    const afterDeleteMatches = await page.$$(
      getTestId("color-palette-swatch-ff0000")
    )
    await expect(afterDeleteMatches.length).toEqual(
      initialMatchingSwatches.length
    )
  })
})
