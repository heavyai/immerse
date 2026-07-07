// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { screen } from "@testing-library/react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"
import mockAppState from "utils/test-helpers/mock-app-state"
import { renderWithRedux } from "jest/renderScaffolding"

import ChartSettings from "./chart-settings"

import { registerChart } from "charts/chart-registration"
import contourChartDefinition from "charts/raster-chart/contour/definition"
import pointMapDefinition from "charts/raster-chart/point/definition"
import { MASTER_LAYER_SETTINGS } from "charts/raster-chart/raster-chart-consts"
import { twoLayerChart } from "./fixtures/chart-settings-fixtures"

const middlewares = [thunk]

describe("<ChartSettings />", () => {
  beforeEach(() => {
    registerChart(contourChartDefinition)
    registerChart(pointMapDefinition)
  })

  const defaultProps = {
    chart: twoLayerChart,
    id: "0",
    onUnlockTopN: jest.fn(),
    updateChart: jest.fn()
  }
  const renderWithStore = (props) => {
    const mockStore = configureStore(middlewares)({
      ...mockAppState
    })
    return renderWithRedux(
      <ChartSettings {...defaultProps} {...props} />,
      mockStore
    )
  }

  it("should hide opacity slider if not supported by layer", () => {
    renderWithStore()
    // Point layer should have opacity slider + zoom visibility slider
    expect(screen.getByTestId("layer-0-opacity")).toBeInTheDocument()
    expect(screen.getByTestId("layer-0-zoom-visibility")).toBeInTheDocument()

    // Contour layer should _not_ have slider, but have zoom visibility
    expect(screen.queryByTestId("layer-1-opacity")).not.toBeInTheDocument()
    expect(screen.getByTestId("layer-1-zoom-visibility")).toBeInTheDocument()
  })

  it("should hide zoom range slider if layer does not support the setting", () => {
    const contourChartDefinitionNoZoom = {
      ...contourChartDefinition,
      masterLayerSettings: [MASTER_LAYER_SETTINGS.OPACITY]
    }
    // Re-register contour, with no zoom support
    registerChart(contourChartDefinitionNoZoom)

    renderWithStore()
    // Now contour only supports opacity
    expect(screen.getByTestId("layer-1-opacity")).toBeInTheDocument()
    // No zoom visibility slider
    expect(
      screen.queryByTestId("layer-1-zoom-visibility")
    ).not.toBeInTheDocument()
  })
})
