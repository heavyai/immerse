// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isSelectorUsable, toSQLAgg } from "utils/selector-helpers"

function buildDimensionSQL(dimensions = []) {
  return dimensions
    .filter(isSelectorUsable)
    .map((d, i) => {
      let dVal = d.value
      if (d.timeBin && !d.extract && d.timeBin !== "auto") {
        dVal = `date_trunc(${d.timeBin}, ${d.value})`
      }
      return `${dVal} AS key${i}`
    })
    .toString()
}

function buildGroupBySQL(dimensions = []) {
  return dimensions
    .filter(isSelectorUsable)
    .map((d, i) => `key${i}`)
    .toString()
}

function getMeasureLabel(measure = {}, i) {
  /* if (!measure.label) {
    return `measure${i}`
  } else */
  if (measure.name) {
    return measure.name
  } else if (measure.label.match(/\${/)) {
    const param = measure.label.replace(/(\${|})/g, "").replace(/.+_/, "")

    return `${param}__`
  } else {
    return `measure${i}`
    // return measure.label
  }
}

function buildMeasureSQL(measures = [], is_aggregate) {
  if (is_aggregate) {
    return measures
      .filter(isSelectorUsable)
      .map((m, i) => `${toSQLAgg(m)} AS ${getMeasureLabel(m, i)}`)
      .toString()
  } else {
    return measures
      .filter(isSelectorUsable)
      .map((m, i) => `${m.value} AS ${getMeasureLabel(m, i)}`)
      .toString()
  }
}

export function buildQuery(querySpec = {}) {
  const dimensionSQL = buildDimensionSQL(querySpec.dimensions)
  const measureSQL = buildMeasureSQL(
    querySpec.measures,
    dimensionSQL.length || querySpec.forceAggregate
  )

  if (!dimensionSQL && !measureSQL) {
    return undefined
  }

  const query = [
    "SELECT",
    [dimensionSQL, measureSQL].filter((c) => c.length).join(", "),
    "FROM",
    querySpec.dataSource
  ]

  const filterString = !querySpec.unfiltered && querySpec.filterString

  if (filterString?.length) {
    query.push("WHERE", filterString)
  }

  if (dimensionSQL.length) {
    query.push("GROUP BY", buildGroupBySQL(querySpec.dimensions))
  }

  if (querySpec.orderBy) {
    query.push("ORDER BY", querySpec.orderBy)
  }

  if (querySpec.limit) {
    query.push("LIMIT", querySpec.limit)
  }

  return query.join(" ")
}
