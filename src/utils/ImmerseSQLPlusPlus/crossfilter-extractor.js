// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"

import {
  getChartFilters,
  getDashboardFilters,
  getLayerIdFromName,
  getStore
} from "services/ImmerseCrossFilter/utils"
import {
  buildDataExpression,
  buildOmnifilterSql,
  escapeName,
  filterHasChild,
  filterHasChildren,
  isBaseFilter,
  isBaseLatLonFilter,
  isMultiSourceFilter,
  isSimpleAggregate,
  sqlFilter
} from "vega/constants/filter-types"
import { buildDashboardFilterMetadata } from "vega/constants/filter-metadata-types"
import { hasParamSyntax } from "utils/parameters"

const filtersToString = (filters, tableName, ignoreFilters, process) => {
  const filterStrings = filters.map((f) =>
    process(
      buildOmnifilterSql(f, tableName),
      new Set([...ignoreFilters, f.name])
    )
  )
  return `(${filterStrings.join(" AND ")})`
}

const copyFilterAsCohortTo = (
  filters,
  originalTable,
  copyToTable,
  copyToField,
  copyFromField,
  ignoreFilters,
  process
) => {
  const filter = sqlFilter(
    copyToTable,
    copyToTable,
    `${buildDataExpression(
      copyToTable,
      copyToField
    )} IN (SELECT DISTINCT(${buildDataExpression(
      originalTable,
      copyFromField
    )}) FROM ${
      hasParamSyntax(originalTable) ? originalTable : escapeName(originalTable)
    } WHERE ${filtersToString(filters, originalTable, ignoreFilters, process)})`
  )
  return buildDashboardFilterMetadata(pushid(), filter, true)
}

const copyFilterTo = (filter, originalTable, copyToTable, copyFields) => {
  if (isMultiSourceFilter(filter)) {
    if (originalTable in filter.filtersByDataSource) {
      const filtersByDataSource = {
        [copyToTable]: copyFilterTo(
          filter.filtersByDataSource[originalTable],
          originalTable,
          copyToTable,
          copyFields
        )
      }
      if (filtersByDataSource[copyToTable]) {
        return {
          ...filter,
          filtersByDataSource
        }
      }
    }
  } else if (filterHasChildren(filter)) {
    const filters = filter.filters
      .map((f) => copyFilterTo(f, originalTable, copyToTable, copyFields))
      .filter(Boolean)
    if (filters.length > 0) {
      return {
        ...filter,
        filters
      }
    }
  } else if (filterHasChild(filter)) {
    const f = copyFilterTo(
      filter.filter,
      originalTable,
      copyToTable,
      copyFields
    )
    if (filter) {
      return {
        ...filter,
        filter: f
      }
    }
  } else if (isBaseFilter(filter)) {
    if (filter.dataSource === originalTable) {
      let dataExpression = null
      if (copyFields) {
        if (isSimpleAggregate(filter.dataExpression)) {
          if (filter.dataExpression.value in copyFields) {
            dataExpression = {
              ...filter.dataExpression,
              value: copyFields[filter.dataExpression.value]
            }
          }
        } else if (filter.dataExpression in copyFields) {
          dataExpression = copyFields[filter.dataExpression]
        }
      } else {
        dataExpression = filter.dataExpression
      }

      if (dataExpression) {
        return {
          ...filter,
          dataSource: copyToTable,
          dataExpression
        }
      }
    }
  } else if (
    isBaseLatLonFilter(filter) &&
    filter.dataSource === originalTable
  ) {
    let latExpression = null
    let lonExpression = null
    if (copyFields) {
      if (filter.latExpression in copyFields) {
        latExpression = copyFields[filter.latExpression]
      }
      if (filter.lonExpression in copyFields) {
        lonExpression = copyFields[filter.lonExpression]
      }
    } else {
      latExpression = filter.latExpression
      lonExpression = filter.lonExpression
    }
    if (latExpression && lonExpression) {
      return {
        ...filter,
        dataSource: copyToTable,
        latExpression,
        lonExpression
      }
    }
  }

  return null
}

/**
 *
 * @param options
 * @param options.tableName table to extract crossfilters from
 * @param options.chartId the chart that uses the ${} (ie, current chart)
 * @param options.LayerId (optional, overrides layerName) current chart's layer id
 * @param options.layerName (optional) current chart's layer name
 * @param options.cfChartId (optional) only retrieve filters set by this chart
 * @param options.skipGlobalFilters (optional) `true` to skip loading global filters
 * @param options.copyToTable (optional) table to copy filters to
 * @param options.copyFields (optional) object mapping tableName columns to copyToTable columns
 * @param options.cohortFields (optional) like copyFields but build filters as a cohort
 * @param options.fallback (optional) what to return if there are no matching filters
 * @param options.process (optional) called to recursively process tokens, (string, set) => string
 * @param options.ignoreFilters (optional) set of filter names to ignore
 * @returns SQL filter string
 */
export const crossfilterExtractor = ({
  tableName,
  chartId,
  layerId = undefined,
  layerName = undefined,
  cfChartId = undefined,
  skipGlobalFilters = false,
  copyToTable = undefined,
  copyFields = undefined,
  cohortFields = undefined,
  fallback = "NULL",
  process = (s) => s,
  ignoreFilters = new Set()
}) => {
  const lid =
    layerId && typeof layerId === "number"
      ? layerId
      : getLayerIdFromName(layerName, getStore().getState().charts[chartId])

  // pull back all applicable chart-specific/crossfilters.
  let relevantFilters = [...getChartFilters(chartId, tableName, lid)]

  // if we're not looking at crossfilters from an individual chart, pull back global as well.
  if (!cfChartId && !skipGlobalFilters) {
    relevantFilters.push(...getDashboardFilters(tableName))
  }

  relevantFilters = relevantFilters.filter(
    (f) =>
      !ignoreFilters.has(f.name) &&
      (f.appliesTo !== "CROSSFILTER" || !cfChartId || f.chartId === cfChartId)
  )

  if (!relevantFilters.length) {
    return fallback
  }

  let buildTableName = tableName
  if (copyToTable) {
    let copyFilters = true
    let cohortFilters = []
    buildTableName = copyToTable
    if (cohortFields) {
      cohortFilters = Object.entries(
        cohortFields
      ).map(([copyFromField, copyToField]) =>
        copyFilterAsCohortTo(
          relevantFilters,
          tableName,
          copyToTable,
          copyToField,
          copyFromField,
          ignoreFilters,
          process
        )
      )

      // if cohortFields were specified, only copy the filters if copyFields
      // was also specified
      copyFilters = Boolean(copyFields)
    }

    if (copyFilters) {
      relevantFilters = cohortFilters.concat(
        relevantFilters.flatMap((metadata) => {
          const filter = copyFilterTo(
            metadata.filter,
            tableName,
            copyToTable,
            copyFields
          )
          // so NOT filters for crosslinked tables were resulting in an additional filter object
          // here that looked like this: { filterType: "NOT", filter: null }, which obviously
          // throws an error later down the line when the filter prop is read. Not sure why this is
          // the case, but added this check to short out if one of these invalid filters is found
          if (filter?.filter === null) {
            return []
          } else if (filter) {
            return [
              {
                ...metadata,
                filter
              }
            ]
          }
          return []
        })
      )
    } else {
      relevantFilters = cohortFilters
    }

    if (!relevantFilters.length) {
      return fallback
    }
  }

  return filtersToString(
    relevantFilters,
    buildTableName,
    ignoreFilters,
    process
  )
}

export default crossfilterExtractor
