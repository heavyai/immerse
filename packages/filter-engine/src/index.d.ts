// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface FilterQueryContext {
  chart?: any
  omnifilters?: any[]
  includeGlobal?: boolean
  includeCharts?: boolean
  tables?: string[]
  dataSource?: string
  layerId?: string
  excludeFilters?: string[]
  excludeChartFilters?: string[]
  crossLinks?: any[]
}
export interface FilterEnginePorts {
  isBERendered(type: string): boolean
  chartTypes(): { BACKEND_CHOROPLETH?: string }
  getTablesForFilter(filter: any): Set<string>
  getTablesForDataSource(dataSource: string): string[]
  chartSupportsChartSpecificFilters(chart: any): boolean
  buildOmnifilterSql(filter: any, dataSource?: string, layerId?: string): string
  filterHasChildren(filter: any): boolean
  buildCrossLinkFiltersInternal(
    chartId: string,
    tables: string[],
    links: any[]
  ): any[]
  getJoinFilters(context: { tables: string[]; chartId: string }): any[]
}
export interface FilterEngine {
  getChartFilters(
    context: FilterQueryContext & { chartId: string; tables: string[] }
  ): any[]
  getDashboardFilters(context: FilterQueryContext & { tables: string[] }): any[]
  buildFilterString(chartId: string, context?: FilterQueryContext): string
}
export function createFilterEngine(ports: FilterEnginePorts): FilterEngine
export function createLegacyFilterMigrator(ports: {
  isValidFilter(filter: any): boolean
  Omnifilter: Record<string, (...args: any[]) => any>
  isNumerical(type: string): boolean
  pushid(): string
}): (
  document: any
) => { dashboardStateOmnifilters: any; convertedDashboardFilterIds: string[] }
