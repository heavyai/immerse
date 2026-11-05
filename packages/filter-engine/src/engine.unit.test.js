// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { createFilterEngine, createLegacyFilterMigrator } = require("./index")
const ports = {
  isBERendered: () => false,
  chartTypes: () => ({ BACKEND_CHOROPLETH: "choropleth" }),
  getTablesForFilter: (filter) =>
    new Set([filter.table || filter.filter?.table]),
  getTablesForDataSource: (source) => [source],
  chartSupportsChartSpecificFilters: () => true,
  buildOmnifilterSql: (filter) => filter.sql,
  filterHasChildren: (filter) => Array.isArray(filter.filters),
  buildCrossLinkFiltersInternal: () => [],
  getJoinFilters: () => []
}
it("selects enabled filters by target chart, table and layer", () => {
  const engine = createFilterEngine(ports)
  const global = {
    name: "global",
    enabled: true,
    appliesTo: "GLOBAL",
    table: "sales",
    sql: "amount > 10"
  }
  const chart = {
    name: "chart",
    enabled: true,
    appliesTo: "CHART",
    chartId: "1",
    layerId: "a",
    table: "sales",
    sql: "region = 'West'"
  }
  const other = { ...chart, chartId: "2" }
  const input = {
    chart: { type: "vega" },
    tables: ["sales"],
    layerId: "a",
    omnifilters: [global, chart, other, { ...global, enabled: false }]
  }
  expect(engine.buildFilterString("1", input)).toBe(
    "region = 'West' AND amount > 10"
  )
  expect(engine.getChartFilters({ ...input, chartId: "1" })).toEqual([chart])
  expect(
    engine.buildFilterString("1", {
      ...input,
      excludeFilters: ["global"],
      excludeChartFilters: ["chart"]
    })
  ).toBe("")
})
it("retains shared crossfilters, link and join SQL while avoiding input mutation", () => {
  const engine = createFilterEngine({
    ...ports,
    buildCrossLinkFiltersInternal: () => ["linked = 1"],
    getJoinFilters: () => ["joined = 1"]
  })
  const filter = {
    enabled: true,
    appliesTo: "CROSSFILTER",
    chartId: "2",
    table: "sales",
    sql: "region = 'West'"
  }
  const input = {
    chart: { type: "vega" },
    tables: ["sales"],
    omnifilters: [filter]
  }
  const before = JSON.stringify(input)
  expect(engine.buildFilterString("1", input)).toBe(
    "region = 'West' AND linked = 1 AND joined = 1"
  )
  expect(JSON.stringify(input)).toBe(before)
})
it("migrates old filters deterministically and idempotently without mutating the document", () => {
  const migrate = createLegacyFilterMigrator({
    isValidFilter: () => true,
    isNumerical: () => true,
    Omnifilter: { simpleFilter: (...args) => ({ dataSource: args[1], args }) },
    pushid: () => "legacy-1"
  })
  const doc = {
    filters: [
      {
        table: "sales",
        dataSource: "sales",
        type: "INT",
        value: "amount",
        operand: "10",
        operator: ">"
      }
    ],
    omnifilters: [],
    opaquePlugin: { version: 4 }
  }
  const migrated = migrate(doc)
  expect(doc.omnifilters).toEqual([])
  expect(doc.filters).toHaveLength(1)
  expect(migrated.convertedDashboardFilterIds).toEqual(["legacy-1"])
  expect(
    migrated.dashboardStateOmnifilters.omnifilters[0].filter.args
  ).toEqual(["sales", "sales", "amount", "INT", ">", 10])
  expect(
    migrate(migrated.dashboardStateOmnifilters).dashboardStateOmnifilters
  ).toEqual(migrated.dashboardStateOmnifilters)
  expect(migrated.dashboardStateOmnifilters.opaquePlugin).toEqual(
    doc.opaquePlugin
  )
})
