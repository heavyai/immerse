// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sqlFormatter from "sql-formatter/lib/sqlFormatter"
import { CellType, ChartDef, ChartTypes, NotebookCell } from "./types"
import { IconVerticalBarChart } from "components/svg-icons/icon-vertical-bar-chart"
import { IconPieChart } from "components/svg-icons/icon-pie-chart"
import { IconMultiSeriesBarChart } from "components/svg-icons/icon-multi-series-bar"
import { IconLineChart } from "components/svg-icons/icon-line-chart"
import { IconScatterChart } from "components/svg-icons/icon-scatter-chart"
import { IconHeatmapChart } from "components/svg-icons/icon-heatmap-chart"
import { IconGeoChart } from "components/svg-icons/icon-geo-chart"
import { IconVegaChoropleth } from "components/svg-icons/icon-vega-choropleth"
import { QUERY_LIMIT } from "./constants"
import { IconMultiSeriesLineChart } from "components/svg-icons/icon-multi-series-line"
import { sqlNotebookQueue } from "./snackbar-queue"
import { SqlNotebookError } from "./components/sql-notebook-error"
import React from "react"

export function inputIsValidJSON(input: string) {
  try {
    JSON.parse(input)
  } catch (error) {
    return false
  }

  return true
}

// Returns pretty-printed user input
export function formatJSON(value: string) {
  return JSON.stringify(JSON.parse(value), null, 2)
}

// Returns pretty-printed user input
export function formatSQL(input: string) {
  // UD(T)Fs use a custom `=>` for argument names
  return sqlFormatter.format(input).replaceAll("= >", "=>")
}

// Replaces all newlines with a space, trims all duplicate spaces
export function singleLineSQL(input: string) {
  const newlinesRemoved = input.replace(/\n+/g, " ")
  return newlinesRemoved.replace(/\s\s+/g, " ")
}

export const isJson = (query: string): boolean => {
  try {
    const parsed = JSON.parse(query)

    return parsed && typeof parsed === "object"
  } catch {
    return false
  }
}

export const isInputCell = (cell: NotebookCell): boolean =>
  [CellType.INPUT_ANALYSIS, CellType.INPUT_SQL].includes(cell?.type)

export const getChartIcon = (chart: ChartDef) => {
  const CHART_ICONS: { [key: string]: React.FC<any> } = {
    [ChartTypes.BAR]: IconVerticalBarChart,
    [ChartTypes.PIE]: IconPieChart,
    [ChartTypes.LAYERED_BAR]: IconMultiSeriesBarChart,
    [ChartTypes.LINE]: IconLineChart,
    [ChartTypes.LAYERED_LINE]: IconMultiSeriesLineChart,
    [ChartTypes.HISTOGRAM]: IconVerticalBarChart,
    [ChartTypes.SCATTER]: IconScatterChart,
    [ChartTypes.HEATMAP]: IconHeatmapChart,
    [ChartTypes.POINT_MAP]: IconGeoChart,
    [ChartTypes.POLYGON_MAP]: IconGeoChart,
    [ChartTypes.LINE_MAP]: IconGeoChart,
    [ChartTypes.VEGA_CHOROPLETH]: IconVegaChoropleth
  }

  return CHART_ICONS[chart.type] ?? IconPieChart
}

// Detect if input should switch to SQL Editor cell type (if SQL or JSON detected)
export const sqlAutodetected = (text: string): boolean => {
  const SQL_PREFIXES = [
    "SELECT",
    "ALTER",
    "CREATE",
    "DELETE",
    "DROP",
    "UPDATE",
    "INSERT",
    "WITH",
    "TRUNCATE",
    "COMMENT",
    "DUMP",
    "EXPLAIN CALCITE",
    "EXPLAIN PLAN",
    "GRANT",
    "KILL", // as in KILL QUERY
    "OPTIMIZE",
    "REASSIGN",
    "RENAME",
    "RESTORE",
    // Don't detect "SHOW" alone as it is a common first word for IQ prompts
    "SHOW CREATE",
    "SHOW DATABASES",
    "SHOW MODELS",
    "SHOW FOREIGN TABLES",
    "SHOW FUNCTIONS",
    "SHOW QUERIES",
    "SHOW RUNTIME",
    "SHOW SERVERS",
    "SHOW SUPPORTED", // as in SHOW SUPPORTED DATA SOURCES
    "SHOW ROLES",
    "SHOW POLICIES",
    "SHOW TABLE", // Covers SHOW TABLES, SHOW TABLE FUNCTIONS, SHOW TABLE DETAILS cases
    "SHOW USER",
    "VALIDATE",
    "{" // Vega JSON
  ]
  const trimmedText = text.trimStart().toUpperCase()
  return SQL_PREFIXES.some((keyword) => trimmedText.startsWith(keyword))
}

export const limitQuery = (query: string, limit: number = QUERY_LIMIT) => {
  let limitedQuery = query
  if (
    !limitedQuery.toUpperCase().includes("LIMIT") &&
    limitedQuery.toUpperCase().startsWith("SELECT")
  ) {
    limitedQuery = limitedQuery.endsWith(";")
      ? limitedQuery.slice(0, -1).concat(` LIMIT ${limit};`)
      : limitedQuery.concat(` LIMIT ${limit};`)
  }
  return limitedQuery
}

export const calculateCustomColorRange = (
  domain: string[],
  colorScale: string[]
) => {
  const colors = []
  let colorIndex = 0

  while (colors.length < domain.length) {
    colors.push(colorScale[colorIndex])
    colorIndex = (colorIndex + 1) % colorScale.length
  }

  return colors
}

/**
 * Simple visibility check (vertical space only) ripped from stackoverflow
 * @param el - Element to check the visibility of
 * @param container - The container to check the visibility within, defaults to the whole body
 * @returns Boolean - Is el visible in container
 */
export const isElementVisible = (
  el: Element | null,
  container: Element | undefined | null
) => {
  if (!el) {
    return false
  }
  container = container || document.body
  const { top, bottom, height } = el.getBoundingClientRect()
  const holderRect = container.getBoundingClientRect()

  return top <= holderRect.top
    ? holderRect.top - top <= height
    : bottom - holderRect.bottom <= height
}

export function notifySqlNotebookError(errorText: string) {
  const errorMessage = <SqlNotebookError message={errorText} />
  sqlNotebookQueue.notify({
    body: errorMessage
  })
}
