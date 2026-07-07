// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, expect } from "@playwright/test"
import {
  setFeatureFlag,
  switchDatabase,
  waitForThriftResponse
} from "../utils/common"
import { selectors } from "./selectors"
import { waitForMapboxChartLoad } from "../utils/charts"
import { setChartField } from "../utils/sql-notebook"

test.describe("SQL Notebook: SQL Prompts", () => {
  const q = `
    SELECT
      DAM_LEN_M,
      DAM_HGT_M,
      DAM_NAME,
      DEPTH_M,
      geom,
      RIVER,
      RES_NAME,
      QUALITY,
      NEAR_CITY,
      MAIN_BASIN
    from
      world_dams
    `
  test.beforeEach(async ({ page }) => {
    await setFeatureFlag(page, "dev/enable_notebook_ui_sql_editor", true)
  })

  test("Run SQL Query, use pointmap", async ({ page }) => {
    await switchDatabase(page, "heavyiq")
    await page.locator(selectors.sqlNotebookNav).click()
    await page.locator(selectors.activeCellTextArea).click()
    await page.locator(selectors.activeCellTextArea).fill(q)
    await expect(page.locator(selectors.activeCellSubmit)).not.toBeDisabled()

    // SQL Editor toggle is toggled
    await expect(
      page.getByRole("checkbox", {
        name: "SQL Editor"
      })
    ).toBeChecked()
    await page.locator(selectors.activeCellSubmit).click()

    await waitForThriftResponse(page, "sql_execute")
    // Automatically expands
    await expect(
      page.getByTestId("sql-editor-data-viewer").getByRole("grid")
    ).toBeInViewport()

    // Pointmap should be selected by default since we have lat/lng
    const mapLoadPromise = waitForMapboxChartLoad(page, ".vega-map")
    await page
      .getByRole("tab", {
        selected: false,
        name: "Visualizations"
      })
      .click()

    await expect(
      page.getByRole("switch", {
        checked: true,
        name: "Pointmap"
      })
    ).toBeVisible()

    await mapLoadPromise

    // Change columns
    const colorRenderPromise = waitForThriftResponse(page, "render_vega")
    setChartField(page, "color", "DAM_LEN_M")

    await colorRenderPromise

    // Toggle columns
    await page
      .getByRole("checkbox", {
        name: "color"
      })
      .click()
    await waitForThriftResponse(page, "render_vega")

    // Dot density should appear when no color measure
    // checked by default
    await expect(
      page.getByRole("checkbox", {
        name: "dotDensity"
      })
    ).toBeChecked()
    const rerenderPromise = waitForThriftResponse(page, "render_vega")
    await page
      .getByRole("checkbox", {
        name: "size"
      })
      .click()
    await rerenderPromise
  })

  test("Run SQL Query, use vega charts", async ({ page }) => {
    const linemapQuery = `
      SELECT
        join_time,
        state_abbr,
        lang,
        tweet_count,
        followers,
        followees,
        county_state,
        admin1
      FROM
        tweets_nov_feb
      WHERE
        country = 'US';
    `
    await page.locator(selectors.sqlNotebookNav).click()
    await page.locator(selectors.activeCellTextArea).click()
    await page.locator(selectors.activeCellTextArea).fill(linemapQuery)
    await expect(page.locator(selectors.activeCellSubmit)).not.toBeDisabled()

    // SQL Editor toggle is toggled
    await expect(
      page.getByRole("checkbox", {
        name: "SQL Editor"
      })
    ).toBeChecked()
    await page.locator(selectors.activeCellSubmit).click()

    await waitForThriftResponse(page, "sql_execute")

    // Automatically expands
    await expect(
      page.getByTestId("sql-editor-data-viewer").getByRole("grid")
    ).toBeInViewport()

    // Pointmap should be selected by default since we have lat/lng
    await page
      .getByRole("tab", {
        selected: false,
        name: "Visualizations"
      })
      .click()

    await expect(
      page.getByRole("switch", {
        checked: true,
        name: "Choropleth"
      })
    ).toBeVisible()

    await page
      .getByRole("switch", {
        checked: false,
        name: "Line Chart"
      })
      .click()
    await expect(
      page.getByRole("switch", {
        checked: true,
        name: "Line Chart"
      })
    ).toBeVisible()
  })
})
