// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  clickAfterVisible,
  createChart,
  createDashboard,
  saveChart
} from "../utils"

import { createDashboardFilter, openFilterPanel } from "../utils/filter-panel"

describe("Filter Panel", () => {
  beforeEach(async () => {
    await createDashboard("ui-test/filter-panel")
    await createChart("table", {
      dataSource: "flights_donotmodify",
      dimensions: ["carrier_name"]
    })
    await saveChart()
    await openFilterPanel()
  })

  it("creates filters and deletes filters", async () => {
    await createDashboardFilter()
    await expect(page).toMatchElement("[data-testid='filter-component']")
    await clickAfterVisible("[data-testid='filter-component']")
    await clickAfterVisible("[data-testid='filter-component-delete']")
    await expect(page).not.toMatchElement("[data-testid='filter-component']")
  })
})
