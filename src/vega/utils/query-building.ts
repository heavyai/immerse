// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  DimensionExpression,
  isGroupableTime,
  TimeLagExpression
} from "vega/constants/data-selection-types"
import { dimensionToExprStr, measureToExprStr } from "vega/utils/data-selection"
import { getAutoBinUnit, getMaxTimeBins } from "./binning"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import {
  isBoolType,
  isIntegerType,
  isNumericType,
  isStringType,
  isTimeType
} from "constants/data-types"
import pushid from "pushid"
import {
  BaseDimensionScaleSettings,
  VegaChartQuerySpec,
  VegaComboChartQuerySpec,
  VegaComboTopNQuerySpec,
  VegaCustomizableTopNOptions
} from "vega/charts/types"
import {
  buildCohortSql,
  buildFilterSql,
  simpleFilter
} from "vega/constants/filter-types"
import sql from "./sql-tag"
import { isEqual } from "lodash"

const { START_OF_WEEK } = available_feature_flags

export type MinMax = {
  min: number | Date
  max: number | Date
} | null

export const uncast = (string: string) => {
  const matching = string.match(/^CAST\((\w+\.)?([\w_]+)/)
  if (matching) {
    return matching[2]
  } else {
    return string
  }
}

export function getBinnedDimExpression(
  expression: string,
  minmax: MinMax,
  numTopNGroups: number,
  binSettings?: BaseDimensionScaleSettings | null
) {
  if (!binSettings || binSettings.dimensionType === "unbinned") {
    return expression
  }

  switch (binSettings.dimensionType) {
    case "binned_numeric": {
      if (
        !minmax ||
        typeof minmax.min !== "number" ||
        typeof minmax.max !== "number"
      ) {
        throw new Error("Invalid minmax for binned numeric expression")
      }

      const { numOfBins } = binSettings
      const { min, max } = minmax
      if (min >= max) {
        // Do NOT move the -1 inside the ${} - there is a bug in calcite that
        // will throw an error if you try to SELECT a constant integer with a
        // group by clause. This gets around it by returning an expression
        // ¯\_(ツ)_/¯
        return `${numOfBins} - 1`
      }

      return `CASE WHEN ${expression} >= ${max} THEN ${numOfBins} ELSE WIDTH_BUCKET(${expression}, ${min}, ${max}, ${numOfBins}) END - 1`
    }

    case "binned_time": {
      if (!minmax) {
        throw new Error("Invalid minmax for binned time expression")
      }

      let { timeUnit } = binSettings
      if (timeUnit === "auto") {
        timeUnit = getAutoBinUnit(minmax, getMaxTimeBins(numTopNGroups))
      }
      if (timeUnit === "week") {
        timeUnit = getFeatureFlag(START_OF_WEEK)
      }

      return `date_trunc(${timeUnit}, ${expression})`
    }

    case "extract_time": {
      let { timeUnit } = binSettings
      if (timeUnit === "week") {
        timeUnit = getFeatureFlag(START_OF_WEEK)
      }

      return `extract(${timeUnit} from ${uncast(expression)})`
    }

    default:
      throw new Error("Unhandled dimension type on base dimension scale")
  }
}

export const getDimensionExpression = (
  dimension: DimensionExpression,
  minmax: MinMax,
  numTopNGroups: number,
  binSettings?: BaseDimensionScaleSettings | null
): string => {
  const dimensionExprStr = dimensionToExprStr(dimension)

  if (binSettings && isGroupableTime(dimension.column)) {
    if (
      !(
        binSettings.dimensionType === "binned_time" ||
        binSettings.dimensionType === "extract_time"
      )
    ) {
      throw new Error("Dimension type of column and settings do not match")
    }

    return getBinnedDimExpression(
      dimensionExprStr,
      minmax,
      numTopNGroups,
      binSettings
    )
  } else {
    return dimensionExprStr
  }
}

export const buildTimeLagExpr = (
  measure: TimeLagExpression,
  minmax?: MinMax,
  numTopNGroups?: number,
  { baseDimensions, timeLagSettings, binSettings }: VegaComboChartQuerySpec
) => {
  if (timeLagSettings.binnedTimeUnit === binSettings.timeUnit) {
    // NOTE: It is only possible for one dimension to exist with a binned time unit
    // If a binnable date dimension is paired with any other dimension, it will only
    // be possible to use an extract date bin.
    // I discovered this behavior working on time lag settings, and the following
    const dimExpr = getDimensionExpression(
      baseDimensions[0],
      minmax,
      numTopNGroups,
      binSettings
    )
    let expr = `AVG(${measureToExprStr(
      measure.measure
    )}) over (order by ${dimExpr} range between interval ${
      timeLagSettings.interval
    } preceding and interval ${timeLagSettings.interval} preceding)`
    if (measure.mode === "delta") {
      expr = `${measureToExprStr(measure.measure)} - ${expr}`
    }
    return expr
  }
  return null
}

export const getSentinelValue = (
  topNOptions: VegaCustomizableTopNOptions,
  enabledTopNGroups: Array<string | null>,
  tableSpec: VegaChartQuerySpec
) => {
  let othersEnabled = !topNOptions?.allOthers?.disabled
  let sentinelValue: any = undefined
  if (othersEnabled) {
    if (enabledTopNGroups?.includes(null)) {
      // If "All Others" is enabled and `null` is a valid
      // value, we first try to find a "sentinel" we can use to
      // represent "All Others" - ie, a value that does not
      // exist in the data. If we cannot find a sentinel, we
      // have to fall back to a different SQL approach that has
      // a hefty performance penalty on the backend.
      const groupByType = tableSpec.groupByDimension?.column?.type
      let tries = 10
      if (isStringType(groupByType)) {
        do {
          sentinelValue = pushid()
          tries -= 1
        } while (enabledTopNGroups.includes(sentinelValue) && tries > 0)
      } else if (isIntegerType(groupByType)) {
        do {
          sentinelValue = Math.floor(Math.random() * 255)
          tries -= 1
        } while (enabledTopNGroups.includes(sentinelValue) && tries > 0)
      } else if (isNumericType(groupByType)) {
        do {
          sentinelValue = Math.random()
          tries -= 1
        } while (enabledTopNGroups.includes(sentinelValue) && tries > 0)
      } else if (isTimeType(groupByType)) {
        const existingValues = new Set(
          enabledTopNGroups.flatMap((g) =>
            g === null ? [] : [g.toISOString()]
          )
        )
        do {
          sentinelValue = new Date(Math.floor(Math.random() * Date.now()))
          tries -= 1
        } while (existingValues.has(sentinelValue.toISOString()) && tries > 0)
      } else if (isBoolType(groupByType)) {
        // Bools are an interesting case because it's easy to
        // create a top-n configuration that "covers" all
        // possible values (true, false, and null). In that
        // case, we can basically just disable "All Others".
        const possibleValues = new Set([true, false, null])
        enabledTopNGroups.forEach((g) => possibleValues.delete(g))
        if (possibleValues.size > 0) {
          // if there is at least one possible value left,
          // use it as our sentinel
          sentinelValue = possibleValues.values().next().value
        } else {
          // no possible values left: just disable all others
          othersEnabled = false
        }
      }
      if (tries === 0) {
        // we tried to find a sentinel 10 times and it didn't
        // work out
        sentinelValue = undefined
      }
    } else {
      // If `null` is not a valid value, it makes for a very
      // natural sentinel
      sentinelValue = null
    }
  }
  return {
    allOthersSentinel: sentinelValue,
    allOthersGroupEnabled: othersEnabled
  }
}

export const buildMinMaxQuery = (querySpec: VegaComboChartQuerySpec) => {
  const { table, baseDimensions, appliedFilters } = querySpec

  // We assume that there is only one base dimension when we have a binned
  // time/numeric scale to run the min/max on
  const dimension = baseDimensions[0]

  const select = [
    `MIN(${dimensionToExprStr(dimension)}) as dimensionMin`,
    `MAX(${dimensionToExprStr(dimension)}) as dimensionMax`
  ]

  const where = appliedFilters.map((af) => {
    if (af.cohortDimension) {
      return buildCohortSql(
        af.cohortDimension.dataSource,
        af.cohortDimension,
        af.filter,
        af.cohortDimension.negated,
        af.cohortDimension.postFilters
      )
    } else {
      return buildFilterSql([af.filter])[0]
    }
  })

  return sql`
    ${sql.select(select)}
    ${sql.from(table)}
    ${sql.where(sql.and(where))}
  `
}

// Excludes any filter on the corresponding range chart to get the full data min/max
export const buildFullMinMaxQuery = (querySpec: VegaComboChartQuerySpec) => {
  const { table, baseDimensions, appliedFilters, rangeFilter } = querySpec

  // We assume that there is only one base dimension when we have a binned
  // time/numeric scale to run the min/max on
  const dimension = baseDimensions[0]

  const select = [
    `MIN(${dimensionToExprStr(dimension)}) as dimensionMin`,
    `MAX(${dimensionToExprStr(dimension)}) as dimensionMax`
  ]

  const where = appliedFilters
    .filter((f) => !isEqual(f, rangeFilter))
    .map((af) => {
      if (af.cohortDimension) {
        return buildCohortSql(
          af.cohortDimension.dataSource,
          af.cohortDimension,
          af.filter,
          af.cohortDimension.negated,
          af.cohortDimension.postFilters
        )
      } else {
        return buildFilterSql([af.filter])[0]
      }
    })

  return sql`
    ${sql.select(select)}
    ${sql.from(table)}
    ${sql.where(sql.and(where))}
  `
}

export const buildTopNQuery = (
  querySpec: VegaComboTopNQuerySpec,
  minmaxDimension: DimensionExpression,
  minmax: MinMax | null
) => {
  const measure = measureToExprStr(querySpec.measure)

  const select = [`${measure} AS val`]

  const where = querySpec.appliedFilters.map((af) => {
    if (af.cohortDimension) {
      return buildCohortSql(
        af.cohortDimension.dataSource,
        af.cohortDimension,
        af.filter,
        af.cohortDimension.negated,
        af.cohortDimension.postFilters
      )
    } else {
      return buildFilterSql([af.filter], querySpec.dataSource)[0]
    }
  })

  if (minmax) {
    if (!minmaxDimension) {
      throw new Error("No minmax dimension for minmax")
    } else if (!minmaxDimension.column) {
      throw new Error("No column on minmax dimension")
    }

    const dimensionExpr = dimensionToExprStr(minmaxDimension)
    const dimensionType = minmaxDimension.column.type

    // minmaxDimension.table === dataSource
    // minmaxDimension.column.table === table
    where.push(
      buildFilterSql(
        [
          simpleFilter(
            minmaxDimension.column.table,
            querySpec.dataSource,
            dimensionExpr,
            dimensionType,
            ">=",
            minmax.min
          )
        ],
        querySpec.dataSource
      )[0]
    )
    where.push(
      buildFilterSql(
        [
          simpleFilter(
            minmaxDimension.column.table,
            querySpec.dataSource,
            dimensionExpr,
            dimensionType,
            "<=",
            minmax.max
          )
        ],
        querySpec.dataSource
      )[0]
    )
  }

  const groupBy = []
  const having = ["val IS NOT NULL"]
  if (!querySpec.allowNullKeys) {
    having.push("key IS NOT NULL")
  }

  if (querySpec.dimension) {
    select.push(`${dimensionToExprStr(querySpec.dimension)} AS key`)
    groupBy.push("key")
  }

  return sql`
    ${sql.select(select)}
    ${sql.from(querySpec.dataSource)}
    ${sql.where(sql.and(where))}
    ${sql.groupBy(groupBy)}
    ${sql.having(sql.and(having))}
    ${sql.orderBy(`val ${querySpec.sort}`)}
    ${sql.limit(querySpec.n)}
  `
}
