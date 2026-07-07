// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// do not look in here.

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import { getChildFilters } from "vega/utils/filter"
import { makeBinEndDate } from "services/ImmerseCrossFilter/utils-date-bin"
import { isDateType } from "constants/data-types"
import { FILTER_TYPE_BETWEEN } from "vega/constants/filter-type-constants"
import { findJoinDataSourceForParameter } from "components/join-manager/use-join-from-parameter"

export default function repairFilters(dashboardState) {
  if (getFeatureFlag(available_feature_flags.REPAIR_INVALID_FILTERS)) {
    repairInvalidFilters(dashboardState)
  }

  if (getFeatureFlag(available_feature_flags.REPAIR_DATEBIN_FILTERS)) {
    repairDateBinFilters(dashboardState)
  }
}

/**
 * If the filter's datasource is a join, lookup the filters data expression
 * in our known columns to see if we can find a table. Join filters have table.column
 * expressions so ambiguity should not be a problem. Always falls back to datasource
 * as the table.
 */
const findFilterTableFromColumns = ({
  dashboardState,
  filter = {},
  dataSource
}) => {
  const joinDataSources = dashboardState.joinDataSources
  if (findJoinDataSourceForParameter(dataSource, joinDataSources)) {
    const { dataSources } = dashboardState.dashboard
    // Lookup the dataExpression in our columns to see if we can find a table
    const { columnMetadata } = dataSources[dataSource] ?? {}
    if (columnMetadata) {
      const column = columnMetadata.find((cm) => {
        return (
          filter.dataExpression === `${cm.table}.${cm.label}` ||
          filter.dataExpression === cm.label
        )
      })
      return column?.table ?? dataSource
    }
  }
  return dataSource
}

/**
 * A "table" property was added to filters, this converts filters that don't have the table property by adding
 * datasource as the property, or if it's a join datasource it tries to find the table from the dataExpression
 */
export function repairJoinFilters(dashboardState) {
  dashboardState.omnifilters.forEach((filter) => {
    if (!filter.filter?.table && filter.filter.dataSource) {
      const { dataSource } = filter.filter

      const foundTable = findFilterTableFromColumns({
        dashboardState,
        filter: filter.filter,
        dataSource
      })
      filter.filter.table = foundTable
    }

    const childFilters = getChildFilters(filter)
    childFilters.forEach((childFilter) => {
      if (!childFilter.table && childFilter.dataSource) {
        const foundTable = findFilterTableFromColumns({
          dashboardState,
          filter: childFilter,
          dataSource: childFilter.dataSource
        })
        childFilter.table = foundTable
      }
    })
  })
}

export function repairInvalidFilters(dashboardState) {
  // pull out a set of all filter names which are a member of a filter set.
  const filterHasParent = Object.values(dashboardState.filterZones).reduce(
    (family, filterSet) => {
      filterSet.filters.forEach((filter) => family.add(filter))
      return family
    },
    new Set()
  )

  // iterate over the filters.
  dashboardState.omnifilters.forEach((filter, filterIdx) => {
    const filterName = filter.name

    // step one. Destroy orphaned filters.
    // if that filter name isn't in the set of filters which have parents, delete it.
    // except for chart specific filters, of course. Those aren't in a filter set at all. >:-(
    if (!filterHasParent.has(filterName) && !filter.appliesTo === "CHART") {
      dashboardState.omnifilters.splice(filterIdx, 1)
    }

    // step two. if a filter matches label, but not value, map it to the value.
    // so we run through the charts, and if it's a raster chart with layers, run through
    // the measures and build a mapping from label -> value.
    const labelValueMap = Object.values(dashboardState.charts).reduce(
      (mapping, chart) => {
        if (chart.layers) {
          chart.layers.forEach((layer) => {
            layer.measures.forEach((measure) => {
              mapping[measure.label] = measure.value
            })
          })
        }
        return mapping
      },
      {}
    )

    // then, on a bounding box filter (AFAIK the error was only on bboxes), see if there's
    // a mapping from the filter's value -> the chart value. That means that the filter
    // value is actually the chart's label, so we stick the mapped value into the filter
    // and carry on.
    if (filter.isBoundingBox) {
      const latValue = labelValueMap[filter.filter.latExpression]
      const lonValue = labelValueMap[filter.filter.lonExpression]

      if (latValue) {
        filter.filter.latExpression = latValue
      }
      if (lonValue) {
        filter.filter.lonExpression = lonValue
      }
    }

    // step three. if a filter is between null and null, destroy it.
    // NOTE - this is heavy handed. IF you have a compound filter and one of the pieces is a between null/null, it'll
    // remove the entire filter. In a perfect world we'd only delete that constituent piece, but it's a fair bit of logic that I don't
    // want to implement right now. So we nuke the whole thing.
    //
    // good news - the only case I've seen that has this is an orphaned filter, so it was already removed in the earlier check.
    const childFilters = getChildFilters(filter)
    childFilters.forEach((child) => {
      if (
        child.filterType === FILTER_TYPE_BETWEEN &&
        (child.start === null || child.end === null)
      ) {
        dashboardState.omnifilters.splice(filterIdx, 1)
      }
    })
  })

  return dashboardState
}

const binsToCheck = ["month", "quarter", "year", "decade"]

export function repairDateBinFilters(dashboardState) {
  dashboardState.omnifilters
    .filter((f) => f.appliesTo === "CROSSFILTER")
    .forEach((f) => {
      const childSet = getChildFilters(f)

      Array.from(childSet)
        .filter(
          (filter) =>
            filter.filterType === FILTER_TYPE_BETWEEN &&
            isDateType(filter.dataType)
        )
        .forEach((filter) => {
          const binStartDate = new Date(filter.start)

          const binEndDate = new Date(filter.end)

          binsToCheck.forEach((bin) => {
            const invalidEndDate = makeInvalidBinEndDate(binStartDate, bin)

            if (binEndDate.getTime() === invalidEndDate.getTime()) {
              const validEndDate = makeBinEndDate(binStartDate, bin)

              // update the filter.

              const validISOEndDate = validEndDate.toISOString()
              const invalidISOEndDate = filter.end

              filter.end = validISOEndDate
              // and update the chart.
              dashboardState.charts[f.chartId].filters = dashboardState.charts[
                f.chartId
              ].filters.map((chartf) => {
                // it's either an array of strings, in which case update it if it matches the bad one.
                if (chartf === invalidISOEndDate) {
                  return validISOEndDate
                }
                // or, it's an array, so we iterate over each item and check it.
                if (Array.isArray(chartf)) {
                  return chartf.map((subf) =>
                    subf === invalidISOEndDate ? validISOEndDate : subf
                  )
                }
                // otherwise, we're leaving it as is.
                return chartf
              })
            }
          })
        })
    })
}

const BAD_CONSTANTS = {
  month: 2592000, // this is a known bad constant, kept for repair purposes. Keep it and never use it.
  quarter: 10368000, // this is a known bad constant, kept for repair purposes. Keep it and never use it.
  year: 31536000, // this is a known bad constant, kept for repair purposes. Keep it and never use it.
  decade: 315360000 // this is a known bad constant, kept for repair purposes. Keep it and never use it.
}

function makeInvalidBinEndDate(date, bin) {
  return new Date(date.getTime() + BAD_CONSTANTS[bin] * 1000 - 1)
}
