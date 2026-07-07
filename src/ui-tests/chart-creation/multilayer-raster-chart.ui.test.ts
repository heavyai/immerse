// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createChart,
  createDashboard,
  expectContainsText,
  processPause,
  waitForVisible,
  waitForCrossfilter,
  saveChart,
  getMapRect,
  clickAfterVisible
} from "../utils"

import { enterCohortBuildingMode, saveCohortName } from "../utils/filter-panel"

xdescribe("Multilayer raster charts", () => {
  xit("Creates a multilayer chart and ensures that a cohort can be built", async () => {
    await createDashboard("ui-test/creates-multilayer-chart")
    await createChart("backendChoropleth", {
      dataSource: "us_states_geo"
    })
    await processPause(2)

    const addLayerButton = '[class="button add-layer"]'
    await clickAfterVisible(addLayerButton)

    await createChart("pointmap", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: ["dest_lon", "dest_lat", "airtime", "distance"],
      multilayer: true
    })
    await processPause(3)

    await saveChart()

    // Wait for crossfilter to settle
    await waitForCrossfilter()

    // First get the current row count, according to the count widget
    const countSelector = ".count-selected"
    const countSelectedEl = await page.$(countSelector)
    const countSelectedText = await page.evaluate(
      (el) => el.textContent,
      countSelectedEl
    )
    const countSelected = Number(countSelectedText.split(",").join(""))

    const countAllEl = await page.$(".count-all")
    const countAllText = await page.evaluate((el) => el.textContent, countAllEl)
    const countAll = Number(countAllText.split(",").join(""))

    expect(countSelected).toBeGreaterThan(0)
    expect(countSelected).not.toBeGreaterThan(countAll)

    // Get the map container dimensions and click with an offset landing on a polygon
    const { x, y } = await getMapRect()
    // this is an arbitrary offset and is influenced by the panel margin
    await page.mouse.click(x + 4, y + 80)

    // Wait for crossfilter to settle
    await waitForCrossfilter()

    // Build and save a cohort
    const cohortDimension = "STUSPS"
    await enterCohortBuildingMode(cohortDimension)
    await processPause(2)
    const cohortName = "ABBR"
    await saveCohortName(cohortName)

    await waitForCrossfilter()

    // There should be no error and a cohort should be present
    const cohortTitle = '[class="filter-cohort-display"] [class="title"]'
    await expectContainsText(cohortTitle, cohortName)

    const cohortColumn = '[class="filter-cohort-display"] [class="column"]'
    await expectContainsText(cohortColumn, cohortDimension)

    const cohortCount = '[class="filter-cohort-display"] [class="count"]'
    // this value is dependent on the click offset above
    await expectContainsText(cohortCount, "1")

    await expect(page).not.toMatchElement('[role="alertdialog"]')

    // Check the count widget to verity that the saved cohort is filtering
    const widgetDropdownButton = '[class="count-dropdown-opener"]'
    await clickAfterVisible(widgetDropdownButton)
    await waitForVisible(countSelector)

    await expectContainsText(countSelector, "0")
  })
})
