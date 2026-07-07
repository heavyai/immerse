// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { JOIN_CONDITION_TYPES } from "components/join-manager/constants"
import { findJoinDataSourceForParameter } from "components/join-manager/use-join-from-parameter"
import { getTablesFromJoinDataSource } from "components/join-manager/utils"
import { intersection } from "lodash"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { buildFilterSql } from "vega/constants/filter-types"
import { getStore } from "./utils"

const buildJoinFilter = ({ filterMetadata, filterDataSource, tables }) => {
  const { joinDataSources } = getStore().getState()
  // The crossfilter for this chart intersects with us
  const jds = findJoinDataSourceForParameter(filterDataSource, joinDataSources)
  const joinDataSourceTables = getTablesFromJoinDataSource(jds)
  const chartAndFilterIntersection = intersection(joinDataSourceTables, tables)

  // All tables match, this will get included by chart or dashboard filters already
  // The code below will create filters for cases with only partial overlapping tables
  if (tables.length === joinDataSourceTables.length) {
    return null
  }

  // We found the join datasource for this filter AND it intersects with the tables in our chart
  if (jds && filterMetadata && chartAndFilterIntersection.length) {
    // Will need to loop when there can be > 1 join in a join data source
    const join = jds.joins[0]

    const filterSql = buildFilterSql(
      [filterMetadata.filter],
      filterDataSource,
      filterMetadata.layerId
    )

    // Cases for multiple matches above, we now know we only have 1 table in common
    const commonTable = chartAndFilterIntersection[0]

    const isGeoJoin =
      join.joinCondition &&
      Object.values(JOIN_CONDITION_TYPES).includes(join.joinCondition)

    let joinKey = null
    let outerKey = null
    if (isGeoJoin) {
      // We're not matching join keys in the geo join case
      // we're matching rowids from the same table
      const geoJoinKey =
        commonTable === join.leftTable
          ? `${join.leftTable}.rowid`
          : `${join.rightTable}.rowid`
      joinKey = geoJoinKey
      outerKey = geoJoinKey
    } else {
      // Default assume the righthand table is the one in the chart
      joinKey = `${join.leftTable}.${join.leftJoinKey}`
      outerKey = `${join.rightTable}.${join.rightJoinKey}`
      // Flip it if the common table is the lefthand table of the join
      if (commonTable === join.leftTable) {
        joinKey = `${join.rightTable}.${join.rightJoinKey}`
        outerKey = `${join.leftTable}.${join.leftJoinKey}`
      }
    }

    // Find the keys from the join using the join expression + filters
    const selectUniqueKeyFromJoin = `SELECT DISTINCT ${joinKey} FROM ${filterDataSource} WHERE ${filterSql}`
    return `${outerKey} IN (${selectUniqueKeyFromJoin})`
  }
  return null
}

/**
 * Looks at all _other_ omni/global filters that are applied to joins, and creates
 * cross-link style filters for this chart.
 * eg. WHERE id in (SELECT id FROM ltable join rtable on <filter_conditions> where <join_datasource_filters>)
 *
 * @param tables - Chart tables, we'll get join filters that apply to these tables
 * This could have > 1 table if it's another join that uses the same tables...
 * @param chartId - The chart id to apply the filter TO
 * @returns
 */
export function getJoinFilters({ tables, chartId }) {
  // this could be a join datasource itself... so for each of the tables in here
  // we need to grab filters from all of the other crossfilters
  const { omnifilters, ui: { filters } = {} } = getStore().getState()

  const filterTypes = ["GLOBAL", "CROSSFILTER"]

  // If we're not getting either filter type, we're not getting any
  // return
  if (!filterTypes.length) {
    return []
  }

  const externalCrossFilters = omnifilters
    .filter((f) => {
      // not newly created
      return !Object.keys(filters?.newlyCreated ?? {}).includes(f.name)
    })
    // Only look at filters from other charts, that are global/crossfilters
    .filter((f) => f.chartId !== chartId && filterTypes.includes(f.appliesTo))

  const joinFilters = externalCrossFilters
    .map((f) => {
      if (f.filter?.filterType === "MULTISOURCE") {
        return (
          f.dataSources?.map?.((dataSource) =>
            buildJoinFilter({
              tables,
              filterMetadata: f,
              filterDataSource: dataSource
            })
          ) ?? []
        )
      } else {
        return buildJoinFilter({
          tables,
          filterMetadata: f,
          // This isn't a multisource filter
          filterDataSource: f.dataSources[0]
        })
      }
    })
    .flat(2)
    .filter(Boolean)
    .map(process)

  return joinFilters
}
