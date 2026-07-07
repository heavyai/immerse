// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  createChart,
  createDashboard,
  saveChart
} from "../utils"

import {
  createDashboardFilter,
  editSimpleFilter,
  openFilterPanel
} from "../utils/filter-panel"

describe("Simple Filter Panel", () => {
  beforeEach(async () => {
    await createDashboard("ui-test/filter-panel")
    await createChart("table", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"]
    })
    await saveChart()
    await openFilterPanel()
  })

  xit("displays Adv Mode if there are no Simple Mode filters", async () => {
    await expect(page).toMatchElement(
      "[data-testid='filter-panel-adv-filters']"
    )

    // Simple Mode toggle should be disabled
    await clickAfterVisible("[data-testid='filter-panel-simple-mode-toggle']")
    await expect(page).not.toMatchElement(
      "[data-testid='filter-panel-simple-filters']"
    )
  })

  xit("displays Simple Mode if there are Simple Mode filters", async () => {
    await expect(page).toMatchElement(
      "[data-testid='filter-panel-adv-filters']"
    )

    await createDashboardFilter()
    await clickAfterVisible(
      "[data-testid='filter-component-simple-mode-toggle']"
    )
    await clickAfterVisible("[data-testid='filter-panel-simple-mode-toggle']")
    await expect(page).toMatchElement(
      "[data-testid='filter-panel-simple-filters']"
    )
  })

  it("rerenders charts when Simple Filters are edited", async () => {
    await createDashboardFilter()
    await clickAfterVisible(
      "[data-testid='filter-component-simple-mode-toggle']"
    )
    await clickAfterVisible("[data-testid='filter-panel-simple-mode-toggle']")
    await expect(page).toMatchElement(
      "[data-testid='filter-panel-simple-filters']"
    )

    // Value intentionally out of bounds so chart changes are detectable
    await editSimpleFilter("flight_month", 100)
    // .table-row.grouped-data comes from heavyai-charting
    await expect(page).not.toMatchElement(".table-row.grouped-data")
    await editSimpleFilter("flight_month", 5)
    await expect(page).toMatchElement(".table-row.grouped-data")
  })
})
