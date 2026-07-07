// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from "@playwright/test"
import {
  setFeatureFlag,
  switchDatabase,
  waitForThriftResponse
} from "../utils/common"
import { selectors } from "./selectors"
import { waitForAnswer, waitForAutoQuery } from "../utils/sql-notebook"

test.describe("SQL Notebook: NL Prompts", () => {
  test.beforeEach(async ({ page }) => {
    await setFeatureFlag(page, "dev/enable_notebook_ui_sql_editor", true)
  })
  test("Ask and edit an NL question", async ({ page }) => {
    await switchDatabase(page, "heavyiq")
    await page.locator(selectors.sqlNotebookNav).click()
    await page.locator(selectors.activeCellTextArea).click()
    await page
      .locator(selectors.activeCellTextArea)
      .fill("What are the top 5 deepest dams?")
    await expect(page.locator(selectors.activeCellSubmit)).not.toBeDisabled()
    const cellSubmitRequests = Promise.all([
      waitForAutoQuery(page),
      waitForAnswer(page)
    ])
    await page.click(selectors.activeCellSubmit)
    expect(await page.getByText("Working on it...")).toBeDefined()

    // Wait for response from webserver
    await cellSubmitRequests
    await expect(page.locator(selectors.analysisResultText)).toContainText(
      "top 5 deepest dams are"
    )
    await page.locator(selectors.editableTextField).click()
    await expect(
      page.getByRole("button", {
        name: "Regenerate"
      })
    ).toBeDisabled()
    await expect(
      page.getByRole("button", {
        name: "Cancel"
      })
    ).toBeEnabled()
    await page.locator(selectors.editableTextField).getByRole("textbox").click()
    await page
      .locator(selectors.editableTextField)
      .getByRole("textbox")
      .fill("What are the top 10 deepest dams?")
    const regenerateRequests = Promise.all([
      waitForAutoQuery(page),
      waitForAnswer(page)
    ])
    await page
      .getByRole("button", {
        name: "Regenerate"
      })
      .click()
    await expect(page.getByText("Working on it...")).toBeDefined()
    // Wait for response from webserver
    await regenerateRequests
    await expect(page.locator(selectors.analysisResultText)).toContainText(
      "top 10 deepest dams are"
    )
  })

  test("NL Question to Visualization", async ({ page }) => {
    await switchDatabase(page, "heavyiq")
    await page.locator(selectors.sqlNotebookNav).click()
    await page.locator(selectors.activeCellTextArea).click()
    await page
      .locator(selectors.activeCellTextArea)
      .fill("What is the average dam height and length per country?")
    await expect(page.locator(selectors.activeCellSubmit)).not.toBeDisabled()
    const cellRequestPromises =
      // Wait for response from webserver
      Promise.all([
        waitForAutoQuery(page),
        waitForThriftResponse(page, "sql_execute")
      ])
    await page.click(selectors.activeCellSubmit)
    await expect(page.getByText("Working on it...")).toBeDefined()
    await cellRequestPromises
    await expect(page.locator(".sql-notebook-visualization")).toBeInViewport()
    // Looks for the chart toggle icons (switch role) that is activated to have name "Choropleth"
    await expect(
      page.getByRole("switch", { checked: true, name: "Choropleth" })
    ).toBeVisible()
    await expect(
      page.getByRole("tab", { selected: true, name: "Visualizations" })
    ).toBeVisible()

    // Non-deterministic answers from IQ make it probably not a good idea
    // to do screenshot checks here as the query could change. Screenshots
    // can happen in the SQL -> Answer/Visualiation tests
  })
})
