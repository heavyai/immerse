// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getTablesForDataSource } from "components/join-manager/utils"
import {
  Filter,
  MultiSourceFilter,
  filterHasChildren,
  isMultiSourceFilter
} from "./filter-types"
import { getDataSourcesForFilter } from "vega/utils/filter"
import { intersection } from "lodash"

export type CohortDimension = {
  name: string
  negated?: boolean
  cohortId?: string
  cohortName?: string
  dataSource?: string
  postFilters?: Filter[]
}

export type FilterAndCohort = {
  /** All dataSources that this filter filters on */
  dataSources: string[]

  /**
   * If this filter is a cohort, this will be the dimension on which the cohort
   * query shall filter
   */
  cohortDimension?: CohortDimension

  /** The actual filters (see filter-types.ts) */
  filter: Filter
}

export type QuickFilter = {
  /** Should be visible as a quick filter on dashboard */
  visible: boolean

  /** Values selectable for quick filtering on */
  optionValues: {
    [value: string]: boolean
  }
}

/** Base type for filter metadata */
export type BaseFilterMetadata = FilterAndCohort & {
  /** Whether or not the filter is enabled */
  enabled: boolean

  /** Whether or not the filter should be shown in Simple Filter Mode */
  simpleModeEnabled: boolean

  /**
   * A globally unique identifier for a filter. It's possible to manually set
   * the filter's name when creating it, otherwise, one will be generated
   * automatically.
   */
  name: string
  sharedCustom: boolean
  globalCustom: boolean
}

/** Metadata for dashboard filters */
export type DashboardFilterMetadata = BaseFilterMetadata & {
  /**
   * Should eventually be migrated to "DASHBOARD", as it is more descriptive
   * now that we have custom expressions on a more "global" level
   */
  appliesTo: "GLOBAL"

  /**
   * If the filter was created on a chart, but upgraded to a dashboard filter,
   * this will be set.
   */
  chartId?: string

  /**
   * If the filter was created on a chart, it may optionally be associated with
   * a layer on the chart. A value of undefined (when chartId is defined) means
   * that it applies to the entire chart.
   */
  layerId?: string
}

/** Crossfilters and chart-level filters */
export type ChartFilterMetadata = BaseFilterMetadata & {
  appliesTo: "CROSSFILTER" | "CHART"

  /** The chart this filter applies to */
  chartId: string

  /**
   * The layer this filter applies to. If undefined, the filter applies to the
   * whole chart.
   */
  layerId?: string
  /**
   * Quick filter properties, i.e. whether or not the filter should be visible
   * on the dashboard as a quick filter and what values are available to
   * quick filter on */
  quickFilter?: QuickFilter
}

// TODO: remove everything down to the next todo and then uncomment
// the following lines. Additionally, you'll need to remove any reference to
// isOldFilter and the associated if-branches that used it. Note that there are
// a few references to isOldFilter outside of this file, so grep for 'em.
//
// export type FilterMetadata = DashboardFilterMetadata | ChartFilterMetadata
export type OldFilterMetadata = BaseFilterMetadata & {
  appliesTo: "CROSSFILTER"
  chartId: string
  chartFilters: any[]
  chartRangeFilter: any[]
  isRangeFilter: boolean
  label: string
  isOldFilter: true
}
export type NewFilterMetadata = DashboardFilterMetadata | ChartFilterMetadata
export type FilterMetadata = OldFilterMetadata | NewFilterMetadata
export function isOldFilter(
  filter: FilterMetadata
): filter is OldFilterMetadata {
  return Boolean((filter as OldFilterMetadata).isOldFilter)
}
// TODO: remove everything above this line to the previous todo

export function buildDashboardCohortFilterMetadata(
  name: string,
  cohortDimension: CohortDimension,
  filter: Filter,
  enabled: boolean,
  simpleModeEnabled: boolean
): DashboardFilterMetadata {
  return {
    appliesTo: "GLOBAL",
    cohortDimension,
    name,
    enabled,
    simpleModeEnabled,
    dataSources: [cohortDimension.dataSource],
    filter
  }
}

export function buildDashboardFilterMetadata(
  name: string,
  filter: Filter,
  enabled: boolean,
  chartId?: string,
  layerId?: string,
  simpleModeEnabled = true,
  sharedCustom = false,
  globalCustom = false
): DashboardFilterMetadata {
  return {
    appliesTo: "GLOBAL",
    chartId,
    layerId,
    name,
    enabled,
    simpleModeEnabled,
    sharedCustom,
    globalCustom,
    dataSources: Array.from(getDataSourcesForFilter(filter)),
    filter
  }
}

export function buildCrossFilterMetadata(
  name: string,
  filter: Filter,
  enabled: boolean,
  chartId: string,
  layerId?: string
): ChartFilterMetadata {
  return {
    appliesTo: "CROSSFILTER",
    chartId,
    layerId,
    name,
    enabled,
    dataSources: Array.from(getDataSourcesForFilter(filter)),
    filter
  }
}

export function buildChartFilterMetadata(
  name: string,
  filter: Filter,
  enabled: boolean,
  chartId: string,
  layerId?: string,
  quickFilter?: QuickFilter,
  sharedCustom = false,
  globalCustom = false
): ChartFilterMetadata {
  return {
    appliesTo: "CHART",
    chartId,
    layerId,
    name,
    enabled,
    dataSources: Array.from(getDataSourcesForFilter(filter)),
    quickFilter,
    filter,
    sharedCustom,
    globalCustom
  }
}

export function buildChartCohortFilterMetadata(
  name: string,
  cohortDimension: CohortDimension,
  filter: Filter,
  enabled: boolean,
  chartId: string,
  layerId?: string
): ChartFilterMetadata {
  return {
    appliesTo: "CHART",
    chartId,
    layerId,
    name,
    enabled,
    cohortDimension,
    dataSources: cohortDimension.dataSource,
    filter
  }
}

export const filterMultiSourceFilterByDataSources = (
  filter: MultiSourceFilter,
  dataSources: string[]
): MultiSourceFilter => {
  const chartTables = dataSources.map(getTablesForDataSource).flat()
  const newFilters = Object.fromEntries(
    Object.entries(filter.filtersByDataSource).filter(
      ([_, singleSourceFilter]) => {
        if (filterHasChildren(singleSourceFilter)) {
          return singleSourceFilter.filters.every((ssf) =>
            chartTables.includes(ssf.table)
          )
        } else {
          // Our chart has this table, use the filter
          return chartTables.includes(singleSourceFilter.table)
        }
      }
    )
  )
  return {
    ...filter,
    filtersByDataSource: newFilters
  }
}

export const getFiltersForDataSources = (
  omnifilters: FilterAndCohort[],
  dataSources: string[]
): FilterAndCohort[] => {
  const chartTables = dataSources.map(getTablesForDataSource).flat()
  return omnifilters.flatMap((meta) => {
    const filterTables = meta.dataSources.map(getTablesForDataSource).flat()
    const tableIntersection = intersection(chartTables, filterTables)
    // If every table is the same between the two, return as is
    if (tableIntersection.length === filterTables.length) {
      return [meta]
    } else if (tableIntersection.length && isMultiSourceFilter(meta.filter)) {
      // Pick out the filters that apply
      const matchingFiltersByDataSource = filterMultiSourceFilterByDataSources(
        meta.filter,
        dataSources
      )
      // If there are matching filters, return them, otherwise fall through
      if (Object.keys(matchingFiltersByDataSource).length) {
        return [
          {
            ...meta,
            filter: matchingFiltersByDataSource
          }
        ]
      }
    }
    return []
  })
}

export const getFiltersAppliedToChart = (
  chartId: string,
  dataSources: string[],
  omnifilters: FilterMetadata[],
  includeSelfCrossfilters = false
): FilterAndCohort[] => {
  // TODO: change (meta as any) to just meta below
  return getFiltersForDataSources(
    omnifilters?.filter(
      (meta) =>
        meta.enabled &&
        (meta.appliesTo === "GLOBAL" ||
          (meta.appliesTo === "CHART" && (meta as any).chartId === chartId) ||
          (meta.appliesTo === "CROSSFILTER" &&
            ((meta as any).chartId !== chartId || includeSelfCrossfilters)))
    ) ?? [],
    dataSources
  )
}

export const getFiltersAppliedToLayer = (
  omnifilters: FilterAndCohort[],
  layerId?: string
): FilterAndCohort[] =>
  omnifilters?.filter(
    (f) => !(f as any).layerId || (f as any).layerId === layerId
  ) ?? []

export const getCrossfiltersDefinedOnChart = (
  chartId: string,
  omnifilters: FilterMetadata[]
): ChartFilterMetadata[] =>
  omnifilters.filter(
    (f): f is ChartFilterMetadata =>
      f.appliesTo === "CROSSFILTER" &&
      /* TODO: change (f as any) to just f */
      (f as any).chartId === chartId
  )
