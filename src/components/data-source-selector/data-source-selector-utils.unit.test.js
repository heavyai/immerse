// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { processTablesListFromDashboardState } from "./utils"

describe("processTablesListFromDashboardState", () => {
  it("keeps current sources first and sorts unused tables", () => {
    const result = processTablesListFromDashboardState({ flights: true }, [
      { name: "zebra" },
      { name: "flights" },
      { name: "alpha" }
    ])

    expect(result.dataSources).toEqual({ flights: true })
    expect(result.tables.map(({ label }) => label)).toEqual([
      "flights",
      "",
      "alpha",
      "zebra"
    ])
  })

  it("uses a table dataSource value when one is provided", () => {
    const result = processTablesListFromDashboardState(
      { "parameter.source": true },
      [{ name: "Selected table", dataSource: "parameter.source" }]
    )

    expect(result.tables[0]).toEqual(
      expect.objectContaining({
        label: "Selected table",
        value: "parameter.source"
      })
    )
  })
})
