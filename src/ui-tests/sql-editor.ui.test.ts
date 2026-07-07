// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  expectContainsText,
  getTestUrl,
  getTestId,
  waitForVisible,
  setInputText,
  processPause
} from "./utils"
import { DATA_TABLE_ROW_TEST_ID } from "components/data-table/consts"
import {
  SQL_EDITOR_TEST_ID_INPUT,
  SQL_EDITOR_TEST_ID_RUN_BUTTON,
  SQL_EDITOR_TEST_ID_TABLE_BROWSER_TAB,
  SQL_EDITOR_TEST_ID_QUERY_HISTORY_TAB,
  SQL_EDITOR_TEST_ID_TABLE_BROWSER,
  SQL_EDITOR_TEST_ID_TABLE_BROWSER_SEARCH,
  SQL_EDITOR_TEST_ID_QUERY_HISTORY,
  SQL_EDITOR_TEST_ID_RESULTS_META,
  SQL_EDITOR_TEST_ID_QUERY_INFO,
  SQL_EDITOR_TEST_ID_QUERY_HISTORY_ITEM,
  SQL_EDITOR_TEST_ID_SNIPPETS_HEADER
} from "components/sql-editor/constants"

const EXPECTED_RESULT_COUNT = 10
const DATASOURCE_FLIGHTS = "flights_donotmodify"

const SELECTOR_TABLE_ROW = `[data-testid='sql-editor-table-selector-${DATASOURCE_FLIGHTS}']`
const SELECTOR_TABLE_SEARCH_INPUT = `[data-testid='${SQL_EDITOR_TEST_ID_TABLE_BROWSER_SEARCH}'] input`

const VALID_QUERY = `SELECT * FROM ${DATASOURCE_FLIGHTS} LIMIT ${EXPECTED_RESULT_COUNT}`
const INVALID_QUERY = "SELECT XD FROM @_@"

xdescribe("SQL Editor", () => {
  describe("Running queries", () => {
    beforeAll(async () => {
      await page.goto(getTestUrl("sql-editor"), { waitUntil: "networkidle0" })
    })

    it("should render the SQL editor", async () => {
      await expect(page).toMatchElement(getTestId(SQL_EDITOR_TEST_ID_INPUT))
    })

    it("should enable the run button if the user has input text", async () => {
      await expect(page).toMatchElement(
        `${getTestId(SQL_EDITOR_TEST_ID_RUN_BUTTON)}[disabled]`
      )
      await page.click(getTestId(SQL_EDITOR_TEST_ID_INPUT))
      await page.type(getTestId(SQL_EDITOR_TEST_ID_INPUT), VALID_QUERY)

      await expect(page).not.toMatchElement(
        `${getTestId(SQL_EDITOR_TEST_ID_RUN_BUTTON)}[disabled]`
      )
    })

    // Disabling frequently failing UI test
    xit("should run a query and display results", async () => {
      await page.click(getTestId(SQL_EDITOR_TEST_ID_RUN_BUTTON))

      await waitForVisible(getTestId(SQL_EDITOR_TEST_ID_RESULTS_META))

      await expectContainsText(
        getTestId(SQL_EDITOR_TEST_ID_RESULTS_META),
        "10 rows in"
      )

      const resultsCells = await page.$$(getTestId("sql-editor-results-cell"))
      const resultsHeaderCells = await page.$$(
        getTestId("sql-editor-results-header-cell")
      )

      expect(resultsCells.length / resultsHeaderCells.length).toEqual(
        EXPECTED_RESULT_COUNT
      )
    })

    it("should display an error if an invalid query is entered", async () => {
      await page.click(getTestId(SQL_EDITOR_TEST_ID_INPUT))

      // A way to select all
      await page.keyboard.down("Shift")
      await page.keyboard.press("ArrowUp")
      await page.keyboard.up("Shift")

      await page.type(getTestId(SQL_EDITOR_TEST_ID_INPUT), INVALID_QUERY)
      await page.click(getTestId(SQL_EDITOR_TEST_ID_RUN_BUTTON))

      await waitForVisible(getTestId(SQL_EDITOR_TEST_ID_RESULTS_META))
      await expectContainsText(
        getTestId(SQL_EDITOR_TEST_ID_RESULTS_META),
        "Exception"
      )
    })
  })

  describe("Side panel", () => {
    beforeAll(async () => {
      await page.goto(getTestUrl("sql-editor"), { waitUntil: "networkidle0" })
    })

    describe("Table browser", () => {
      it("should render the table browser", async () => {
        await expect(page).toMatchElement(
          getTestId(SQL_EDITOR_TEST_ID_TABLE_BROWSER),
          {
            visible: true
          }
        )

        // Search for the data source first, to make sure it will appear in the
        // current virtualized view
        await setInputText(SELECTOR_TABLE_SEARCH_INPUT, DATASOURCE_FLIGHTS)

        await expect(page).toMatchElement(SELECTOR_TABLE_ROW, {
          visible: true
        })
      })

      it("should insert table names", async () => {
        // Search for the data source first, to make sure it will appear in the
        // current virtualized view
        await setInputText(SELECTOR_TABLE_SEARCH_INPUT, DATASOURCE_FLIGHTS)

        await processPause()
        await page.click(
          getTestId(`sql-editor-table-selector-${DATASOURCE_FLIGHTS}-insert`)
        )
        await expectContainsText(
          getTestId(SQL_EDITOR_TEST_ID_INPUT),
          DATASOURCE_FLIGHTS
        )
      })

      it("should show snippets and column names", async () => {
        // Search for the data source first, to make sure it will appear in the
        // current virtualized view
        await setInputText(SELECTOR_TABLE_SEARCH_INPUT, DATASOURCE_FLIGHTS)

        await page.waitForSelector(SELECTOR_TABLE_ROW, { visible: true })
        await page.click(SELECTOR_TABLE_ROW)

        await expectContainsText(
          getTestId(SQL_EDITOR_TEST_ID_SNIPPETS_HEADER),
          `Query snippets for ${DATASOURCE_FLIGHTS}`
        )
        await expect(page).toMatchElement(getTestId(DATA_TABLE_ROW_TEST_ID))
      })
    })

    describe("Query history", () => {
      it("should render query history", async () => {
        await page.click(getTestId(SQL_EDITOR_TEST_ID_QUERY_HISTORY_TAB))

        await expect(page).toMatchElement(
          getTestId(SQL_EDITOR_TEST_ID_QUERY_HISTORY),
          {
            visible: true
          }
        )
      })

      it("should show past queries", async () => {
        await page.click(getTestId(SQL_EDITOR_TEST_ID_INPUT))

        // A way to select all
        await page.keyboard.down("Shift")
        await page.keyboard.press("ArrowUp")
        await page.keyboard.up("Shift")

        await page.type(getTestId(SQL_EDITOR_TEST_ID_INPUT), VALID_QUERY)
        await page.click(getTestId(SQL_EDITOR_TEST_ID_RUN_BUTTON))

        await waitForVisible(getTestId(SQL_EDITOR_TEST_ID_RESULTS_META))
        await expectContainsText(
          getTestId(SQL_EDITOR_TEST_ID_QUERY_HISTORY_ITEM),
          VALID_QUERY
        )
      })

      it("should show details about past queries", async () => {
        await page.click(getTestId(SQL_EDITOR_TEST_ID_QUERY_HISTORY_ITEM))

        await expectContainsText(
          getTestId(SQL_EDITOR_TEST_ID_QUERY_INFO),
          "Ran at:"
        )
      })

      it("should navigate back to table browser", async () => {
        await page.click(getTestId(SQL_EDITOR_TEST_ID_TABLE_BROWSER_TAB))

        await expect(page).toMatchElement(
          getTestId(SQL_EDITOR_TEST_ID_TABLE_BROWSER),
          {
            visible: true
          }
        )
      })
    })
  })
})
