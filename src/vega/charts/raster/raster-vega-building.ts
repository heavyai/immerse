// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { buildQuery } from "./raster-query-building"

import { conv4326To900913 } from "./utils"

import { VegaPointmapQuerySpec } from "../types"
import { VegaMapSize, VegaMapBounds } from "./types"

export const makePointmapVegaSpec = (
  querySpec: VegaPointmapQuerySpec,
  size: VegaMapSize,
  bounds: VegaMapBounds
) => {
  const { width, height } = size
  const { lonMin, lonMax, latMin, latMax } = bounds

  const sql = buildQuery(querySpec, bounds)

  const [lonMinMercator, latMinMercator] = conv4326To900913([lonMin, latMin])
  const [lonMaxMercator, latMaxMercator] = conv4326To900913([lonMax, latMax])

  return {
    width,
    height,
    data: [
      {
        name: "pointmap",
        sql,
        enableHitTesting: true
      }
    ],
    scales: [
      {
        name: "x",
        type: "linear",
        domain: [lonMinMercator, lonMaxMercator],
        range: "width"
      },
      {
        name: "y",
        type: "linear",
        domain: [latMinMercator, latMaxMercator],
        range: "height"
      },
      {
        name: "pointmap_fillColor",
        type: "linear",
        domain: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
        range: [
          "rgba(17,95,154,0.475)",
          "rgba(25,132,197,0.5471153846153846)",
          "rgba(34,167,240,0.6192307692307691)",
          "rgba(72,181,196,0.6913461538461538)",
          "rgba(118,198,143,0.7634615384615384)",
          "rgba(166,215,91,0.835576923076923)",
          "rgba(201,229,47,0.85)",
          "rgba(208,238,17,0.85)",
          "rgba(208,244,0,0.85)"
        ],
        accumulator: "density",
        minDensityCnt: "-2ndStdDev",
        maxDensityCnt: "2ndStdDev",
        clamp: true
      }
    ],
    projections: [],
    marks: [
      {
        type: "symbol",
        from: {
          data: "pointmap"
        },
        properties: {
          xc: {
            scale: "x",
            field: "x"
          },
          yc: {
            scale: "y",
            field: "y"
          },
          fillColor: {
            scale: "pointmap_fillColor",
            value: 0
          },
          shape: "circle",
          width: 2,
          height: 2
        }
      }
    ]
  }
}
