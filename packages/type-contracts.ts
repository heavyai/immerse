// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  encodeDashboard,
  decodeDashboard,
  migrateDocument
} from "@immerse/dashboard-document"
import { createChartRegistry, ChartPlugin } from "@immerse/chart-core"
import { createDbTransport } from "@immerse/connector"
import {
  createLegacyQueryRuntime,
  createChartQueryRuntime,
  createVegaResultReducers
} from "@immerse/query-runtime"
import { createLegacyDcEngine } from "@immerse/chart-engine-dc"
const codec = { atob: (wire: string) => wire, btoa: (binary: string) => binary }
const document = decodeDashboard(encodeDashboard({ charts: {} }, codec), codec)
migrateDocument(
  document,
  [
    {
      id: "fixture",
      apply: (value, migrationContext: { enabled: boolean }) =>
        migrationContext.enabled ? value : {}
    }
  ],
  { enabled: true }
)
createChartRegistry<ChartPlugin>().register({
  type: "fixture",
  capabilities: ["render"]
})
const client = {
  queryAsync: async () => [],
  queryDFAsync: async () => [],
  renderVegaAsync: async () => ({}),
  getTablesAsync: async () => []
}
createDbTransport(client).query("SELECT 1")
createLegacyQueryRuntime((options: { id: string }) => options).forChart({
  id: "fixture"
})
createLegacyDcEngine({
  redrawAllAsync: async () => undefined,
  renderAllAsync: async () => undefined
}).redraw()

import { createFilterEngine } from "@immerse/filter-engine"
const runtime = createChartQueryRuntime()
const ticket = runtime.begin({ chartId: "fixture", channel: "data" })
runtime.commit(ticket, "rows", [1])
runtime.writeRender("fixture", { focus: [] })
runtime.getRenderSnapshot()
runtime.execute({ chartId: "fixture" }, async (signal) => signal.aborted)
createVegaResultReducers({
  types: { REQUEST_DATA: "request" },
  getErrorMessageFromBackendError: () => "failed"
})
createFilterEngine({
  isBERendered: () => false,
  chartTypes: () => ({}),
  getTablesForFilter: () => new Set<string>(),
  getTablesForDataSource: () => [],
  chartSupportsChartSpecificFilters: () => false,
  buildOmnifilterSql: () => "",
  filterHasChildren: () => false,
  buildCrossLinkFiltersInternal: () => [],
  getJoinFilters: () => []
}).buildFilterString("fixture", { tables: [], omnifilters: [] })
