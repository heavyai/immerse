// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as actions from "./raster-chart-actions"

describe("RasterChart Action Creators", () => {
  describe("createRasterChart", () => {
    it("should return proper action", () => {
      expect(actions.createRasterChart("1", {})).toStrictEqual({
        type: actions.CREATE_RASTER_CHART,
        chartId: "1",
        chartSpec: {}
      })
    })
  })
  describe("removeRasterChartMeasure", () => {
    it("should return proper action", () => {
      expect(actions.removeRasterChartMeasure("1", 0)).toStrictEqual({
        type: actions.REMOVE_RASTER_CHART_MEASURE,
        chartId: "1",
        index: 0
      })
    })
  })
  describe("updateRasterChart", () => {
    it("should return proper action", () => {
      expect(actions.updateRasterChart("1", {})).toStrictEqual({
        type: actions.UPDATE_RASTER_CHART,
        chartId: "1",
        updates: {}
      })
    })
  })
  describe("updateDensityAccumulator", () => {
    it("should return proper action", () => {
      expect(actions.updateDensityAccumulator("1", {})).toStrictEqual({
        type: actions.UPDATE_DENSITY_ACCUMULATOR,
        chartId: "1",
        updates: {}
      })
    })
  })
  describe("setRasterChartMeasure", () => {
    it("should return proper action", () => {
      expect(actions.setRasterChartMeasure("1", {}, 2)).toStrictEqual({
        type: actions.SET_RASTER_CHART_MEASURE,
        chartId: "1",
        index: 2,
        selector: {}
      })
    })
  })
  describe("updateColorLegend", () => {
    it("should return an action to update color legend", () => {
      expect(actions.updateColorLegend("1", {}, 0)).toStrictEqual({
        type: actions.UPDATE_COLOR_LEGEND,
        chartId: "1",
        updates: {},
        legendIndex: 0
      })
    })
  })
})
