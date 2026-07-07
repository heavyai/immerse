// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickByText,
  expectContainsText,
  getTestUrl,
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
  const CREATE_VIEW_QUERY = `CREATE VIEW ${VIEW_NAME} AS (SELECT NAME FROM us_states_geo);`

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

    // eslint-disable-next-line no-console
    console.log("Created view: ", VIEW_NAME)
  })

  it("should detect a view in the Data Manager and delete it", async () => {
    await page.goto(getTestUrl("/mapd/data-manager"), {
      waitUntil: "networkidle0"
    })

    await waitForVisible('[data-testid="dashboard-search-bar-field"]')
    await page.click('[data-testid="dashboard-search-bar-field"]')
    await page.type('[data-testid="dashboard-search-bar-field"]', VIEW_NAME)

    await page.click(`[data-testid="table-row-${VIEW_NAME}"]`)

    await waitForVisible('[data-testid="table-info-name"]')

    await expectContainsText('[data-testid="table-info-name"]', VIEW_NAME)

    // Now delete it
    await waitForVisible('[data-testid="table-preview-delete-table"]')
    await page.click('[data-testid="table-preview-delete-table"]')
    await waitForVisible(".delete-table-or-view-confirm-modal")
    await clickByText("Delete view")

    await expect(page).toMatchTextContent("Data Preview")
  })
})
