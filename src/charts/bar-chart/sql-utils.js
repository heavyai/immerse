// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sls from "single-line-string"
import { compose, contains, has, nth, path, prop } from "ramda"

export const has2ndDimension = compose(has("value"), nth(1))

export const toAggExpr = (measure, alias = true, sortColumn = null) => {
  let aggType = ""
  const type = measure.aggType
  const value = measure.value

  // sort column "# Records" overrides any measure
  if (sortColumn && sortColumn.col && sortColumn.col.name === "countval") {
    aggType = "count(*)"
  } else if (type === "# Unique") {
    aggType = `approx_count_distinct(${value})`
  } else if (type === "Median") {
    aggType = `approx_median(${value})`
  } else if (type === "Custom") {
    aggType = `${value}`
  } else {
    aggType = `${type.toLowerCase()}(${value})`
  }

  if (alias) {
    return `${aggType} AS val`
  }

  return aggType
}

export const groupingCase = (dimensions, groups, showOther) => {
  if (has2ndDimension(dimensions) && groups.length) {
    return sls`
      CASE
        WHEN ${dimensions[1].value} IN (${groups
      .map((d) => `'${d.replace(/'/gi, "''")}'`)
      .join(",")})
          THEN ${dimensions[1].value}
        ELSE ${showOther ? "'other'" : "'undefined'"}
      END AS key1,`
  }
  return ""
}

export const toWhereClause = (props) => {
  const {
    measures,
    dimensions,
    filterString,
    globalFilterString,
    showNullDimensions,
    dataSource,
    numberGroups,
    sortColumn
  } = props
  let wc = "WHERE ("
  const nullMeasureFilter =
    measures[0].aggType === "Custom" || measures[0].value === "*"
      ? ""
      : `${measures[0].value} IS NOT NULL`
  const hasSD = has2ndDimension(dimensions)
  const hasFS = Boolean(filterString)
  const hasGFS = Boolean(globalFilterString)
  const shouldMakeWC =
    hasSD || hasFS || hasGFS || nullMeasureFilter.length || !showNullDimensions

  if (!shouldMakeWC) {
    return ""
  }

  if (hasSD) {
    wc = `${wc}(${dimensions[0].value} IN (${genLimitSQL({
      dimensions,
      measures,
      dataSource,
      showNullDimensions,
      numberGroups,
      sortColumn
    })})`

    if (nullMeasureFilter.length) {
      wc = `${wc} AND ${nullMeasureFilter}`
    }
    if (showNullDimensions) {
      wc = `${wc} OR ${dimensions[0].value} IS NULL)`
    } else {
      wc = `${wc})`
    }
    if (hasFS) {
      wc = `${wc} AND ${filterString}`
    }
    if (hasGFS) {
      wc = `${wc} AND ${globalFilterString}`
    }
  } else {
    const filters = []

    if (nullMeasureFilter.length) {
      filters.push(nullMeasureFilter)
    }
    if (hasFS) {
      filters.push(filterString)
    }
    if (hasGFS) {
      filters.push(globalFilterString)
    }
    if (!showNullDimensions) {
      filters.push(`${dimensions[0].value} IS NOT NULL`)
    }

    wc = `${wc}${filters.join(" AND ")}`
  }

  return `${wc})`
}

export function genLimitSQL({
  dimensions,
  measures,
  dataSource,
  numberGroups,
  sortColumn
}) {
  const aggExpr = toAggExpr(measures[0], false, sortColumn)

  return sls`
    SELECT ${dimensions[0].value}
    FROM ${dataSource}
    GROUP BY ${dimensions[0].value}
    HAVING ${aggExpr} IS NOT NULL
    ORDER BY ${aggExpr}
    DESC LIMIT ${numberGroups}`
}

export function genTopKSQL({
  dimensions,
  measures,
  dataSource,
  filterString,
  globalFilterString,
  sortColumn
}) {
  function whereClause() {
    let wc = ""
    if (filterString && !globalFilterString) {
      wc = `WHERE ${filterString}`
    } else if (globalFilterString && !filterString) {
      wc = `WHERE ${globalFilterString}`
    } else if (filterString && globalFilterString) {
      wc = `WHERE ${filterString} AND ${globalFilterString}`
    }
    return wc
  }

  function orderByClause() {
    const sortName = path(["col", "name"], sortColumn)
    const sortOrder = prop("order", sortColumn)
    const permittedSortName = contains(sortName, ["val", "key0"])
      ? sortName
      : "val"
    const permittedSortOrder = contains(sortOrder, ["desc", "asc"])
      ? sortOrder
      : "desc"
    return `ORDER BY ${permittedSortName} ${permittedSortOrder}`
  }

  return sls`
    SELECT ${dimensions[1].value} AS key0,
    ${toAggExpr(measures[0])}
    FROM ${dataSource}
    ${whereClause()}
    GROUP BY key0
    HAVING val IS NOT NULL AND key0 IS NOT NULL
    ${orderByClause()}
    LIMIT 5
  `
}

export default function genSQL({
  dimensions,
  measures,
  dataSource,
  groups,
  filterString,
  globalFilterString,
  showOther,
  sortColumn,
  showNullDimensions,
  numberGroups
}) {
  function countval() {
    if (
      typeof sortColumn === "object" &&
      sortColumn.col &&
      sortColumn.col.name === "countval"
    ) {
      return ", count(*) AS countval"
    }
    return ""
  }

  function groupBy() {
    let gb = "GROUP BY key0"
    if (has2ndDimension(dimensions) && groups.length) {
      gb = `${gb}, key1`
    }
    return gb
  }

  function orderBy() {
    if (typeof sortColumn === "object" && sortColumn.col) {
      return `ORDER BY ${sortColumn.col.name} ${sortColumn.order}`
    } else {
      return ""
    }
  }

  // only limit when no 2nd dimension is enabled
  function limit() {
    return has2ndDimension(dimensions) ? "" : `LIMIT ${numberGroups}`
  }

  const query = sls`
    SELECT ${dimensions[0].value} AS key0,
    ${groupingCase(dimensions, groups, showOther)}
    ${toAggExpr(measures[0])}
    ${countval()}
    FROM ${dataSource}
    ${toWhereClause({
      measures,
      dimensions,
      filterString,
      globalFilterString,
      showNullDimensions,
      dataSource,
      numberGroups,
      sortColumn
    })}
    ${groupBy()}
    ${orderBy()}
    NULLS LAST
    ${limit()}
  `

  return query
}
