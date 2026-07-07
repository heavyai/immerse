// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  isRelative,
  replaceRelative,
  getLayerIdFromName,
  getStore
} from "./utils"
import buildFilterString from "./build-filter-string.ts"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

export default function getGroupAll({ newCrossFilter }) {
  let reduceExpression = "COUNT(*) AS val"

  const newGroupAll = {
    crossfilter: newCrossFilter,
    reduce: (expressions) => {
      reduceExpression = groupAllReduce(expressions)
      // artifact to actually set the old group order
      return newGroupAll
    },
    value: (
      ignoreFilters,
      ignoreChartFilters,
      ignoreFilterIndex,
      callback = (_, res) => res,
      postProcessors = [(d) => d[0].val],
      layerName,
      token = "groupAll/value"
    ) => {
      const queryArray = []
      queryArray.push("SELECT")
      queryArray.push(reduceExpression)
      queryArray.push("FROM")
      queryArray.push(process(newCrossFilter.dataSource))

      const filterString = buildFilterString(newCrossFilter.chartId, {
        includeCharts: !ignoreChartFilters,
        includeGlobal: !ignoreFilters,
        tables: newCrossFilter.getTables(),
        dataSource: newCrossFilter.getDataSource(),
        layerName
      })

      const finalFilterString = isRelative(filterString)
        ? replaceRelative(filterString)
        : filterString

      if (finalFilterString) {
        queryArray.push("WHERE")
        queryArray.push(finalFilterString)
      }

      const query = queryArray.join(" ")

      const options = {
        eliminateNullRows: false,
        renderSpec: null,
        queryId: -1,
        layerId: getLayerIdFromName(
          layerName,
          getStore().getState().charts[newCrossFilter.chartId]
        )
      }

      return newCrossFilter
        .queryAsync(query, options, `${token}:${layerName}`)
        .then((res) =>
          newCrossFilter.sharedCrossFilter.applyPostProcessors(
            res,
            postProcessors
          )
        )
        .then((res) => callback(null, res))
    },
    valueAsync: (
      ignoreFilters = false,
      ignoreChartFilters = false,
      ignoreFilterIndex = false,
      layerName
    ) => {
      return newGroupAll.value(
        ignoreFilters,
        ignoreChartFilters,
        ignoreFilterIndex,
        undefined,
        undefined,
        layerName
      )
    },
    values: (ignoreFilters, ignoreChartFilters, callback) => {
      return newGroupAll.value(
        ignoreFilters,
        ignoreChartFilters,
        false,
        callback,
        [(d) => d[0]]
      )
    },
    valuesAsync: (ignoreFilters = false, ignoreChartFilters = false) => {
      return newGroupAll.values(ignoreFilters, ignoreChartFilters)
    },

    objValuesAsync: ({
      ignoreFilters = false,
      ignoreChartFilters = true,
      token = "groupAll/valuesAsync"
    } = {}) => {
      return newGroupAll.objValues({ ignoreFilters, ignoreChartFilters, token })
    },
    objValues: ({
      ignoreFilters,
      ignoreChartFilters,
      callback,
      token = "groupAll/values"
    } = {}) => {
      return newGroupAll.objValue({
        ignoreFilters,
        ignoreChartFilters,
        ignoreFilterIndex: false,
        callback,
        postProcessors: [(d) => d[0]],
        token
      })
    },
    objValue: ({
      ignoreFilters,
      ignoreChartFilters,
      ignoreFilterIndex,
      callback,
      postProcessors,
      layerName,
      token = "groupAll/value"
    } = {}) => {
      return newGroupAll.value(
        ignoreFilters,
        ignoreChartFilters,
        ignoreFilterIndex,
        callback,
        postProcessors,
        layerName,
        token
      )
    }
  }

  newGroupAll.reduceMulti = newGroupAll.reduce

  return newGroupAll
}

function groupAllReduce(expressions) {
  // expressions should be an array of {expression, agg_mode (sql_aggregate), name}
  let reduceExpression = ""
  const numExpressions = expressions.length
  for (let e = 0; e < numExpressions; e += 1) {
    if (e > 0) {
      reduceExpression += ","
    }
    const agg_mode = expressions[e].agg_mode.toUpperCase()

    if (agg_mode === "CUSTOM") {
      reduceExpression += expressions[e].expression
    } else if (agg_mode === "COUNT") {
      if (typeof expressions[e].expression !== "undefined") {
        reduceExpression += `COUNT(${expressions[e].expression})`
      } else {
        reduceExpression += "COUNT(*)"
      }
    } else {
      // should check for either sum, avg, min, max
      reduceExpression += `${agg_mode}(${expressions[e].expression})`
    }
    reduceExpression += ` AS ${expressions[e].name}`
  }
  return reduceExpression
}
