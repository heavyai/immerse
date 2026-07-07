// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  buildOmnifilterSql,
  filterHasChildren
} from "vega/constants/filter-types"
import { buildCrossLinkFiltersInternal } from "utils/crosslink-utils"
import {
  getChartFiltersInternal,
  getDashboardFiltersInternal,
  getLayerIdFromName,
  getStore
} from "./utils"
import { Chart } from "vega/charts/types"
import { Filter } from "constants/filter-types"
import { CrossLink } from "constants/crosslink-types"
import { getJoinFilters } from "./ImmerseCrossFilterJoin"

export function buildFilterString(
  chartId: string,
  {
    includeGlobal = true,
    includeCharts = true,
    tables,
    dataSource,
    layerName,
    layerId,
    useFakeChart,
    excludeFilters,
    excludeChartFilters = []
  }: {
    includeGlobal?: Boolean
    includeCharts?: Boolean
    tables?: Array<string>
    dataSource?: string
    layerId?: string
    layerName?: string
    useFakeChart?: boolean
    excludeFilters?: Array<string>
    excludeChartFilters?: Array<string>
  } = {}
) {
  const state = getStore().getState()
  const chart = useFakeChart ? undefined : state.charts[chartId]
  const { omnifilters, crossLinks } = state

  const parsedLayerId =
    layerId && typeof layerId === "number"
      ? layerId
      : getLayerIdFromName(layerName, state.charts[chartId])

  return buildFilterStringInternal(chartId, {
    chart,
    omnifilters,
    dataSource,
    includeGlobal,
    includeCharts,
    tables,
    layerId: parsedLayerId,
    excludeFilters,
    excludeChartFilters,
    crossLinks
  })
}

export function buildFilterStringInternal(
  chartId: string,
  {
    chart,
    omnifilters,
    includeGlobal = true,
    includeCharts = true,
    tables,
    dataSource,
    layerId,
    excludeFilters,
    excludeChartFilters = [],
    crossLinks = []
  }: {
    chart?: Chart
    omnifilters?: Array<Filter>
    includeGlobal?: Boolean
    includeCharts?: Boolean
    tables?: Array<string>
    dataSource?: string
    layerId?: string
    excludeFilters?: Array<string>
    excludeChartFilters?: Array<string>
    crossLinks?: Array<CrossLink>
  } = {}
) {
  const allFilters = []

  // getChartFiltersInternal and getDashboardfiltersInternal will grab any omnifilters
  // that have _any_ overlapping tables with the chart's datasource.
  // Then we need to filter any multisource or AND/OR filters (which can contain filters with different tables)
  // to only grab the ones that have the tables provided.
  if (includeCharts) {
    allFilters.push(
      ...getChartFiltersInternal({
        chartId,
        tables,
        layerId,
        chart,
        omnifilters,
        excludeChartFilters
      })
    )
  }

  if (includeGlobal) {
    allFilters.push(
      ...getDashboardFiltersInternal({
        tables,
        excludeFilters,
        omnifilters
      })
    )
    allFilters.push(
      ...buildCrossLinkFiltersInternal(chartId, tables, crossLinks)
    )
    allFilters.push(
      ...getJoinFilters({
        tables,
        chartId
      })
    )
  }

  // Certain filter types (AND, OR, MULTISOURCE) can have multiple tables and datasources
  // Now we check all filters and if they have child filters we only keep
  // the ones that have a table specified by the "tables" arg.
  const allRelevantFilters = allFilters.map((f) => {
    if (filterHasChildren(f)) {
      return {
        ...f,
        filters: f.filters.filter((childFilter) => {
          // Make sure the table of this filter is included in the tables
          // we are getting filters for
          return tables?.includes(childFilter.table)
        })
      }
    } else {
      return f
    }
  })

  const allFilterStrings = allRelevantFilters.map((f) => {
    if (typeof f === "string") {
      return f
    } else {
      return buildOmnifilterSql(
        f,
        dataSource,
        f.chartId === chartId ? layerId : undefined
      )
    }
  })
  // Filter out blank strings, if buildOmnifilterSql generates nothing
  // for the given datasource + filter, it could return blank string
  return allFilterStrings.filter(Boolean).join(" AND ")
}

export default buildFilterString
