// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sql from "vega/utils/sql-tag"
import { buildOmnifilterSql } from "vega/constants/filter-types"
import { DeckGLLayerQuerySpec } from "./query-spec"
import { Measure } from "constants/prop-types"
import { toSQLAgg } from "utils/selector-helpers"

function ptx(lon: Measure): Measure {
  if (lon.type === "POINT") {
    return {
      ...lon,
      value: `ST_X(${lon.value})`
    }
  }
  return lon
}

function pty(lat: Measure): Measure {
  if (lat.type === "POINT") {
    return {
      ...lat,
      value: `ST_Y(${lat.value})`
    }
  }
  return lat
}

export const buildDeckgl3dQuery = (
  querySpec: DeckGLLayerQuerySpec,
  cardinality: number
) => {
  const aggregateMeasures =
    querySpec.type === "pointmap" && querySpec.dimensions.length > 0
  const measureToSql = aggregateMeasures
    ? toSQLAgg
    : ({ value }: Measure) => value

  const select = []
  querySpec.dimensions.forEach(({ value }, index) => {
    select.push(`${value} AS dimension${index}`)
  })
  if (querySpec.dimensions.length === 0) {
    querySpec.popupColumns.forEach(({ value }, index) => {
      select.push(`${value} AS popup${index}`)
    })
  }

  if (querySpec.type === "pointmap") {
    select.push(
      `${measureToSql(ptx(querySpec.lonMeasure))} AS lon`,
      `${measureToSql(pty(querySpec.latMeasure))} AS lat`
    )

    if (querySpec.altMeasure) {
      select.push(`${measureToSql(querySpec.altMeasure)} AS alt`)
    }
  } else if (querySpec.type === "linemap" || querySpec.type === "choropleth") {
    select.push(`${measureToSql(querySpec.geoMeasure)} AS geo`)
    if (querySpec.type === "choropleth" && querySpec.elevationMeasure) {
      select.push(`${measureToSql(querySpec.elevationMeasure)} AS elevation`)
    }
  }

  if (querySpec.colorMeasure) {
    select.push(`${measureToSql(querySpec.colorMeasure)} AS color`)
  }

  const where = querySpec.appliedFilters.map((af) =>
    buildOmnifilterSql(af, querySpec.table)
  )
  if (cardinality > querySpec.limit) {
    const sample = Math.min(querySpec.limit / cardinality, 1.0)
    where.unshift(`SAMPLE_RATIO(${sample})`)
  }

  const groupBy =
    querySpec.type === "pointmap"
      ? querySpec.dimensions.map((_, index) => `dimension${index}`)
      : []

  return sql`
    ${sql.select(select)}
    ${sql.from(querySpec.table)}
    ${sql.where(sql.and(where))}
    ${sql.groupBy(groupBy)}
  `
}

export const buildDeckglCardinalityQuery = (
  querySpec: DeckGLLayerQuerySpec
) => {
  const where = querySpec.appliedFilters.map((af) =>
    buildOmnifilterSql(af, querySpec.table)
  )

  return sql`
    ${sql.select("COUNT(*) AS val")}
    ${sql.from(querySpec.table)}
    ${sql.where(sql.and(where))}
  `
}
