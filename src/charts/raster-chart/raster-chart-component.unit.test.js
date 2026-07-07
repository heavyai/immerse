// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, waitFor } from "@testing-library/react"
import { PointmapChartComponent } from "./raster-chart-component"
import {
  createGeoHeatChart,
  destroyGeoHeatChart,
  updateGeoHeatChart
} from "./geoheat-actions"

describe("raster chart components", () => {
  describe("Pointmap Component", () => {
    let chart
    let props

    beforeEach(() => {
      chart = {
        width: 50,
        height: 100,
        measures: [],
        dimensions: [],
        layers: [],
        currentLayer: 0,
        autoSize: false,
        areFiltersInverse: false,
        cap: 0,
        elasticX: false
      }
      props = {
        id: "1",
        hasError: false,
        dispatch: jest.fn(),
        chart,
        autoSize: false,
        areFiltersInverse: false,
        cap: 0,
        elasticX: false
      }
    })

    it("should not dispatch create on mount if error", () => {
      render(<PointmapChartComponent {...props} hasError />)
      expect(props.dispatch).not.toHaveBeenCalledWith(
        createGeoHeatChart("1", chart)
      )
    })

    it("should dispatch create on mount ", () => {
      render(<PointmapChartComponent {...props} />)
      expect(props.dispatch).toHaveBeenCalled()
    })

    it("should dispatch width/height changes", async () => {
      const chartUpdates = { width: 100, height: 100 }
      const { rerender } = render(<PointmapChartComponent {...props} />)

      // Reset after initial render so we only get the update dispatches
      props.dispatch.mockReset()
      rerender(
        <PointmapChartComponent
          {...props}
          chart={{ ...chart, ...chartUpdates }}
        />
      )
      await waitFor(() => {
        expect(props.dispatch).toHaveBeenCalled()
      })
      expect(props.dispatch).toHaveBeenCalledWith(
        expect.objectContaining(updateGeoHeatChart("1", chartUpdates))
      )
    })

    it("should dispatch destroy on un-mount", () => {
      const newChart = {
        dataSource: null,
        type: "pointmap",
        measures: [],
        dimensions: []
      }
      const { unmount, rerender } = render(
        <PointmapChartComponent {...props} />
      )
      rerender(<PointmapChartComponent {...props} chart={newChart} />)
      props.dispatch.mockReset()
      unmount()
      expect(props.dispatch).toHaveBeenCalledWith(
        expect.objectContaining(destroyGeoHeatChart("1"))
      )
    })
  })
})
