// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import {
  ChartTypePanel,
  shouldDisable,
  calculateChartTypeButtons,
  filterChartTypes
} from "components/chart-type-panel/chart-type-panel"
import { CHART_TYPES } from "constants/charts"
import { render, screen } from "@testing-library/react"

describe("<ChartTypePanelParent />", () => {
  describe("possible chart types", () => {
    it("should exclude pointmap and backendScatter when isRenderingEnabled is false", () => {
      const isPolyRasterEnabled = true
      const isRenderingEnabled = false
      const chartTypeButtons = calculateChartTypeButtons({
        chartTypes: filterChartTypes(isPolyRasterEnabled, isRenderingEnabled),
        chart: {
          type: CHART_TYPES.BAR,
          currentLayer: `master`,
          isPolyRasterEnabled: true,
          isRenderingEnabled: false
        },
        uiMultiSourceModeEnabled: false
      })

      expect(
        chartTypeButtons.find(
          (btn) =>
            btn.type === CHART_TYPES.POINTMAP ||
            btn.type === CHART_TYPES.BACKEND_SCATTER
        )
      ).toBeFalsy()
    })
    it("should include all charts except backendChoropleth when isRenderingEnabled is true", () => {
      const isPolyRasterEnabled = false
      const isRenderingEnabled = true
      const chartTypeButtons = calculateChartTypeButtons({
        chartTypes: filterChartTypes(isPolyRasterEnabled, isRenderingEnabled),
        chart: {
          type: CHART_TYPES.BAR,
          currentLayer: `master`,
          isPolyRasterEnabled: false,
          isRenderingEnabled: true
        },
        uiMultiSourceModeEnabled: false
      })

      expect(
        chartTypeButtons.find(
          (btn) => btn.type === CHART_TYPES.BACKEND_CHOROPLETH
        )
      ).toBeFalsy()
    })
    it("should include backendChoropleth when chart is in multi layer mode with PolyRasterEnabled", () => {
      const isPolyRasterEnabled = true
      const isRenderingEnabled = true
      const chartTypeButtons = calculateChartTypeButtons({
        chartTypes: filterChartTypes(isPolyRasterEnabled, isRenderingEnabled),
        chart: {
          type: CHART_TYPES.BAR,
          currentLayer: `master`,
          layers: [{}, {}],
          isPolyRasterEnabled: true,
          isRenderingEnabled: true
        },
        uiMultiSourceModeEnabled: false
      })

      expect(
        chartTypeButtons.find(
          (btn) => btn.type === CHART_TYPES.BACKEND_CHOROPLETH
        )
      ).toBeTruthy()
    })
  })

  describe("<ChartTypePanel />", () => {
    it("should enable some ChartTypeButtons based on active selectors", () => {
      const props = {
        chart: {
          type: CHART_TYPES.PIE,
          dimensions: [{ value: "join_time", type: "FLOAT" }],
          measures: [{ value: "followers", type: `INT` }]
        },
        isPolyRasterEnabled: true,
        isRenderingEnabled: true,
        uiMultiSourceModeEnabled: false,
        updateChart: () => {},
        updateChartType: () => {}
      }

      render(<ChartTypePanel {...props} />)
      const allButtons = screen.getAllByRole("button")
      expect(allButtons).toHaveLength(15)
      const enabledButtons = allButtons.filter((button) =>
        button.classList.contains("chart-btn-enabled")
      )
      expect(enabledButtons).toHaveLength(3)
    })
  })

  describe("shouldDisable()", () => {
    it("should return false if ContentTypeButton (CTB) type === currentChart.type", () => {
      expect(
        shouldDisable(
          {
            type: "pointmap"
          },
          "pointmap"
        )
      ).toBeFalsy()
    })
    it("should return true if current chart is old combo", () => {
      expect(
        shouldDisable(
          {
            type: "line2",
            multiSources: { 0: {}, 1: {} }
          },
          "pointmap"
        )
      ).toBeTruthy()
    })
    it("should return true if current chart is new combo", () => {
      expect(
        shouldDisable(
          {
            type: "vega-combo",
            dataSelections: [{}, {}]
          },
          "pointmap"
        )
      ).toBeTruthy()
    })
    it("should return false if current chart is new combo and type is old combo", () => {
      expect(
        shouldDisable(
          {
            type: "vega-combo",
            dataSelections: [{}, {}]
          },
          "line2"
        )
      ).toBeFalsy()
    })
    it("should return false if current chart is old combo and type is new combo", () => {
      expect(
        shouldDisable(
          {
            type: "line2",
            multiSources: { 0: {}, 1: {} }
          },
          "vega-combo"
        )
      ).toBeFalsy()
    })
    it(`should return true if currentLayer === 'master'`, () => {
      expect(
        shouldDisable(
          {
            type: "pointmap",
            layers: [{}, {}],
            currentLayer: "master"
          },
          "geoheat"
        )
      ).toBeTruthy()
    })
    it(`should return false if multiLayered Chart and type IS multi-layer`, () => {
      expect(
        shouldDisable(
          {
            type: "pointmap",
            layers: [{}, {}],
            currentLayer: 0
          },
          "geoheat"
        )
      ).toBeFalsy()
    })
    it(`should return true if multiLayered Chart and type is NOT multi-layer`, () => {
      expect(
        shouldDisable(
          {
            type: "pointmap",
            layers: [{}, {}],
            currentLayer: 0
          },
          "line"
        )
      ).toBeTruthy()
    })
  })
})
