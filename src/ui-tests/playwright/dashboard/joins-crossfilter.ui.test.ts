// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { test, Page, expect } from "@playwright/test"
import { createDashboard } from "../utils"
import {
  createChart,
  getDataLayerScopeSelector,
  saveChart,
  selectDimension,
  selectMeasure
} from "../utils/charts"
import { asTestId, joinSelectors } from "../ui-automation/selectors"
import {
  expectCountOf,
  getChartById,
  getChartIdFromPage,
  selectTableCell,
  waitForThriftResponse,
  zoomToChartFilters
} from "../utils/common"

enum JoinType {
  INNER = "INNER",
  LEFT = "LEFT"
}

type JoinConfig = {
  name: string
  joinType?: JoinType
  leftTable: string
  rightTable: string
  leftJoinKey: string
  rightJoinKey: string
}

const createJoinDataSource = async (page: Page, joinConfig: JoinConfig) => {
  const {
    name,
    leftTable,
    rightTable,
    leftJoinKey,
    rightJoinKey,
    joinType
  } = joinConfig
  const scopeSelector = getDataLayerScopeSelector()
  const dataSourceSelector = await page.waitForSelector(
    `${scopeSelector} .data-source-selector`
  )
  dataSourceSelector.click()
  await page.getByText("+ Create New Join").click()
  await page.waitForSelector(asTestId(joinSelectors.title))
  await page.getByTestId(joinSelectors.nameInput).type(name)
  const joinSourceDropdowns = await page
    .locator(".select__value-container")
    .all()
  const sourceADropdown = joinSourceDropdowns[0]
  const sourceBDropdown = joinSourceDropdowns[1]

  // Select join type
  if (joinType) {
    switch (joinType) {
      case JoinType.LEFT:
        await page.getByTestId("icon-join-left").click()
        break
      default:
        await page.getByTestId("icon-join-inner").click()
    }
  }

  // Select left source
  await sourceADropdown.click()
  await page.getByText(leftTable, { exact: true }).click()

  // Select right source
  await sourceBDropdown.click()
  await page.getByText(rightTable, { exact: true }).click()

  // Select left key
  await page.getByTestId("simple-dialog").getByText(leftJoinKey).click()
  await waitForThriftResponse(page, "sql_execute")

  // Select right key
  await page.getByTestId("simple-dialog").getByText(rightJoinKey).click()
  await waitForThriftResponse(page, "sql_execute")

  // Create join
  await page.getByTestId("join-manager-modal-primary-action").click()
  await page.getByText(name)
}

test.describe("Dashboard with Joins + Crossfiltering", () => {
  test("should create a dashboard with a join data source", async ({
    page
  }: {
    page: Page
  }) => {
    const JOINS_DASHBOARD = `ui-test/join-datasource-filtering`

    await createDashboard(page, JOINS_DASHBOARD)
    await page.getByRole("button", { name: "+ Add Chart" }).click()
    await createJoinDataSource(page, {
      name: "test-join-1",
      leftTable: "flights_donotmodify",
      rightTable: "us_states",
      leftJoinKey: "dest_state",
      rightJoinKey: "STUSPS"
    })
    // Finish table chart first
    await selectDimension(page, 1, "dest_state")

    await selectMeasure(page, 1, "ALAND", "AVG")

    const tableChartId = getChartIdFromPage(page)
    await saveChart(page)

    const pointmapChartId = await createChart(page, "pointmap", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: ["origin_lon", "origin_lat", "airtime", "carrierdelay"]
    })
    await saveChart(page)

    const numberChartId = await createChart(page, "number", {
      tableAlreadyLoaded: true,
      dataSource: "flights_donotmodify",
      measures: ["# Records"]
    })
    await saveChart(page)

    await zoomToChartFilters(page, pointmapChartId)
    await expectCountOf(page, "7,009,728")

    // Filter on the join datasource (table) should filter single table charts (pointmap, number)
    await selectTableCell(page, {
      chartId: tableChartId,
      columnValue: "AK"
    })
    await waitForThriftResponse(page, "sql_execute")

    await expectCountOf(page, "40,969")
    const numberChart = await getChartById(page, numberChartId)

    // Single table chart should be filtered by join datasource
    const numberChartNumber = await numberChart.locator(".number-chart-number")
    await expect(await numberChartNumber.innerText()).toEqual("40,969")
  })
})
