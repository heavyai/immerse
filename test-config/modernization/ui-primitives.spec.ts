// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from "@playwright/test"

test("keyboard controls, modal focus containment and cleanup, menu navigation and pointer slider", async ({
  page
}) => {
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  const trigger = page.getByRole("button", { name: "Export", exact: true })
  await trigger.focus()
  await expect(page.getByRole("tooltip")).toHaveText("Open export dialog")
  await page.keyboard.press("Enter")
  const modal = page.getByRole("dialog", { name: "Export dashboard" })
  await expect(modal).toBeVisible()
  await expect(modal.getByRole("textbox", { name: "File name" })).toBeFocused()
  await page.keyboard.press("Shift+Tab")
  await expect(
    modal.getByRole("button", { name: "Download file" })
  ).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(modal).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await page.getByRole("checkbox", { name: "Include nulls" }).check()
  await page.getByRole("switch", { name: "Show legend" }).uncheck()
  await page.getByRole("button", { name: "Options" }).focus()
  await page.keyboard.press("Enter")
  await expect(
    page.getByRole("menuitem", { name: "Download", exact: true })
  ).toBeFocused()
  await page.keyboard.press("ArrowDown")
  await expect(
    page.getByRole("menuitem", { name: "Delete", exact: true })
  ).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page.getByLabel("Selected menu action")).toHaveText("Delete")
  await expect(page.getByRole("menu")).toHaveCount(0)
  await page.getByRole("slider", { name: "Minimum" }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByLabel("Selected range")).toHaveText("3 to 8")
  const slider = page.getByRole("slider", { name: "Maximum" })
  const box = await slider.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x - 28, box.y + box.height / 2)
  await page.mouse.up()
  await expect(page.getByLabel("Selected range")).not.toHaveText("3 to 8")
  expect(errors).toEqual([])
})

for (const theme of ["dark", "light", "light2", "custom", "high-contrast"]) {
  test(`semantic tokens, customer accent and portal styling: ${theme}`, async ({
    page
  }, info) => {
    await page.goto("/")
    await page.evaluate((mode) => {
      document.body.className =
        mode === "light" || mode === "light2"
          ? `${mode}-mode`
          : mode === "custom"
          ? "tint-mode"
          : ""
      document.body.style.setProperty("--blue-main", "#7030a0")
      if (mode === "custom") {
        document.body.style.setProperty("--main-color", "280")
        document.body.style.setProperty("--main-saturation", "30%")
      }
    }, theme)
    if (theme === "high-contrast") {
      await page.emulateMedia({ forcedColors: "active" })
    }
    const button = page.getByRole("button", { name: "Export", exact: true })
    if (theme !== "high-contrast") {
      await expect(button).toHaveCSS("background-color", "rgb(112, 48, 160)")
    }
    await button.click()
    const modal = page.getByRole("dialog", { name: "Export dashboard" })
    await expect(modal).toBeVisible()
    if (theme !== "high-contrast") {
      const colors = await modal.evaluate(
        (element, legacyColor) => {
          const probe = document.createElement("span")
          probe.style.color = legacyColor
          document.body.appendChild(probe)
          const result = {
            actual: getComputedStyle(element).color,
            expected: getComputedStyle(probe).color
          }
          probe.remove()
          return result
        },
        theme === "light2" ? "var(--gray-900)" : "var(--textOnDark)"
      )
      expect(colors.actual).toBe(colors.expected)
    }
    await page.screenshot({ path: info.outputPath(`${theme}.png`) })
  })
}
