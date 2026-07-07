// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Filter,
  filterHasChild,
  filterHasChildren,
  isMultiSourceFilter
} from "vega/constants/filter-types"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import { FILTER_TYPE_BOUNDING_BOX } from "vega/constants/filter-type-constants"
import { getTablesForDataSource } from "components/join-manager/utils"

/**
 * Recursively find all datasources from a given filter.
 * @param filter The filter to get datasources from
 * @param dataSources (optional) The Set to store datasources in
 * @returns a Set of datasources
 */
export function getDataSourcesForFilter(
  filter: Filter,
  dataSources: Set<string> | null = null
): Set<string> {
  if (!dataSources) {
    dataSources = new Set<string>()
  }
  if (filterHasChild(filter)) {
    getDataSourcesForFilter(filter.filter, dataSources)
  } else if (filterHasChildren(filter)) {
    filter.filters.forEach((f) => {
      getDataSourcesForFilter(f, dataSources)
    })
  } else if (isMultiSourceFilter(filter)) {
    Object.values(filter.filtersByDataSource).forEach((f) => {
      getDataSourcesForFilter(f, dataSources)
    })
  } else {
    dataSources.add(filter.dataSource)
  }

  return dataSources
}

/**
 *
 * @param filter The filter to get tables for
 * @param useDataSource - This will use the tables from the filters _datasource_ if true, otherwise it will
 * use the table property. If datasource is a join, this means it will get all tables in that join. The table
 * property will always be the table of the column that the filter applies to (one of the specific tables used in a join)
 * @param tables
 * @returns
 */
export function getTablesForFilter(
  filter: Filter,
  opts: { useDataSource?: boolean } = { useDataSource: false },
  tables: Set<string> | null = null
): Set<string> {
  if (!tables) {
    tables = new Set<string>()
  }
  const { useDataSource } = opts
  if (filterHasChild(filter)) {
    getTablesForFilter(filter.filter, opts, tables)
  } else if (filterHasChildren(filter)) {
    filter.filters.forEach((f) => {
      getTablesForFilter(f, opts, tables)
    })
  } else if (isMultiSourceFilter(filter)) {
    Object.values(filter.filtersByDataSource).forEach((f) => {
      getTablesForFilter(f, opts, tables)
    })
  } else if (useDataSource) {
    // We're at a leaf, use the filter's datasource if useDataSource is  true
    const dsTables = getTablesForDataSource(filter.dataSource)
    dsTables.forEach((t) => tables.add(t))
  } else {
    // Otherwise use the specific table from the filters column, even if its from a join datasource
    tables.add(filter.table)
  }

  return tables
}

/**
 * Recursively find all children of a given filter.
 * @param filter The filter to get children from
 * @param children (optional) The Set to store children in
 * @returns a Set of children
 */

export function getChildFilters(
  filter: Filter,
  children: Set<string> | null = null
): Set<string> {
  if (!children) {
    children = new Set<string>()
  }

  if (filterHasChild(filter)) {
    getChildFilters(filter.filter, children)
  } else if (filterHasChildren(filter)) {
    filter.filters.forEach((f) => {
      getChildFilters(f, children)
    })
  } else if (isMultiSourceFilter(filter)) {
    Object.values(filter.filtersByDataSource).forEach((f) => {
      getChildFilters(f, children)
    })
  } else {
    children.add(filter)
  }

  return children
}

export function findBoundingBoxFilter(filter: Filter): Filter | undefined {
  return findFilterOfType(filter, FILTER_TYPE_BOUNDING_BOX)
}

export function findFilterOfType(
  filter: Filter,
  filterType: string,
  negated = false
): Filter | undefined {
  return findFilterWithAttribute({
    filter,
    attribute: "filterType",
    value: filterType,
    negated
  })
}

export function findFilterWithAttribute({
  filter,
  attribute,
  value,
  negated = false,
  output = []
}: Object): Filter | undefined {
  if (filterHasChild(filter)) {
    return findFilterWithAttribute({
      filter: filter.filter,
      attribute,
      value,
      negated,
      output
    })
  } else if (filterHasChildren(filter)) {
    const found = filter.filters.filter((f) =>
      findFilterWithAttribute({ filter: f, attribute, value, negated, output })
    )
    return found[0]
  } else if (isMultiSourceFilter(filter)) {
    const found = Object.values(filter.filtersByDataSource).filter((f) =>
      findFilterWithAttribute({ filter: f, attribute, value, negated, output })
    )
    return found[0]
  } else if (
    (filter[attribute] === value && !negated) ||
    (filter[attribute] !== value && negated)
  ) {
    output.push(filter)
    return filter
  } else {
    return undefined
  }
}

export function hasBoundingBoxFilter(filter: Filter): boolean {
  return Boolean(findBoundingBoxFilter(filter))
}

export function hasNonBoundingBoxFilter(filter: Filter): boolean {
  return Boolean(findFilterOfType(filter, FILTER_TYPE_BOUNDING_BOX, true))
}

export function hasNonBoundingBoxNonGeoJoinFilter(filter: Filter): boolean {
  // okay. We need to do this in two stages. First, we're gonna find all of the non bbox filters.
  const nonbboxFilters = []
  findFilterWithAttribute({
    filter,
    attribute: "filterType",
    value: FILTER_TYPE_BOUNDING_BOX,
    negated: true,
    output: nonbboxFilters
  })

  // if we have any of 'em, we're gonna reduce and check 'em all to see if we have a geojoinBoundingBox filter.
  const nonGeoJoin = nonbboxFilters.reduce(
    (nonGeo, f) =>
      nonGeo ||
      Boolean(
        findFilterWithAttribute({
          filter: f,
          attribute: "geojoinBoundingBox",
          value: true,
          negated: true
        })
      ),
    false
  )

  return nonGeoJoin
}

export function formatCoordinate(coordinate) {
  if (getFeatureFlag(available_feature_flags.TRUNCATE_MAP_COORDINATES)) {
    return parseFloat(
      coordinate.toFixed(
        getFeatureFlag(available_feature_flags.MAP_COORDINATES_PRECISION)
      )
    )
  } else {
    return coordinate
  }
}

export function focusChartFilterName(
  chartId: string,
  filterSetId: string
): string {
  return `zone${filterSetId}-chart${chartId}-crossfilter`
}

export function rangeChartFilterName(
  chartId: string,
  filterSetId: string
): string {
  return `zone${filterSetId}-chart${chartId}-range-crossfilter`
}

export function isFocusChartFilterName(name: string): boolean {
  return /^zone.*-chart[0-9]+-crossfilter$/.test(name)
}

export function isRangeChartFilterName(name: string): boolean {
  return /^zone.*-chart.*-range-crossfilter$/.test(name)
}
