// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const {
  encodeDashboard,
  decodeDashboard,
  migrateDocument,
  mapDashboardCharts,
  upgradeChartMap
} = require("./index")
const codec = { btoa, atob }
it("preserves JSON/UTF-8 base64 bytes, order, unknown fields and nested tabs", () => {
  const document = {
    dashboard: { title: "é 測試 😀" },
    charts: { "1": { type: "pie", version: 1 } },
    extension: { value: true }
  }
  const wire = encodeDashboard(document, codec)
  expect(wire).toBe(
    Buffer.from(JSON.stringify(document), "utf8").toString("base64")
  )
  expect(decodeDashboard(wire, codec)).toEqual(document)
  expect(() => decodeDashboard("invalid!!!", codec)).toThrow()
  expect(() => decodeDashboard(btoa("{bad json}"), codec)).toThrow()
})
it("migration order/migrationContext are explicit and source documents remain unchanged", () => {
  const source = { dashboard: { version: 1 }, unknown: "keep" }
  const migrationContext = { target: 2 }
  const calls = []
  const migrations = [
    {
      id: "upgrade",
      apply: (document, input) => {
        calls.push(input)
        document.dashboard.version = input.target
        return document
      }
    }
  ]
  const upgraded = migrateDocument(source, migrations, migrationContext)
  expect(upgraded).toEqual({ dashboard: { version: 2 }, unknown: "keep" })
  expect(source.dashboard.version).toBe(1)
  expect(migrateDocument(upgraded, migrations, migrationContext)).toEqual(
    upgraded
  )
  expect(calls).toEqual([migrationContext, migrationContext])
  expect(() =>
    migrateDocument(source, [...migrations, ...migrations], migrationContext)
  ).toThrow("unique")
})
it("chart traversal covers inactive tabs without dropping extensions or mutating inputs", () => {
  const source = {
    charts: { "1": { type: "pie", old: true } },
    tabs: {
      inactive: {
        charts: { "2": { type: "number", old: true } },
        extra: "keep"
      }
    }
  }
  const result = mapDashboardCharts(source, ({ old, ...chart }) => ({
    ...chart,
    upgraded: old
  }))
  expect(result.tabs.inactive.charts["2"]).toEqual({
    type: "number",
    upgraded: true
  })
  expect(result.tabs.inactive.extra).toBe("keep")
  expect(source.charts["1"].old).toBe(true)
  expect(mapDashboardCharts(null, (chart) => chart)).toBe(null)
})

it("chart upgraders are injected and unchanged maps retain identity", () => {
  const charts = { "1": { type: "fixture", version: 1, extension: "keep" } }
  const migrationContext = {
    upgradeChart: (chart) =>
      chart.version === 2 ? chart : { ...chart, version: 2 }
  }
  const upgraded = upgradeChartMap(charts, migrationContext)
  expect(upgraded["1"]).toEqual({
    type: "fixture",
    version: 2,
    extension: "keep"
  })
  expect(charts["1"].version).toBe(1)
  expect(upgradeChartMap(upgraded, migrationContext)).toBe(upgraded)
})
