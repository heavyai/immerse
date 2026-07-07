// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/*
  This is a new style dimension object. You can think of a dimension as roughly equivalent to a column in a table.
*/

import { getUnbinnedQuery, isRelative, replaceRelative } from "./utils"
import buildFilterString from "./build-filter-string.ts"

import getGroup from "./ImmerseCrossFilterGroup"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

// This SHOULD be purely OO, but functions are frequently pulled out of here and called directly w/o an object on them.
// We may be able to fix that by judicial use of bound functions, but we'll come back to it.
export default function getDimension({ expression, isGlobal, newCrossFilter }) {
  if (!Array.isArray(expression)) {
    expression = [expression]
  }

  const dimensionName = expression
  const DIM_ID = isGlobal
    ? newCrossFilter.sharedCrossFilter.globalDimensionIndex++
    : newCrossFilter.sharedCrossFilter.chartDimensionIndex++

  let samplingRatio = null
  let projectExpressions = []
  // the dimArray is basically just the column with the table name prepended to it.
  // it's not scoped if it's not a column
  let dimArray = expression.map((field) => {
    const columnTypeMap = newCrossFilter.getColumns()
    const column = Object.keys(columnTypeMap).find(
      (col) => col === field || columnTypeMap[col].column === field
    )

    // couldn't find a column? Just leave it as is.
    if (!column) {
      return field
    } else {
      // Column has table.column expression
      const scopedField = newCrossFilter.isValidTable() ? column : field
      return columnTypeMap[column].type === "DATE"
        ? `CAST(${scopedField} AS TIMESTAMP(3))`
        : scopedField
    }
  })

  const dimensionExpression = dimArray.includes(null)
    ? null
    : dimArray.join(", ")

  let dimOrderExpression = null
  let nullsOrder = ""

  let selfFilter = ""
  let isMultiDim = expression.length > 1

  let filterVal = null

  let eliminateNull = true
  // as in ImmerseCrossFilter, this is largely just functions yanked out of old crossfilter
  // with some retooling to replicate the public interface
  const newDimension = {
    type: "dimension",
    crossfilter: newCrossFilter,
    value: () => dimArray,
    set: (fn) => {
      dimArray = fn(dimArray)
      return newDimension
    },
    order: (newOrderExpression) => {
      dimOrderExpression = newOrderExpression
      return newDimension
    },
    multiDim: (value) => {
      if (typeof value === "boolean") {
        isMultiDim = value
        return newDimension
      }

      return isMultiDim
    },
    getFilter: () => {
      return Array.isArray(filterVal[0]) ? filterVal : [filterVal]
    },
    selfFilter: (newSelfFilter) => {
      if (newSelfFilter !== undefined) {
        selfFilter = newSelfFilter
        return newDimension
      } else {
        return selfFilter
      }
    },
    nullsOrder: (newNullsOrder) => {
      if (newNullsOrder !== undefined) {
        nullsOrder = newNullsOrder
      }
      return nullsOrder
    },
    /* this builds up a dimension query.
      hasRenderSpec is for backend. PLEASE NOTE - if we flip "hasRenderSpec", then we send rowids, which don't work
      in a distributed environment. THis needs to be refactored.
      k is the limit.
      offset is the limit offset.
      sortOrder is ASC or DESC.

      and you'll end up with a query that has dimensions and measures and filters. Lots pulled from old crossfilter.
    */
    getQuery: (k, offset, hasRenderSpec, sortOrder) => {
      let projList = projectExpressions.join(",")
      if (!projList) {
        return ""
      }

      // I don't think rowid is applicable to joins
      const tables = newCrossFilter.getTables()
      if (hasRenderSpec && tables.length === 1) {
        const rowIdAttr = `${tables[0]}.rowid`
        if (projList.indexOf("rowid") < 0 && projList.indexOf(rowIdAttr) < 0) {
          projList += `,${tables[0]}.rowid`
        }
      }

      const queryArray = []
      queryArray.push("SELECT")
      queryArray.push(projList)
      queryArray.push("FROM")
      queryArray.push(process(newCrossFilter.dataSource))

      const filtersArray = []

      filtersArray.push(
        buildFilterString(newCrossFilter.chartId, {
          includeCharts: true,
          includeGlobal: true,
          tables: newCrossFilter.getTables(),
          dataSource: newCrossFilter.getDataSource()
        })
      )

      if (selfFilter) {
        filtersArray.push(selfFilter)
      }

      if (samplingRatio !== null && samplingRatio < 1.0) {
        filtersArray.push(`SAMPLE_RATIO(${samplingRatio})`)
      }

      if (filtersArray.length) {
        const filterString = filtersArray.join(" AND ")
        const finalFilterString = isRelative(filterString)
          ? replaceRelative(filterString)
          : filterString
        if (finalFilterString.length) {
          queryArray.push("WHERE")
          queryArray.push(finalFilterString)
        }
      }

      const queryOrderExpression = dimOrderExpression || dimensionExpression

      if (queryOrderExpression) {
        queryArray.push(
          `ORDER BY ${queryOrderExpression} ${sortOrder} ${nullsOrder}`
        )
      }

      if (k !== Infinity) {
        queryArray.push(`LIMIT ${k}`)
      }
      if (offset !== undefined) {
        queryArray.push(`OFFSET ${offset}`)
      }

      const query = queryArray.join(" ")

      return isRelative(query) ? replaceRelative(query) : query
    },
    getTopQuery: (limit, offset, renderSpec) =>
      newDimension.getQuery(limit, offset, renderSpec, "DESC"),
    getBottomQuery: (limit, offset, renderSpec) =>
      newDimension.getQuery(limit, offset, renderSpec, "ASC"),
    getUnbinnedQuery: (query) =>
      getUnbinnedQuery(query, newCrossFilter, newDimension),
    topAsync: (
      k,
      offset,
      renderSpec,
      sortOrder = "DESC",
      callback = (_, res) => res
    ) => {
      const query = newDimension.getQuery(k, offset, renderSpec, sortOrder)
      if (!query) {
        if (callback) {
          callback(null, {})
          return undefined
        }
        return {}
      }

      const options = {
        eliminateNullRows: eliminateNull,
        renderSpec,
        queryId: newDimension.getDimensionIndex()
      }

      return newCrossFilter
        .queryAsync(query, options, "topAsync")
        .then((res) => callback(null, res))
    },
    bottomAsync: (k, offset, renderSpec, callback) => {
      return newDimension.topAsync(k, offset, renderSpec, "ASC", callback)
    },
    // that's right! Calling groupAll on a dimension is the same as doing it on a crossfilter!
    groupAll: newCrossFilter.groupAll,
    group: () => {
      return getGroup({ newCrossFilter, newDimension, dimArray })
    },
    // we do nothing to dispose atm. That's probably fine, right?
    dispose: () => {},
    samplingRatio: (ratio) => {
      if (!ratio) {
        samplingRatio = null
      }
      samplingRatio = ratio
      return newDimension
    },
    setEliminateNull: (v) => {
      eliminateNull = v
      return newDimension
    },
    getEliminateNull: () => eliminateNull,
    eliminateNull: () => eliminateNull,
    getDimensionIndex: () => {
      return DIM_ID
    },
    getDimensionName: () => {
      return dimensionName
    },
    /*
      same as in immersecrossfilter, but more pronounced - the filter methods are now
      no-ops.
    */
    filterMulti: () => {},
    filterAll: () => {},
    filterST_Min_ST_Max: () => {},
    filterSpatial: () => {},
    filter: (range) => {
      if (Array.isArray(range) && !isMultiDim) {
        filterVal = range
      }
    },
    getProjectOn: () => {
      return projectExpressions
    },
    projectOn(expressions) {
      projectExpressions = expressions
      return newDimension
    }
  }

  return newDimension
}
