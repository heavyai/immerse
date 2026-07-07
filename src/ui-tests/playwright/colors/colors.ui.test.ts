// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect, Page } from "@playwright/test"
import {
  createChart,
  createDashboard,
  deleteDashboard,
  saveChart,
  saveDashboard,
  setFeatureFlag
} from "../utils"
import { hexToRgb } from "@material-ui/core"
// TODO: This import breaks playwright, there's no `window` when importing I think is the root cause
// import { HEAVYAI_QUANTITATIVE_COLORS } from "services/colors"

const blueRed = ["#ea5545", "#27aeef"]
const Set2 = [
  "#ea5545",
  "#bdcf32",
  "#b33dc6",
  "#ef9b20",
  "#87bc45",
  "#f46a9b",
  "#ace5c7",
  "#ede15b",
  "#836dc5",
  "#86d87f",
  "#27aeef"
]
const dashboardsToDelete: string[] = []

const selectCustomColorFromPalette = async (
  page: Page,
  // Which color to change from the custom colors list
  customColorIndex: number,
  // Which color to select from the new palette
  selectColorTitle = ""
) => {
  await page.locator(`#custom-color-color-${customColorIndex}`).click()
  await page
    .getByTitle(selectColorTitle, {
      exact: true
    })
    .click()
  await page.locator("#immerse-body").press("Enter")
}

const selectColorPalette = async (page: Page, paletteName: string) => {
  // Change color swatch
  await page.getByTestId("color-swatch").click()
  await page.getByTitle(paletteName).click()
  // Click outside
  await page.getByText("Color Palette").click()
}

const getColorMatchRegex = (paletteColors: string[]) => {
  const palettePattern = paletteColors
    .map(hexToRgb)
    .map((rgb: string) => rgb.replace("(", "\\(").replace(")", "\\)"))
    .join("|")
  return new RegExp(`^${palettePattern}$`)
}

const selectPaletteMapping = async (page: Page, name: string) => {
  await page
    .locator(".palette-mapping-selector")
    .getByRole("button", {
      name: "add"
    })
    .click()
  await page.getByLabel("Name").click()
  await page.getByLabel("Name").fill(name)
  await page.getByLabel("Name").press("Enter")
}

const renamePaletteMapping = async (
  page: Page,
  fromName: string,
  toName: string
) => {
  await page.locator(".editable-value__click-target").click()
  await page.locator(".editable-value__edit-icon > svg").click()
  await page
    .getByTestId("chart-editor-right-panel")
    .getByText(fromName)
    .press("Meta+a")
  await page
    .getByTestId("chart-editor-right-panel")
    .getByText(fromName)
    .fill(toName)
  await page.getByTestId("chart-editor-right-panel").press("Enter")
}

test.describe("Color Consistency - Categorical Colors", () => {
  test.beforeEach(async ({ page }) => {
    await setFeatureFlag(page, "ui/enable_shared_color_settings")
  })

  test("D3 Chart Color - Pie", async ({ page }) => {
    const createdDash = await createDashboard(
      page,
      "ui-test/color-consistency-d3"
    )
    dashboardsToDelete.push(createdDash)
    await createChart(page, "pie", {
      dataSource: "flights_donotmodify",
      dimensions: ["dest"],
      measures: ["# Records"]
    })

    await page.waitForSelector("g.pie-wrapper")

    // Pie chart animation
    await page.waitForTimeout(500)

    // Choose a color
    await page.locator("#custom-color-color-0").click()
    await page
      .getByTitle("purple", {
        exact: true
      })
      .click()
    await page.locator("#immerse-body").press("Enter")

    // assert custom color color 0 is purple
    await expect(page.locator("#custom-color-color-0 .color-item")).toHaveCSS(
      "color",
      "rgb(179, 61, 198)"
    )

    // Change color swatch
    await selectColorPalette(page, "blueRed")
    // assert that the colors are all red/blue
    await expect(page.getByTitle("blueRed")).toBeVisible()
    const redOrBlue = getColorMatchRegex(blueRed)

    const colorItems = await page.locator(".color-item")
    const colorItemsCount = await colorItems.count()
    // Don't check "all others" (count - 1)
    for (let i = 0; i < colorItemsCount - 1; i++) {
      await expect(colorItems.nth(i)).toHaveCSS("color", redOrBlue)
    }

    await page.getByLabel("Search").click()
    await page.getByLabel("Search").fill("DEN")
    // Assert that this exists, is the only option

    const colorItemsFiltered = await page.locator(".custom-colors-label")
    const colorItemsFilteredCount = await colorItemsFiltered.count()
    await expect(
      page.getByTestId("color-picker").getByText("DEN")
    ).toBeVisible()
    // DEN and All Others
    expect(colorItemsFilteredCount).toBe(1)

    await page.getByLabel("Search").clear()

    await page
      .getByTestId("chart-editor-right-panel")
      .getByRole("button", {
        name: "add"
      })
      .click()
    await page.getByLabel("Name").click()
    await page.getByLabel("Name").fill("test-mapping-1")
    await page
      .getByRole("button", {
        name: "Go Back"
      })
      .click()
    // Assert no palette mapping selected
    await expect(page.locator(".mapping-container")).not.toBeVisible()

    const originalName = "test-mapping-1"
    const renamedName = "test-mapping-rename-1"
    await selectPaletteMapping(page, originalName)
    // Assert that things exist
    await expect(page.locator(".mapping-container")).toBeVisible()
    await renamePaletteMapping(page, originalName, renamedName)

    await selectCustomColorFromPalette(page, 0, "blue")

    // Delete + cancel
    await page.locator(".palette-mapping-item-menu__actions>button").click()
    await page
      .getByRole("button", {
        name: "Go Back"
      })
      .click()

    // Save enabled now that changes have been made
    await expect(
      page.locator(".palette-mapping-item-menu__actions").filter({
        has: page.getByTestId("palette-mapping-actions__save")
      })
    ).not.toBeDisabled()

    // Reset appears

    await selectCustomColorFromPalette(page, 1, "red")
    await page.locator("#immerse-body").click()
    await page
      .locator("div")
      .filter({
        hasText: /^Reset$/
      })
      .first()
      .click()

    // Remove mapping
    await page
      .getByRole("button", {
        name: "Remove Mapping"
      })
      .click()

    // Resets to color set 2
    await expect(await page.getByTitle("Set2")).toBeVisible()
    const set2Match = getColorMatchRegex(Set2)

    const set2Items = await page.locator(".color-item")
    const set2ItemsCount = await colorItems.count()
    // Don't check "all others" (count - 1)
    for (let i = 0; i < set2ItemsCount - 1; i++) {
      await expect(set2Items.nth(i)).toHaveCSS("color", set2Match)
    }

    // Select from manage menu
    await page
      .getByRole("button", {
        name: "Manage"
      })
      .click()
    await page
      .getByRole("menuitem", {
        name: renamedName
      })
      .click()

    // Make sure its set, title is changed
    await expect(await page.locator(".mapping-container")).toBeVisible()
    await expect(await page.getByText(renamedName)).toBeVisible()
    await saveChart(page)
    await saveDashboard(page)
  })

  test("Raster Chart Color - Pointmap", async ({ page }) => {
    await createDashboard(page, "ui-test/color-consistency-raster")
    await createChart(page, "pointmap", {
      dataSource: "flights_donotmodify",
      measures: ["origin_lon", "origin_lat", "airtime", "dest"]
    })

    // Choose a color
    await page.locator("#custom-color-color-0").click()
    await page
      .getByTitle("purple", {
        exact: true
      })
      .click()
    await page.locator("#immerse-body").press("Enter")

    // assert custom color color 0 is purple
    await expect(page.locator("#custom-color-color-0 .color-item")).toHaveCSS(
      "color",
      "rgb(179, 61, 198)"
    )

    // Change color swatch
    await selectColorPalette(page, "blueRed")
    // assert that the colors are all red/blue
    await expect(page.getByTitle("blueRed")).toBeVisible()
    const redOrBlue = getColorMatchRegex(blueRed)

    const colorItems = await page.locator(".color-item")
    const colorItemsCount = await colorItems.count()
    // Don't check "all others" (count - 1)
    for (let i = 0; i < colorItemsCount - 1; i++) {
      await expect(colorItems.nth(i)).toHaveCSS("color", redOrBlue)
    }

    await page.getByLabel("Search").click()
    await page.getByLabel("Search").fill("DEN")
    // Assert that this exists, is the only option

    const colorItemsFiltered = await page
      .locator(".custom-colors-label")
      .filter({
        hasNotText: "All Others"
      })
    const colorItemsFilteredCount = await colorItemsFiltered.count()
    await expect(
      page.locator(".custom-color-list").getByText("DEN")
    ).toBeVisible()
    // DEN and All Others
    expect(colorItemsFilteredCount).toBe(1)

    await page.getByLabel("Search").clear()

    await page
      .locator(".palette-mapping-selector")
      .getByRole("button", {
        name: "add"
      })
      .click()
    await page.getByLabel("Name").click()
    await page.getByLabel("Name").fill("it doesnt matter what this is")
    await page
      .getByRole("button", {
        name: "Go Back"
      })
      .click()
    // Assert no palette mapping selected
    await expect(page.locator(".mapping-container")).not.toBeVisible()

    const originalName = "point-mapping-1"
    const renamedName = "point-mapping-rename-1"
    await selectPaletteMapping(page, originalName)
    // Assert that things exist
    await expect(page.locator(".mapping-container")).toBeVisible()
    await renamePaletteMapping(page, originalName, renamedName)

    await selectCustomColorFromPalette(page, 0, "blue")

    // Delete + cancel
    await page.locator(".palette-mapping-item-menu__actions>button").click()
    await page
      .getByRole("button", {
        name: "Go Back"
      })
      .click()

    // Save enabled now that changes have been made
    await expect(
      page.locator(".palette-mapping-item-menu__actions").filter({
        has: page.getByTestId("palette-mapping-actions__save")
      })
    ).not.toBeDisabled()

    // Reset appears

    await selectCustomColorFromPalette(page, 1, "red")
    await page.locator("#immerse-body").click()
    await page
      .locator("div")
      .filter({
        hasText: /^Reset$/
      })
      .first()
      .click()

    // Remove mapping
    await page
      .getByRole("button", {
        name: "Remove Mapping"
      })
      .click()

    // Resets to color set 2
    await expect(await page.getByTitle("Set2")).toBeVisible()
    const set2Match = getColorMatchRegex(Set2)

    const set2Items = await page.locator(".color-item")
    const set2ItemsCount = await colorItems.count()
    // Don't check "all others" (count - 1)
    for (let i = 0; i < set2ItemsCount - 1; i++) {
      await expect(set2Items.nth(i)).toHaveCSS("color", set2Match)
    }

    // Select from manage menu
    await page
      .getByRole("button", {
        name: "Manage"
      })
      .click()
    await page
      .getByRole("menuitem", {
        name: renamedName
      })
      .click()

    // Make sure its set, title is changed
    await expect(await page.locator(".mapping-container")).toBeVisible()
    await expect(await page.getByText(renamedName)).toBeVisible()

    // Import from manage menu
    await page
      .getByRole("button", {
        name: "Manage"
      })
      .click()

    // Desperate measuress
    await page.waitForTimeout(400)
    await page
      .getByRole("tab", {
        name: "Import"
      })
      .click()
    await page.getByLabel("Search dashboards").click()
    await page
      .getByLabel("Search dashboards")
      .fill("ui-test/color-consistency-d3")

    // Select first dashboard result
    await page.getByRole("rowgroup").first().click()

    await page.getByRole("menuitem").first().getByRole("button").click()
    await page.getByLabel("Name").fill("ui-import-test-1")
    await page
      .getByRole("button", {
        name: "Import"
      })
      .click()
    await expect(await page.locator(".mapping-container")).toBeVisible()
    await expect(await page.getByText("ui-import-test-1")).toBeVisible()
    for (let i = 0; i < dashboardsToDelete.length; i++) {
      const d = dashboardsToDelete[i]
      await deleteDashboard(page, d)
    }
  })
})
