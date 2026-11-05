// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  encodeDashboard,
  decodeDashboard,
  migrateDocument
} from "@immerse/dashboard-document"
import { createChartRegistry, ChartPlugin } from "@immerse/chart-core"
import { createDbTransport } from "@immerse/connector"
import { createLegacyQueryRuntime } from "@immerse/query-runtime"
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
