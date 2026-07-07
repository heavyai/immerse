// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import sql from "vega/utils/sql-tag"

import { buildFilterSql } from "vega/constants/filter-types"

import { VegaPointmapQuerySpec, VegaQuerySpec } from "../types"
import { VegaMapBounds } from "./types"

const POINTMAP_LIMIT = 10000000

const buildPointmapQuery = (querySpec: VegaPointmapQuerySpec) => {
  const {
    table,
    lonMeasure: { value: lonValue },
    latMeasure: { value: latValue }
  } = querySpec

  const select = [
    `conv_4326_900913_x(${lonValue}) AS x`,
    `conv_4326_900913_y(${latValue}) AS y`
  ]

  let where = []

  if (querySpec.appliedFilters.length) {
    querySpec.appliedFilters.forEach((f) => {
      where = where.concat(buildFilterSql([f.filter]))
    })
  }

  return sql`
    ${sql.select(select)}
    ${sql.from(table)}
    ${sql.where(sql.and(where))}
    ${sql.limit(POINTMAP_LIMIT)}
  `
}

export const buildQuery = (
  querySpec: VegaQuerySpec,
  bounds: VegaMapBounds
): string => {
  switch (querySpec.type) {
    case "vega-pointmap":
      return buildPointmapQuery(querySpec, bounds)
    default:
      throw Error("Unhandled Vega chart type")
  }
}

export const buildFilterBboxQuery = (
  table: string,
  filter: string,
  data: {
    lonField?: string
    latField?: string
    geomField?: string
  }
): string => {
  const select =
    data.lonField && data.latField
      ? `MIN(${data.lonField}) AS x_min, MAX(${data.lonField}) AS x_max, MIN(${data.latField}) AS y_min, MAX(${data.latField}) AS y_max`
      : `MIN(ST_XMIN(${data.geomField})) AS x_min, MAX(ST_XMAX(${data.geomField})) as x_max, MIN(ST_YMIN(${data.geomField})) AS y_min, MAX(ST_YMAX(${data.geomField})) AS y_max`
  return sql`
    ${sql.select(select)}
    ${sql.from(table)}
    ${sql.where(filter)}
  `
}
