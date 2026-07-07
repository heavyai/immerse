// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sql from "vega/utils/sql-tag"
import { isEqual } from "lodash"
import {
  andFilter,
  buildCohortSql,
  buildFilterSql,
  notNullFilter,
  nullFilter,
  orFilter,
  simpleFilter
} from "vega/constants/filter-types"
import { VegaComboChartQuerySpec } from "../types"
import {
  DimensionExpression,
  isGroupableTime,
  TIME_LAG_EXPRESSION_TYPE
} from "vega/constants/data-selection-types"
import { dimensionToExprStr, measureToExprStr } from "vega/utils/data-selection"

import {
  buildTimeLagExpr,
  getBinnedDimExpression,
  getDimensionExpression,
  MinMax
} from "vega/utils/query-building"

export const buildComboQuery = ({
  querySpec,
  layerIndex,
  minmax,
  numTopNGroups,
  enabledTopNGroups,
  allOthersGroupEnabled,
  allOthersSentinel
}: {
  querySpec: VegaComboChartQuerySpec
  layerIndex: number
  minmax?: MinMax
  numTopNGroups?: number
  enabledTopNGroups?: any[]
  allOthersGroupEnabled?: boolean
  allOthersSentinel?: any
}) => {
  const nullDimensionsEnabled =
    !querySpec.binSettings && querySpec.nullDimensionsEnabled
  let sortColumnName = querySpec.sortColumn.col.name

  const dimensions = querySpec.baseDimensions
  const sizeMeasureExprs = querySpec.sizeMeasures.map((sizeMeasure) =>
    sizeMeasure.type === TIME_LAG_EXPRESSION_TYPE
      ? buildTimeLagExpr(sizeMeasure, minmax, numTopNGroups, querySpec)
      : measureToExprStr(sizeMeasure)
  )

  const withSubqueries: Record<string, string> = {}

  const select = sizeMeasureExprs
    .filter((e) => e !== null)
    .map((sizeMeasureExpr, index) => `${sizeMeasureExpr} AS measure${index}`)

  if (sortColumnName === "countval") {
    // We're asked to order by # Records - search to see if there's a # Records
    // (count(*)) size measure already. If so, we don't want to add another one
    // but just reuse that one.
    const countIndex = querySpec.sizeMeasures.findIndex(
      (measure) => measure.type === "count"
    )

    if (countIndex >= 0) {
      sortColumnName = `measure${countIndex}`
    } else {
      // No existing count(*) measure, so we have to add one
      select.push("count(*) as countval")
    }
  }

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
      return buildFilterSql([af.filter])[0]
    }
  })

  const groupBy = dimensions.map((_, index) => `dimension${index}`)
  const having: string[] = []

  // A defined minmax limits the results to a set of bins already (and we limit
  // the max number of bins elsewhere)
  let limit = minmax ? undefined : querySpec.numberOfGroups

  const colorMeasure = querySpec.colorMeasure
  if (colorMeasure) {
    if (
      colorMeasure.aggregate === "Mode" &&
      dimensions.some(({ column }) => isEqual(colorMeasure.column, column))
    ) {
      // if Mode aggregated colorMeasure matches one of the dimensions, omit MODE() for performance
      select.push(`${colorMeasure.column.value} as measureColor`)
    } else {
      select.push(`${measureToExprStr(colorMeasure)} AS measureColor`)
    }
  }

  // currently only allowing to show first source color measure column in Sort By dropdown
  // When first source color measure column is selected from Sort By dropdown, we will order by on that
  // for first source, but we keep the existing color measure on the second source order by.
  let colorMeasureAlias = null
  if (layerIndex && layerIndex !== 0 && sortColumnName === "measureColor") {
    colorMeasureAlias = "measure0"
  } else {
    colorMeasureAlias = sortColumnName
  }

  if (
    querySpec.groupByDimension &&
    Array.isArray(enabledTopNGroups) &&
    enabledTopNGroups.length > 0
  ) {
    const groupByDimension = getDimensionExpression(
      querySpec.groupByDimension,
      minmax,
      numTopNGroups
    )

    const subquerySortByMeasure =
      colorMeasure && sortColumnName === "measureColor"
        ? measureToExprStr(colorMeasure)
        : sizeMeasureExprs[0]

    const subquerySortByMeasureAlias =
      sortColumnName === "measureColor" ? "measureColor" : "measure0"

    // this is a bit brutal to match the subquery dimension alias with the sortColumn col name, so may need to
    // change when we add layer specific sorting
    // eslint-disable-next-line consistent-return
    const getSortDimensionAliasForSubquery = (dimString) => {
      if (dimString && typeof dimString === "string") {
        const nthDimension = dimString.substr(9) // expecting string "dimension" in first 9 characters
        return `key${nthDimension}`
      } else {
        return sortColumnName
      }
    }

    const subquerySortByDimAlias =
      sortColumnName === "measure0" ||
      sortColumnName === "measureColor" ||
      sortColumnName === "countval"
        ? colorMeasureAlias
        : getSortDimensionAliasForSubquery(sortColumnName)

    let groupByDimensionIn = enabledTopNGroups.map(sql.escape).join(",")
    let groupByDimensionWhere = `${groupByDimension} IN (${groupByDimensionIn})`
    const groupByCanBeNull = enabledTopNGroups.includes(null)
    if (groupByCanBeNull) {
      groupByDimensionIn = enabledTopNGroups
        .filter((g) => g !== null)
        .map(sql.escape)
        .join(",")
      groupByDimensionWhere = `(${groupByDimension} IS NULL`
      if (groupByDimensionIn.length > 0) {
        groupByDimensionWhere += ` OR ${groupByDimension} IN (${groupByDimensionIn})`
      }
      groupByDimensionWhere += ")"
    }

    if (allOthersGroupEnabled) {
      if (
        !groupByCanBeNull ||
        allOthersSentinel === null ||
        allOthersSentinel === undefined
      ) {
        select.push(
          `CASE WHEN ${groupByDimensionWhere} THEN ${groupByDimension} END AS dimensionColor`
        )
      } else {
        select.push(
          `CASE WHEN ${groupByDimensionWhere} THEN ${groupByDimension} ELSE ${sql.escape(
            allOthersSentinel
          )} END AS dimensionColor`
        )
      }
      if (groupByCanBeNull && allOthersSentinel === undefined) {
        select.push(
          `${groupByDimension} IS NULL AS dimensionColorIsNotAllOthers`
        )
      }
    } else {
      select.push(`${groupByDimension} AS dimensionColor`)
      where.push(groupByDimensionWhere)
    }

    const subQuerySelect = [
      ...dimensions.map(
        (dimension, index) =>
          `${getDimensionExpression(
            dimension,
            minmax,
            numTopNGroups,
            querySpec.binSettings
          )} AS key${index}`
      ),
      `${subquerySortByMeasure} AS ${subquerySortByMeasureAlias}`
    ]

    if (sortColumnName === "countval") {
      subQuerySelect.push("count (*) as countval")
    }

    // If this query is continuous on the base dimension (has a min/max), it
    // will naturally limit itself according to the min/max - we trust that
    // prior logic has kept the date resolution or numerical binning resolution
    // below the thresholds we expect.
    //
    // Otherwise (meaning it is categorical on the base dimension), we need to
    // add a subquery to retrieve the top base dimension results up to the
    // specified limit, before doing the full chart query with the dual
    // grouping. If we don't do this query step first, any order/limit we apply
    // can cut off values from some groups.
    //
    // This specifically should come after the block above so the 'where' will
    // pick up the groupByDimensionIn if applicable
    if (!minmax) {
      withSubqueries.dimensionValues = sql`
      ${sql.select(subQuerySelect)}
      ${sql.from(querySpec.table)}
      ${sql.where(sql.and(where))}
      ${sql.groupBy(dimensions.map((_, index) => `key${index}`))}
      ${sql.orderBy(
        `${subquerySortByDimAlias} ${querySpec.sortColumn.order} NULLS LAST`
      )}
      ${sql.limit(limit)}
    `

      where.push(
        sql.and(
          dimensions.map((dimension, index) => {
            const expr = getDimensionExpression(
              dimension,
              minmax,
              numTopNGroups,
              querySpec.binSettings
            )
            return nullDimensionsEnabled
              ? sql.or(
                  `${expr} IN (SELECT key${index} FROM dimensionValues)`,
                  `${expr} IS NULL`
                )
              : `${expr} IN (SELECT key${index} FROM dimensionValues)`
          })
        )
      )
    }

    for (const sizeMeasure of querySpec.sizeMeasures) {
      if (sizeMeasure.type === "column_aggregate") {
        where.push(`${sizeMeasure.column.value} IS NOT NULL`)
      }
    }

    groupBy.push("dimensionColor")
    if (
      allOthersGroupEnabled &&
      groupByCanBeNull &&
      allOthersSentinel === undefined
    ) {
      groupBy.push("dimensionColorIsNotAllOthers")
    }

    // the subquery limits the results
    limit = undefined
  }

  dimensions.forEach((dimension, index) => {
    const dimensionExpr = dimensionToExprStr(dimension)
    if (querySpec && querySpec.binSettings) {
      const { table: dataSource, column }: DimensionExpression = dimension

      const binningWhereFilters = []
      const binningHavingFilters = []

      const binnedExpression =
        querySpec.binSettings.dimensionType === "binned_numeric" ||
        querySpec.binSettings.dimensionType === "binned_time" ||
        isGroupableTime(dimension.column)
          ? getBinnedDimExpression(
              dimensionExpr,
              minmax,
              numTopNGroups,
              querySpec.binSettings
            )
          : dimensionExpr

      select.push(`${binnedExpression} AS dimension${index}`)

      // where clause logic for numerical and date dimension - nulls are always
      // removed for continuous dimensions
      binningWhereFilters.push(
        notNullFilter(column.table, dataSource, dimensionExpr, column.type)
      )

      if (querySpec.binSettings) {
        if (
          querySpec.binSettings.dimensionType === "binned_numeric" ||
          querySpec.binSettings.dimensionType === "binned_time"
        ) {
          if (!minmax) {
            throw new Error("Invalid minmax for binned dimension")
          }

          binningWhereFilters.push(
            simpleFilter(
              column.table,
              dataSource,
              dimensionExpr,
              column.type,
              ">=",
              minmax.min
            )
          )
          binningWhereFilters.push(
            simpleFilter(
              column.table,
              dataSource,
              dimensionExpr,
              column.type,
              "<=",
              minmax.max
            )
          )
        }

        buildFilterSql(binningWhereFilters).map((bwf) => where.push(bwf))

        if (querySpec.binSettings.dimensionType === "binned_numeric") {
          const andFilterHaving = []
          // numOfBins is INT type
          andFilterHaving.push(
            simpleFilter(null, null, `dimension${index}`, "INT", ">=", 0)
          )
          andFilterHaving.push(
            simpleFilter(
              null,
              null,
              `dimension${index}`,
              "INT",
              "<",
              querySpec.binSettings.numOfBins
            )
          )
          const isNullFilterHaving = nullFilter(
            null,
            null,
            `dimension${index}`,
            "INT"
          )

          binningHavingFilters.push(
            orFilter([andFilter(andFilterHaving), isNullFilterHaving])
          )

          buildFilterSql(binningHavingFilters).map((bhf) => having.push(bhf))
        }
      } else if (!querySpec.binSettings && !nullDimensionsEnabled) {
        where.push(`${dimensionExpr} IS NOT NULL`)
      }
    } else {
      if (dimension.column?.is_array) {
        select.push(
          `UNNEST(${dimension.column.table}.${dimensionExpr}) AS dimension${index}`
        )
      } else {
        select.push(`${dimensionExpr} AS dimension${index}`)
      }

      if (!nullDimensionsEnabled) {
        where.push(`${dimensionExpr} IS NOT NULL`)
      }
    }
  })

  // This is generated from omnifilters to join tables which include our table
  where.push(...querySpec.joinFilters)

  return sql`
    ${sql.with(withSubqueries)}
    ${sql.select(select)}
    ${sql.from(querySpec.table)}
    ${sql.where(sql.and(where))}
    ${sql.groupBy(groupBy)}
    ${sql.having(sql.and(having))}
    ${sql.orderBy(
      `${colorMeasureAlias} ${querySpec.sortColumn.order} NULLS LAST`
    )}
    ${sql.limit(limit)}
  `
}
