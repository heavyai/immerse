// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { process } from "utils/ImmerseSQLPlusPlus/parser"
import {
  getStore,
  getUnbinnedQuery,
  isRelative,
  replaceRelative,
  type,
  unBinResults
} from "./utils"
import buildFilterString from "./build-filter-string.ts"
import { CHART_TYPES } from "../../constants/charts"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

const { START_OF_WEEK } = available_feature_flags

// Sometimes, binning bounds can get incorrectly set to [null, null]. This
// checks whether they're null
const binBoundsNotNull = (bounds) =>
  Array.isArray(bounds) && bounds[0] !== null && bounds[1] !== null

export default function getGroup({ newCrossFilter, newDimension, dimArray }) {
  let reduceExpression = null
  let expressions = null

  let reduceSubExpressions = null

  let reduceVars = null
  let orderExpression = null
  let binParams = []
  let currentOrderBySegmentBuilder = null

  const newGroup = {
    dimension: () => newDimension,
    order: (newOrderExpression) => {
      orderExpression = newOrderExpression

      return newGroup
    },
    getExpressions: () => expressions,
    getReduceExpression: () => reduceExpression,
    getReduceVars: () => reduceVars,
    getOrderExpression: () => orderExpression,
    binParams: (binParamsIn) => {
      if (!binParamsIn) {
        return binParams
      } else {
        binParams = binParamsIn

        return newGroup
      }
    },
    allAsync: (callback) => {
      const orderClauseArray = newDimension.value().map((d, i) => `key${i}`)
      // TODO yuck. This should be refactored to accept an object - encapsulate it inside the old API.
      return newGroup.topAsync(
        undefined,
        undefined,
        null,
        false,
        "DESC",
        callback,
        `ORDER BY ${orderClauseArray.join(",")}`
      )
    },
    all: (callback) => newGroup.allAsync(callback),
    /*
      this is enhanced from old crossfilter, which implemented nearly redundant stacked methods
      for top/bottom. Instead, just call top with a couple of extra args.
    */
    bottomAsync: (k, offset, renderSpec, callback, ignoreFilters) => {
      return newGroup.topAsync(
        k,
        offset,
        renderSpec,
        ignoreFilters,
        "ASC",
        callback
      )
    },
    top: (k, offset, renderSpec, callback) => {
      return newGroup.topAsync(
        k,
        offset,
        renderSpec,
        undefined,
        undefined,
        callback
      )
    },
    buildDimContainsArray: (dimensions) => {
      const { columnCompoundMap } = newCrossFilter.sharedCrossFilter
      const columnTypeMap = newCrossFilter.getColumns()
      return dimensions.map(
        (d) =>
          (columnTypeMap && columnTypeMap[d] && columnTypeMap[d].is_array) ||
          (columnCompoundMap &&
            columnCompoundMap[d] &&
            columnCompoundMap[d].is_array)
      )
    },
    getCurrentOrderBySegment: (forceUnbinned = false) =>
      currentOrderBySegmentBuilder(forceUnbinned),
    buildOrderBySegment: ({
      orderByClause,
      sortOrder,
      orderingByDimension,
      limit,
      offset,
      renderSpec
    }) => (forceUnbinned = false) => {
      // charts can define their own "order by" clause generator so we check if one exists
      const chartId = newGroup.getCrossfilter().chartId
      const chart = getStore().getState().charts[chartId]

      const getOrderByClauseOverride = newGroup.getCrossfilter()
        .sharedCrossFilter.crossFilterOverrides.orderBy?.[chart?.type]

      const orderByClauseOverride = getOrderByClauseOverride?.({
        group: newGroup,
        chart,
        sortOrder,
        orderingByDimension,
        limit,
        offset,
        renderSpec
      })

      if (!forceUnbinned && orderByClauseOverride) {
        return orderByClauseOverride
      }

      const orderByArray = []
      if (orderByClause) {
        orderByArray.push(orderByClause)
      } else {
        orderByArray.push("ORDER BY")
        if (newGroup.getOrderExpression()) {
          orderByArray.push(newGroup.getOrderExpression())
          orderByArray.push(sortOrder)
          // Add NULLS LAST to all grouped queries by default, unless ordering by a dimension,
          // to sort null measures to the end of the results regardless of sorting
          if (!orderingByDimension) {
            orderByArray.push("NULLS LAST")
          }
        } else {
          const reduceArray = newGroup.getReduceVars().split(",")
          const reduceSize = reduceArray.length
          for (let r = 0; r < reduceSize - 1; r += 1) {
            orderByArray.push(`${reduceArray[r]} ${sortOrder}`)
            if (!orderingByDimension) {
              orderByArray.push("NULLS LAST")
            }
            orderByArray.push(",")
          }
          orderByArray.push(`${reduceArray[reduceSize - 1]} ${sortOrder}`)
          if (!orderingByDimension) {
            orderByArray.push("NULLS LAST")
          }
        }

        if (limit !== Infinity) {
          orderByArray.push("LIMIT")
          orderByArray.push(limit)
        }
        if (offset !== undefined) {
          orderByArray.push("OFFSET")
          orderByArray.push(offset)
        }
      }
      return orderByArray
    },
    getGroupBy: (renderSpec) => {
      const groupByArray = []
      dimArray.forEach((d, i) => {
        if (renderSpec && d.match(/rowid\s*$/)) {
          groupByArray.push(d)
        } else {
          groupByArray.push(`key${i}`)
        }
      })
      return groupByArray
    },
    getQuery: (
      limit,
      offset,
      renderSpec,
      sortOrder,
      ignoreFilters,
      queryBinParams,
      orderByClause
    ) => {
      const binningParams = queryBinParams || newGroup.binParams()
      const queryArray = ["SELECT"]

      const myProjectExpressions = groupGetProjectOn(
        Boolean(renderSpec),
        binningParams,
        reduceExpression,
        newDimension.value(),
        newGroup.buildDimContainsArray(newDimension.value())
      )

      queryArray.push(myProjectExpressions.join(","))
      queryArray.push(
        `${
          orderExpression === "countval" ? ", COUNT(*) AS countval" : ""
        } FROM ${newCrossFilter.dataSource}`
      )
      if (!ignoreFilters) {
        const binFilterString = newGroup.writeFilter(binningParams)

        if (binFilterString) {
          queryArray.push("WHERE")
          queryArray.push(binFilterString)
        }
      }

      const groupByArray = newGroup.getGroupBy(renderSpec)

      if (groupByArray.length) {
        queryArray.push("GROUP BY")
        queryArray.push(groupByArray.join(", "))
      }

      if (binningParams) {
        const havingArray = []

        binningParams.forEach((bp, i) => {
          if (bp !== null && !bp.timeBin) {
            let havingSubClause = `key${i} >= 0 AND key${i} < ${bp.numBins}`
            if (!newDimension.eliminateNull()) {
              havingSubClause = `((${havingSubClause}) OR key${i.toString()} IS NULL)`
            }
            havingArray.push(havingSubClause)
          }
        })
        if (havingArray.length) {
          queryArray.push("HAVING")
          queryArray.push(havingArray.join(" AND "))
        }
      }

      const dimensionAliases = newDimension
        .value()
        .map((_, index) => `key${index}`)
      const orderingByDimension = dimensionAliases.includes(
        newGroup.getOrderExpression()
      )

      currentOrderBySegmentBuilder = newGroup.buildOrderBySegment({
        orderByClause,
        sortOrder,
        orderingByDimension,
        limit,
        offset,
        renderSpec
      })

      const orderBySegment = newGroup.getCurrentOrderBySegment()

      return [...queryArray, ...orderBySegment].join(" ")
    },
    getTopQuery: (limit, offset, renderSpec) =>
      newGroup.getQuery(limit, offset, renderSpec, "DESC"),
    getBottomQuery: (limit, offset, renderSpec) =>
      newGroup.getQuery(limit, offset, renderSpec, "ASC"),

    getUnbinnedQuery: (query) =>
      getUnbinnedQuery(query, newCrossFilter, newDimension, newGroup),
    topAsync: (
      k,
      offset,
      renderSpec,
      ignoreFilters,
      sortOrder = "DESC",
      callback = (_, res) => res,
      orderByClause
    ) => {
      // k is the limit on the query
      // offset is the offset of the limit
      // renderSpec is boolean if it has a render spec or not
      // ignoreFilters is boolean to include filters or not
      //
      // this in turn calls writeTopBottomQuery with:
      // k (from above)
      // offset  (from above)
      // ascDescExpr (which is hardwired as " DESC" in topAsync, hardwired to ASC in bottomAsync)
      // ignoreFilters (from above)
      // isRender (from above)

      // and finally it calls writeQuery with:
      // queryBinParams (or a null)
      // _orderExpression (orderExpression from the newGroup object)
      // ignoreFilters (from above)
      // isRender ( from above)

      // writeTopBottomQuery then takes the query from writeQuery and tacks on the order by clause.

      const queryBinParams = newGroup.binParams()

      let query = newGroup.getQuery(
        k,
        offset,
        renderSpec,
        sortOrder,
        ignoreFilters,
        queryBinParams,
        orderByClause
      )

      const postProcessors = [
        (results) =>
          queryBinParams ? unBinResults(queryBinParams, results) : results
      ]

      const options = {
        eliminateNullRows: newDimension.eliminateNull(),
        renderSpec,
        queryId: newDimension.getDimensionIndex()
      }

      // If newCrossFilter is not associated with a chart we have to
      // process manually before calling queryAsync
      if (!newCrossFilter.chartId) {
        query = process(query, { trackUsage: false })
      }
      return newCrossFilter
        .queryAsync(query, options, "topAsync")
        .then((res) =>
          newCrossFilter.sharedCrossFilter.applyPostProcessors(
            res,
            postProcessors
          )
        )
        .then((res) => callback(null, res))
        .catch((e) => callback(e))
    },
    getCrossfilter: () => {
      return newCrossFilter
    },
    reduce: (exprs) => {
      if (exprs) {
        expressions = exprs
        const res = groupReduce(exprs)
        reduceSubExpressions = res.reduceSubExpressions
        reduceExpression = res.reduceExpression
        reduceVars = res.reduceVars
        return newGroup
      } else {
        return reduceSubExpressions
      }
    },
    reduceCount: (countExpression, name) => {
      newGroup.reduce([
        {
          expression: countExpression,
          agg_mode: "count",
          name: name || "val"
        }
      ])
      return newGroup
    },
    writeFilter: (binningConfig = []) => {
      const filterString = buildFilterString(newCrossFilter.chartId, {
        includeCharts: true,
        includeGlobals: true,
        tables: newCrossFilter.getTables(),
        dataSource: newCrossFilter.getDataSource()
      })

      const selfFilterString = newDimension.selfFilter()

      const allFilters = [filterString, selfFilterString]

      const { charts } = getStore().getState()
      const xfilterChart = charts[newCrossFilter.chartId] || {}

      if (
        xfilterChart.type === CHART_TYPES.HEAT &&
        !allFilters.some((s) => s.includes("BETWEEN"))
      ) {
        binningConfig.forEach((config, i) => {
          const { binBounds = [], timeBin } = config || {}
          if (timeBin && binBounds.length && binBoundsNotNull(binBounds)) {
            let between = `${
              newDimension.value()[i]
            } BETWEEN '${binBounds[0].toISOString()}' AND '${binBounds[1].toISOString()}'`
            if (!newDimension.getEliminateNull()) {
              between = `(${between} OR ${newDimension.value()[i]} IS NULL)`
            }
            allFilters.push(between)
          }
        })
      }

      if (!xfilterChart.showNullMeasures) {
        allFilters.push(excludeNullMeasuresFilter(reduceSubExpressions))
      }

      const filtersQuery = allFilters.filter((s) => s.length > 0).join(" AND ")

      return isRelative(filtersQuery)
        ? replaceRelative(filtersQuery)
        : filtersQuery
    },
    getMinMaxWithFilters: ({ min = "min_val", max = "max_val" } = {}) => {
      const filters = newGroup.writeFilter()
      const filterQ = filters.length ? `WHERE ${filters}` : ""
      const query = `SELECT MIN(${dimArray[0]}) AS ${min}, MAX(${dimArray[0]}) AS ${max} FROM ${newCrossFilter.dataSource} ${filterQ}`

      const options = {
        eliminateNullRows: newDimension.eliminateNull(),
        renderSpec: null,
        queryId: -1
      }

      const postProcessors = [(d) => d[0]]

      return newCrossFilter
        .queryAsync(query, options, "group-minmax-with-filters")
        .then((res) =>
          newCrossFilter.sharedCrossFilter.applyPostProcessors(
            res,
            postProcessors
          )
        )
    }
  }

  newGroup.reduce([
    {
      expression: undefined,
      agg_mode: "count",
      name: "val"
    }
  ])

  return newGroup
}

// the rest is mostly just pulled whole hog from old crossfilter
// there should be lots of opportunity to refactor here.

function groupGetProjectOn(
  isRenderQuery,
  queryBinParams,
  reduceExpression,
  dimArray,
  dimContainsArray
) {
  const projectExpressions = []
  for (let d = 0; d < dimArray.length; d += 1) {
    if (
      queryBinParams !== null &&
      queryBinParams !== undefined &&
      typeof queryBinParams[d] !== "undefined" &&
      queryBinParams[d] !== null
    ) {
      const binnedExpression = getBinnedDimExpression(
        dimArray[d],
        queryBinParams[d]
      )
      projectExpressions.push(`${binnedExpression} AS key${d.toString()}`)
    } else if (dimContainsArray[d]) {
      projectExpressions.push(`UNNEST(${dimArray[d]}) AS key${d.toString()}`)
    } else if (Boolean(isRenderQuery) && dimArray[d].match(/rowid\s*$/)) {
      // do not cast rowid with 'as key[0-9]'
      // as that will mess up hit-test renders
      // and poly renders.
      projectExpressions.push(dimArray[d])
    } else {
      projectExpressions.push(`${dimArray[d]} AS key${d.toString()}`)
    }
  }

  if (reduceExpression) {
    projectExpressions.push(reduceExpression)
  }

  return projectExpressions || ""
}

function groupReduce(expressions) {
  const reduceSubExpressions = expressions
  let reduceExpression = ""
  let reduceVars = ""

  const numExpressions = expressions.length
  for (let e = 0; e < numExpressions; e += 1) {
    if (e > 0) {
      reduceExpression += ","
      reduceVars += ","
    }

    const agg_mode = expressions[e].agg_mode.toUpperCase()

    if (agg_mode === "CUSTOM") {
      reduceExpression += expressions[e].expression
    } else if (agg_mode === "COUNT") {
      if (expressions[e].filter) {
        reduceExpression += `COUNT(CASE WHEN ${expressions[e].filter} THEN 1 END)`
      } else if (typeof expressions[e].expression !== "undefined") {
        reduceExpression += `COUNT(${expressions[e].expression})`
      } else {
        reduceExpression += "COUNT(*)"
      }
      // should check for either sum, avg, min, max
    } else if (expressions[e].filter) {
      reduceExpression += `${agg_mode}(CASE WHEN ${expressions[e].filter} THEN ${expressions[e].expression} END)`
    } else {
      reduceExpression += `${agg_mode}(${expressions[e].expression})`
    }

    reduceExpression += ` AS ${expressions[e].name}`
    reduceVars += expressions[e].name
  }
  return { reduceSubExpressions, reduceExpression, reduceVars }
}

function getBinnedDimExpression(expression, queryBinParams) {
  const { binBounds, numBins = 0, timeBin, extract } = queryBinParams
  // jscs:ignore maximumLineLength
  const boundType = type(binBounds[0])

  if (boundType === "null") {
    return expression
  } else if (boundType === "date") {
    if (timeBin) {
      const actualTimeBin =
        timeBin === "week" ? getFeatureFlag(START_OF_WEEK) : timeBin
      if (extract) {
        return `extract(${actualTimeBin} from ${uncast(expression)})`
      } else {
        return `date_trunc(${actualTimeBin}, ${expression})`
      }
    } else {
      // TODO(croot): throw error if no num bins?
      const dimExpr = `extract(epoch from ${expression})`

      const lowerBoundsUTC = binBounds[0].getTime() / 1000
      const upperBoundsUTC = binBounds[1].getTime() / 1000
      if (lowerBoundsUTC >= upperBoundsUTC) {
        // Do NOT move the -1 inside the ${} - there is a bug in calcite that
        // will throw an error if you try to SELECT a constant integer with a
        // group by clause. This gets around it by returning an expression
        // ¯\_(ツ)_/¯
        return `${numBins} - 1`
      }
      return `CASE WHEN ${dimExpr} >= ${upperBoundsUTC} THEN ${numBins} ELSE WIDTH_BUCKET(${dimExpr}, ${lowerBoundsUTC}, ${upperBoundsUTC}, ${numBins}) END - 1`
    }
  } else {
    // TODO(croot): throw error if no num bins?
    if (binBounds[0] >= binBounds[1]) {
      // Do NOT move the -1 inside the ${} - there is a bug in calcite that
      // will throw an error if you try to SELECT a constant integer with a
      // group by clause. This gets around it by returning an expression
      // ¯\_(ツ)_/¯
      return `${numBins} - 1`
    }
    return `CASE WHEN ${expression} >= ${binBounds[1]} THEN ${numBins} ELSE WIDTH_BUCKET(${expression}, ${binBounds[0]}, ${binBounds[1]}, ${numBins}) END - 1`
  }
}

function isNotNull(columnName) {
  return `${columnName} IS NOT NULL`
}
function notEmptyNotStarNotComposite(item) {
  return (
    notEmpty(item.expression) && item.expression !== "*" && !item.isComposite
  )
}

function excludeNullMeasuresFilter(measures) {
  const measureNames = measures
    .filter(notEmptyNotStarNotComposite)
    .map((m) => m.expression)
  const maybeParseParameters = measureNames.map(parseParensIfExist).flat()
  return maybeParseParameters.map(isNotNull).join(" AND ")
}

function parseParensIfExist(measureValue) {
  // Regex goes down for 4 levels deep in terms of nesting ().
  const checkParens = /\(([^()]*|\(([^()]*|\(([^()]*|\([^()]*\))*\))*\))*\)/g
  const thereIsParens = checkParens.test(measureValue)

  if (thereIsParens) {
    const parsedParens = measureValue.match(checkParens)
    return parsedParens.map((str) => {
      return str.slice(1, -1)
    })
  } else {
    return [measureValue]
  }
}

function notEmpty(item) {
  switch (typeof item) {
    case "undefined":
      return false
    case "boolean":
      return true
    case "number":
      return true
    case "symbol":
      return true
    case "function":
      return true
    case "string":
      return item.length > 0

    // null, array, object, date
    case "object":
      return (
        item !== null &&
        (typeof item.getDay === "function" || Object.keys(item).length > 0)
      ) // jscs:ignore maximumLineLength
    default:
      return false
  }
}

function uncast(string) {
  const matching = string.match(/^CAST\((\w+\.)?([\w_]+)/)
  if (matching) {
    return matching[2]
  } else {
    return string
  }
}
