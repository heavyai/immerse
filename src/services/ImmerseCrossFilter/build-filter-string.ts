// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { legacyBuildFilterStringInternal } from "./filter-query-reference"
import { createFilterEngine } from "@immerse/filter-engine"
import { isBERendered } from "charts/raster-chart/raster-utils"
import { CHART_TYPES } from "constants/charts"
import { getTablesForFilter } from "vega/utils/filter"
import { getTablesForDataSource } from "components/join-manager/utils"
import { chartSupportsChartSpecificFilters } from "charts/utils/chart-type"
import { getStore } from "services/legacy-application-context"
import {
  buildOmnifilterSql,
  filterHasChildren
} from "vega/constants/filter-types"
import { buildCrossLinkFiltersInternal } from "utils/crosslink-utils"
import { getLayerIdFromName } from "./utils"
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

export const filterQueryComparison = { compared: 0, mismatches: 0 }

export function buildFilterStringInternal(chartId: string, options: any = {}) {
  const mode = getFeatureFlag(available_feature_flags.FILTER_QUERY_PATH)
  const joinFilters =
    options.includeGlobal === false
      ? []
      : getJoinFilters({ tables: options.tables, chartId })
  const queryContext = { ...options, precomputedJoinFilters: joinFilters }
  if (mode === "legacy") {
    return legacyBuildFilterStringInternal(chartId, queryContext)
  }
  const engine = createFilterEngine({
    isBERendered,
    chartTypes: () => CHART_TYPES,
    getTablesForFilter,
    getTablesForDataSource,
    chartSupportsChartSpecificFilters,
    buildOmnifilterSql,
    filterHasChildren,
    buildCrossLinkFiltersInternal,
    getJoinFilters: () => joinFilters
    // Chart and dashboard selection are configured by the application adapter below.
  })
  const sql = engine.buildFilterString(chartId, options)
  if (mode !== "compare") {
    return sql
  }
  const reference = legacyBuildFilterStringInternal(chartId, queryContext)
  filterQueryComparison.compared += 1
  if (sql !== reference) {
    filterQueryComparison.mismatches += 1
  }
  if (typeof window !== "undefined" && window.immerseModernizationMetrics) {
    window.immerseModernizationMetrics.filterQueryComparison = {
      ...filterQueryComparison
    }
  }
  return reference === sql ? sql : reference
}

export default buildFilterString
