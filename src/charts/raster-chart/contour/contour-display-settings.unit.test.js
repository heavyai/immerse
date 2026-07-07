// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import ContourDisplaySettings from "./contour-display-settings"
import { renderWithRedux } from "jest/renderScaffolding"
import { contourChart } from "./fixtures"
import Services from "services/immerse"

describe("ContourDisplaySettings", () => {
  // Mock Redux useSelector hook
  const chartId = "1"
  let mockChart
  let mockDispatch

  const dbCon = Services.get("DbCon")
  beforeEach(() => {
    mockChart = contourChart()
    mockDispatch = jest.fn()
    Services.get("DbCon").queryAsync.mockResolvedValue([])
  })
  afterEach(() => {
    mockDispatch.mockClear()
  })

  const renderAndMock = async (chart) => {
    const { store } = renderWithRedux(<ContourDisplaySettings />, null, {
      charts: {
        [chartId]: chart || mockChart
      },
      chartEditor: {
        editId: chartId
      }
    })
    // Waits for query to avoid act warnings due to the useEffect
    // which queries for raster stride
    await waitFor(() => {
      expect(dbCon.queryAsync).toHaveBeenCalled()
    })

    // Mock Redux dispatch function
    store.dispatch = mockDispatch
  }

  it("should render the component correctly", async () => {
    await renderAndMock()

    // Assert that the component renders correctly
    expect(screen.getByText(new RegExp("^Major$", "i"))).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp("^Interval Subdivisions$", "i"))
    ).toBeInTheDocument()
    expect(screen.getByText(new RegExp("^Sampling$", "i"))).toBeInTheDocument()
    expect(screen.getByText(new RegExp("^Fill$", "i"))).toBeInTheDocument()
    expect(screen.getByTestId("basemap-selector")).toBeInTheDocument()
    expect(screen.getByTestId("color-picker")).toBeInTheDocument()
  })

  it("should call dispatch with correct action when major contour interval changes", async () => {
    await renderAndMock()
    const majorIntervalSlider = screen.getByTestId(
      "major-contour-interval-slider-input"
    )

    fireEvent.change(majorIntervalSlider, { target: { value: 50 } })
    fireEvent.blur(majorIntervalSlider)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "CONTOUR_INTERVALS_CHANGED" })
    )
  })

  it("should disable minor contour interval unless measure is set", async () => {
    // Pretend we don't have a measure for value yet
    delete mockChart.majorContourSettings.intervalSize
    delete mockChart.layers[0].majorContourSettings.intervalSize
    mockChart.measures = []
    mockChart.layers[0].measures = []
    await renderAndMock()

    await waitFor(() => {
      const minorContourSelector = screen.getByTestId(
        "minor-contour-interval-selector"
      )
      expect(minorContourSelector).toHaveClass("custom-selector--disabled")
    })
  })

  it("should call dispatch with correct action when minor contour interval changes", async () => {
    await renderAndMock()

    const minorContourSelector = screen.getByTestId(
      "minor-contour-interval-trigger"
    )
    expect(minorContourSelector).not.toHaveClass("custom-selector--disabled")

    fireEvent.click(minorContourSelector)
    await waitFor(() => {
      screen.getByTestId("minor-contour-interval-1")
    })
    fireEvent.click(screen.getByTestId("minor-contour-interval-1"))

    // Assert that the dispatch function is called with the correct action
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "CONTOUR_INTERVALS_CHANGED" })
    )
  })
})
