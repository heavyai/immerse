// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  createChart,
  createDashboard,
  expectContainsText,
  saveChart,
  processPause,
  clickByText,
  waitForVisible,
  createVegaChart
} from "../utils"

import {
  openFilterPanel,
  createDashboardFilter,
  clickApplyButton,
  enterCohortBuildingMode,
  saveCohortName
} from "../utils/filter-panel"

describe("Filter Panel Cohort Builder", () => {
  it("Shows no sources error instead of filter buttons and disables cohort builder if user has no charts", async () => {
    await createDashboard("ui-test/filter-panel-cohort-builder")
    await openFilterPanel()
    await expect(page).toMatchElement(
      "[data-testid='filter-panel-no-source-error']"
    )

    await clickAfterVisible("[data-testid='filter-panel-mode-cohort-builder']")
    await expect(page).not.toMatchElement(".custom-sql-manager")
  })

  it("Opens when clicking on 'Add Dashboard Filter' button, saves dashboard filter", async () => {
    await createDashboard("ui-test/filter-panel-cohort-builder")
    await createChart("table", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"]
    })
    await saveChart()

    await createDashboardFilter()

    await expect(page).toMatchElement(".filter-component")
  })

  it("Opens when clicking on 'Add Dashboard Filter' button, saves cohort filter", async () => {
    const cohortName = "This is my cohort name"

    await createDashboard("ui-test/filter-panel-cohort-builder")
    await createChart("table", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"]
    })
    await saveChart()

    await createDashboardFilter()
    await enterCohortBuildingMode("uniquecarrier")
    await saveCohortName(cohortName)
    await clickAfterVisible('[data-testid="add-dashboard-filter-button"]')
    await clickByText(cohortName)
    // there should now be a filter component present
    await expect(page).toMatchElement(".filter-component")
    // There should be a cohort display
    await expect(page).toMatchElement(".filter-cohort-display")
    // DEBUG
    await processPause(2)
  })

  it("Opens when clicking on 'Add Custom SQL' button, saves custom sql", async () => {
    await createDashboard("ui-test/filter-panel-cohort-builder")
    await createChart("table", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"],
      measures: ["# Records", { type: "custom", value: "avg(airtime)" }]
    })
    await saveChart()
    await openFilterPanel()
    // click "add custom SQL filter" button
    await clickAfterVisible('[data-testid="add-dashboard-filter-button"]')
    await clickAfterVisible(".custom-sql-button-container button")
    await waitForVisible(".custom-sql-manager")
    // Click within the Custom SQL textarea
    await page.click('[data-testid="custom-sql-manager-expression"]')
    // Type in our custom sql
    await page.keyboard.type("flights_donotmodify.flight_month = 12")
    // Click apply
    await clickApplyButton()
    // there should now be a custom SQL filter component present
    await expect(page).toMatchElement(".filter-component-sql")
  })

  it("Opens when switching to cohort builder, saves", async () => {
    const cohortDimension = "uniquecarrier"

    await createDashboard("ui-test/filter-panel-cohort-builder")
    await createChart("table", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"]
    })
    await saveChart()

    await createDashboardFilter()
    await enterCohortBuildingMode(cohortDimension)

    await expectContainsText(".cohort-dimension-title", cohortDimension)
  })

  it("Opens when user is in cohort building mode, and changes the cohort dimension", async () => {
    const cohortDimension = "uniquecarrier"
    const newDimension = "tailnum"

    await createDashboard("ui-test/filter-panel-cohort-builder")
    await createChart("table", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"]
    })
    await saveChart()
    await createDashboardFilter()
    await enterCohortBuildingMode("uniquecarrier")

    await expectContainsText(".cohort-dimension-title", cohortDimension)

    await clickAfterVisible(".cohort-kebab-button")
    await clickAfterVisible(".cohort-kebab-menu .mdc-list-item")
    await waitForVisible(".cohort-builder")
    await clickByText(newDimension)
    await page.click('[data-testid="cohort-builder-apply"]')

    await expect(page).toMatchElement(".cohort-dimension")
    await expectContainsText(".cohort-dimension-title", newDimension)
  })

  it("Opens when the user adds a Vega Bar prefilter, saves regular filter", async () => {
    await createDashboard("ui-test/filter-panel-cohort-builder")
    await createVegaChart("vega-combo", {
      dataSource: "flights_donotmodify",
      dimensions: [],
      measures: []
    })
    await clickAfterVisible('[data-testid="chart-editor-add-prefilter-button"]')
    await waitForVisible(".filter-column-editor")
    // Select flight_month column
    await processPause()
    await clickByText("flight_month")
    await processPause()
    // The filter component should be present
    await expect(page).toMatchElement(".filter-component")
    // the filter title should equal flight_month
    await expectContainsText("span.data-expression", "flight_month")
  })
})
