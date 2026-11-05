// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const persistedDashboardKeys = Object.freeze([
  "annotations",
  "charts",
  "filters",
  "dashboard",
  "omnifilters",
  "filterZones",
  "cohorts",
  "parameters",
  "chartAddons",
  "tabId",
  "crossLinks",
  "joinDataSources",
  "sharedSettings"
])

function encodeDashboard(document, codec) {
  const binary = encodeURIComponent(
    JSON.stringify(document)
  ).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  )
  return codec.btoa(binary)
}

function decodeDashboard(wire, codec) {
  const binary = codec.atob(wire)
  const escaped = Array.from(
    binary,
    (character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`
  ).join("")
  return JSON.parse(decodeURIComponent(escaped))
}

// Application composition owns the migration list, chart registry and environment.
// The package never reads flags, globals, Redux, or application services.
function migrateDocument(document, migrations, migrationContext) {
  const seen = new Set()
  let result = JSON.parse(JSON.stringify(document))
  for (const migration of migrations) {
    if (!migration.id || seen.has(migration.id)) {
      throw new Error("Migration IDs must be unique and nonempty")
    }
    seen.add(migration.id)
    result = migration.apply(result, migrationContext)
  }
  return result
}
function mapDashboardCharts(state, transform) {
  if (!state || typeof state !== "object") {
    return state
  }
  const next = { ...state }
  if (next.charts) {
    next.charts = Object.fromEntries(
      Object.entries(next.charts).map(([id, chart]) => [id, transform(chart)])
    )
  }
  if (next.tabs && typeof next.tabs === "object") {
    next.tabs = Object.fromEntries(
      Object.entries(next.tabs).map(([id, tab]) => [
        id,
        mapDashboardCharts(tab, transform)
      ])
    )
  }
  return next
}
function upgradeChartMap(charts, migrationContext) {
  return Object.entries(charts).reduce((result, [id, chart]) => {
    const upgraded = migrationContext.upgradeChart(chart)
    return chart === upgraded ? result : { ...result, [id]: upgraded }
  }, charts)
}
module.exports = {
  upgradeChartMap,
  persistedDashboardKeys,
  encodeDashboard,
  decodeDashboard,
  migrateDocument,
  mapDashboardCharts
}
