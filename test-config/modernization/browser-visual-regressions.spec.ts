// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect, Page, Locator } from "@playwright/test"

// Opt-in real-backend checks, using the same synthetic source as browser-baseline.
async function openCombo(page: Page) {
  await page.goto("/dashboard")
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
}

async function expectInside(parent: Locator, child: Locator) {
  const outer = await parent.boundingBox()
  const inner = await child.boundingBox()
  expect(outer).not.toBeNull()
  expect(inner).not.toBeNull()
  expect(inner!.x).toBeGreaterThanOrEqual(outer!.x)
  expect(inner!.x + inner!.width).toBeLessThanOrEqual(
    outer!.x + outer!.width + 1
  )
  expect(inner!.y + inner!.height).toBeLessThanOrEqual(
    outer!.y + outer!.height + 1
  )
}

test("join builder keeps both sources and key previews inside its dialog", async ({
  page
}) => {
  await openCombo(page)
  await page.locator(".chart-editor-left-panel .data-source-selector").click()
  await page.getByText("+ Create New Join", { exact: true }).click()
  const dialog = page.getByRole("dialog", { name: /Create a New Join/ })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText("Select Source", { exact: true })).toHaveCount(
    2
  )
  for (const selector of [
    ".join-manager__sources__selector-wrapper",
    ".join-manager-no-source-state"
  ]) {
    const columns = dialog.locator(selector)
    await expect(columns).toHaveCount(2)
    for (const column of await columns.all()) {
      await expectInside(dialog, column)
    }
  }
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
})

test("custom SQL has room for editing and its browser stays above the actions", async ({
  page
}) => {
  await openCombo(page)
  await page
    .locator(".dimensions-container .selector-main-section input")
    .first()
    .click()
  await page.locator(".selector-column-dropdown .data-table__row--cta").click()
  const dialog = page.getByRole("dialog", { name: "Custom Dimension Editor" })
  const expression = dialog.getByTestId("custom-sql-manager-expression")
  await expect(expression).toBeVisible()
  expect((await expression.boundingBox())!.width).toBeGreaterThan(300)
  await expression.fill("region")
  await expect(expression).toHaveValue("region")
  const rows = dialog.locator("tbody tr")
  await expect(rows).toHaveCount(4)
  const lastRow = (await rows.last().boundingBox())!
  const actions = (await dialog
    .locator('[data-ui="dialog-actions"]')
    .boundingBox())!
  expect(lastRow.y + lastRow.height).toBeLessThan(actions.y)
  await expectInside(dialog, expression)
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click()
  await expect(dialog).toBeHidden()
})

test("format presets are readable on a dark menu and still change the format", async ({
  page
}) => {
  await openCombo(page)
  await page
    .locator(".dimensions-container .selector-main-section input")
    .first()
    .click()
  await page
    .locator(".selector-column-dropdown td.data-table__cell--key-label")
    .filter({ hasText: "region" })
    .click()
  await page
    .locator(".measures-container .selector-main-section input")
    .first()
    .click()
  await page
    .locator(".selector-column-dropdown td.data-table__cell--key-label")
    .filter({ hasText: "amount" })
    .click()
  await page
    .locator(".tabs-header-item")
    .filter({ hasText: "Data and formatting" })
    .click()
  const input = page.locator(".chart-format-selector input").last()
  await input.click()
  const menu = page.locator(".format-selector-dropdown")
  const colors = await menu.evaluate((el) => {
    const list = el.querySelector("ul")!
    const label = [...el.querySelectorAll(".option-label")].find(
      (n) => n.textContent === "Imperial"
    )!
    return {
      background: getComputedStyle(list).backgroundColor,
      foreground: getComputedStyle(label).color
    }
  })
  const background = colors.background.match(/\d+/g)!.map(Number)
  const foreground = colors.foreground.match(/\d+/g)!.map(Number)
  expect(background.slice(0, 3).every((channel) => channel < 80)).toBe(true)
  expect(foreground.slice(0, 3).every((channel) => channel >= 128)).toBe(true)
  await menu
    .locator(".option-label")
    .filter({ hasText: /^Integer$/ })
    .click()
  await expect(input).toHaveValue("Integer")
})

test("dashboard filter types have a compact opaque menu and selectable options", async ({
  page
}) => {
  await page.goto("/")
  await page.getByTestId("add-dashboard-mngr-filter-type").click()
  const menu = page.locator(".dashboard-mngr-simple-select-wrapper")
  const list = menu.locator("ul")
  const background = await list.evaluate(
    (el) => getComputedStyle(el).backgroundColor
  )
  expect(background).toMatch(/^rgb\(/)
  expect(
    background
      .match(/\d+/g)!
      .map(Number)
      .every((channel) => channel < 80)
  ).toBe(true)
  expect((await list.boundingBox())!.height).toBeLessThan(160)
  await menu.getByText("Title", { exact: true }).click()
  await expect(menu).toBeHidden()
  await expect(
    page.getByTestId("dashboard-manager-filter-tag-text-input")
  ).toBeVisible()
})

test("SQL browser keeps names visible, type header readable, and empty space dark", async ({
  page
}) => {
  await page.goto("/heavyai/sql-editor")
  await page
    .getByTestId("sql-editor-table-selector-modernization_wave0_sales")
    .click()
  const table = page.locator(".data-column-selector .data-table__table")
  await expect(table.locator("tbody tr")).toHaveCount(4)
  await expect(table).toHaveCSS("background-color", "rgb(38, 38, 38)")
  const typeHeader = table.getByRole("columnheader", { name: /Type/ })
  expect((await typeHeader.boundingBox())!.width).toBeGreaterThanOrEqual(60)
  const firstName = table.locator("td.data-table__cell--first").first()
  expect((await firstName.boundingBox())!.width).toBeGreaterThan(200)
  const search = page.locator(".data-column-selector input")
  await search.fill("region")
  await expect(table.locator("tbody tr")).toHaveCount(1)
  await expect(firstName).toHaveText("region")
})

test("column previews contain statistics and return focus when dismissed", async ({
  page
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/heavyai/sql-notebook")
  for (const [table, column] of [
    ["modernization_wave0_sales", "amount"],
    ["modernization_wave0_sales", "region"],
    ["heavyai_countries", "geom"]
  ]) {
    const back = page.locator(".table-browser__current-table__back")
    if (await back.isVisible()) {
      await back.click()
    }
    await page.getByTestId(`sql-editor-table-selector-${table}`).click()
    const row = page
      .locator(".sql-notebook__column-table tbody tr")
      .filter({ hasText: column })
    await row.hover()
    const trigger = row.getByRole("button", {
      name: `Preview ${column}`,
      exact: true
    })
    const preview = page.getByRole("dialog", {
      name: `${column} column preview`,
      exact: true
    })
    // Stay beyond the former tooltip delay: hover must never open a popup.
    await trigger.hover()
    await page.waitForTimeout(1200)
    await expect(preview).toHaveCount(0)
    await expect(page.getByRole("tooltip")).toHaveCount(0)
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await trigger.click()
    await expect(preview).toBeVisible()
    await expect(
      preview.locator(".loader-with-height,.loading-widget")
    ).toHaveCount(0)
    for (const selector of [
      ".data-preview-header",
      ".column-type-badge",
      ".sql-notebook__statistic-set"
    ]) {
      await expectInside(preview, preview.locator(selector))
    }
    await expect(preview.locator(".column-type-badge svg")).toBeVisible()
    const overflows = await preview.evaluate(
      (el) => el.scrollWidth > el.clientWidth + 1
    )
    expect(overflows).toBe(false)
    await page.keyboard.press("Escape")
    await expect(preview).toBeHidden()
    await expect(trigger).toBeFocused()
  }
  expect(errors).toEqual([])
})

test("column preview replaces the previous card and dismisses on outside clicks", async ({
  page
}) => {
  await page.goto("/heavyai/sql-notebook")
  await page
    .getByTestId("sql-editor-table-selector-modernization_wave0_sales")
    .click()
  for (const column of ["amount", "region", "lon"]) {
    const row = page
      .locator(".sql-notebook__column-table tbody tr")
      .filter({ hasText: column })
    await row.hover()
    const trigger = row.getByRole("button", {
      name: `Preview ${column}`,
      exact: true
    })
    await trigger.click()
    const preview = page.getByRole("dialog", {
      name: `${column} column preview`,
      exact: true
    })
    await expect(preview).toBeVisible()
    await expect(page.locator(".data-preview-popover")).toHaveCount(1)
    await preview.locator(".data-preview-header").click()
    await expect(preview).toBeVisible()
  }
  const search = page.locator(".data-column-selector__input input")
  await search.click()
  await expect(page.locator(".data-preview-popover")).toHaveCount(0)
  await expect(search).toBeFocused()
  const row = page
    .locator(".sql-notebook__column-table tbody tr")
    .filter({ hasText: "amount" })
  await row.hover()
  const trigger = row.getByRole("button", {
    name: "Preview amount",
    exact: true
  })
  await trigger.click()
  await expect(page.locator(".data-preview-popover")).toHaveCount(1)
  await trigger.click()
  await expect(page.locator(".data-preview-popover")).toHaveCount(0)
})
