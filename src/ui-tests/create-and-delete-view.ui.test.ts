// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickByText,
  expectContainsText,
  getTestUrl,
  setInputText,
  waitForVisible
} from "./utils"
import {
  SQL_EDITOR_TEST_ID_INPUT,
  SQL_EDITOR_TEST_ID_RESULTS_META,
  SQL_EDITOR_TEST_ID_RUN_BUTTON
} from "components/sql-editor/constants"

const getTestId = (testId: string) => `[data-testid="${testId}"]`

describe("Create and delete a view", () => {
  const VIEW_NAME = `us_states_geo_view_${new Date().getTime()}`
  const CREATE_VIEW_QUERY = `CREATE VIEW ${VIEW_NAME} AS SELECT NAME FROM us_states_geo;`

  it("should create a view in the SQL editor", async () => {
    await page.goto(getTestUrl("sql-editor"), { waitUntil: "networkidle0" })
    await waitForVisible(getTestId(SQL_EDITOR_TEST_ID_INPUT))
    await page.click(getTestId(SQL_EDITOR_TEST_ID_INPUT))
    await page.type(getTestId(SQL_EDITOR_TEST_ID_INPUT), CREATE_VIEW_QUERY)
    await page.click(getTestId(SQL_EDITOR_TEST_ID_RUN_BUTTON))

    // Wait for query to finish successfully
    await waitForVisible(getTestId(SQL_EDITOR_TEST_ID_RESULTS_META))
    await expectContainsText(
      getTestId(SQL_EDITOR_TEST_ID_RESULTS_META),
      "Total time:"
    )
    const queryResult = await page.$eval(
      getTestId(SQL_EDITOR_TEST_ID_RESULTS_META),
      (element) => element.textContent
    )
    expect(queryResult).not.toContain("Exception")

    // eslint-disable-next-line no-console
    console.log("Created view: ", VIEW_NAME)
  })

  it("should detect a view in the Data Manager and delete it", async () => {
    await page.goto(getTestUrl("/heavyai/data-manager"), {
      waitUntil: "networkidle0"
    })

    const searchInput = '[data-testid="dashboard-search-bar-field"]'
    await waitForVisible(searchInput)

    // Mirror the manual flow by letting the asynchronous catalog request
    // complete before filtering its results.
    await waitForVisible('[data-testid="table-row-us_states_geo"]')
    await setInputText(searchInput, VIEW_NAME)

    const viewRow = '[data-testid^="table-row-"]'
    await waitForVisible(viewRow)
    const viewRowTestId = await page.$eval(viewRow, (element) =>
      element.getAttribute("data-testid")
    )
    expect(viewRowTestId?.toLowerCase()).toBe(
      `table-row-${VIEW_NAME}`.toLowerCase()
    )
    await page.click(viewRow)

    await waitForVisible('[data-testid="table-info-name"]')

    const displayedViewName = await page.$eval(
      '[data-testid="table-info-name"]',
      (element) => element.textContent
    )
    expect(displayedViewName?.toLowerCase()).toContain(VIEW_NAME.toLowerCase())

    // Now delete it
    await waitForVisible('[data-testid="table-preview-delete-table"]')
    await page.click('[data-testid="table-preview-delete-table"]')
    await waitForVisible(".delete-table-or-view-confirm-modal")
    await clickByText("Delete view")

    await expect(page).toMatchTextContent("Data Preview")
  })
})
