// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import "charts/chart-definitions"
import { CHART_TYPES, CHARTS, backendCharts } from "constants/charts"
import {
  isLayerValid,
  isRasterChart,
  isMultiLayer,
  isGeoChart,
  isRasterChartButNotGeoheat,
  isBERendered,
  pointValue
} from "charts/raster-chart/raster-utils"

describe("Rastermap chart type", () => {
  it("registers under the rastermap type constant", () => {
    expect(CHART_TYPES.RASTERMAP).toEqual("rastermap")
    expect(backendCharts).toContain("rastermap")
  })

  it("requires x, y and color measures", () => {
    const measures = CHARTS.rastermap.measures
    expect(measures.map((m) => m.name)).toEqual(["x", "y", "color"])
    expect(measures.every((m) => m.required)).toBe(true)
    expect(CHARTS.rastermap.minDimensions).toBe(0)
    expect(CHARTS.rastermap.maxDimensions).toBe(0)
  })

  it("is classified as a multi-layer backend-rendered geo chart", () => {
    expect(isRasterChart("rastermap")).toBe(true)
    expect(isMultiLayer("rastermap")).toBe(true)
    expect(isGeoChart("rastermap")).toBe(true)
    expect(isRasterChartButNotGeoheat("rastermap")).toBe(true)
    expect(isBERendered("rastermap")).toBe(true)
  })

  it("is only valid when all three measures have values", () => {
    const makeMeasures = (x, y, color) => [
      { name: "x", value: x },
      { name: "y", value: y },
      { name: "color", value: color }
    ]
    expect(
      isLayerValid({
        type: "rastermap",
        measures: makeMeasures("raster_lon", "raster_lat", "value")
      })
    ).toBe(true)
    expect(
      isLayerValid({
        type: "rastermap",
        measures: makeMeasures("raster_lon", "raster_lat", null)
      })
    ).toBe(false)
    expect(
      isLayerValid({
        type: "rastermap",
        measures: makeMeasures("raster_lon", null, "value")
      })
    ).toBe(false)
    expect(isLayerValid({ type: "rastermap", measures: [] })).toBe(false)
  })

  it("maps POINT measures to ST_X/ST_Y expressions via pointValue", () => {
    const measures = [
      { name: "x", type: "POINT", value: "geom" },
      { name: "y", type: "POINT", value: "geom" }
    ]
    expect(pointValue(measures, 0)).toEqual("ST_X(geom)")
    expect(pointValue(measures, 1)).toEqual("ST_Y(geom)")
  })
})
