// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, waitFor } from "@testing-library/react"
import CreateSagaComponent from "./create-saga-chart-component"

describe("CreateSagaComponent", () => {
  const chart = {
    width: 50,
    height: 100,
    measures: [],
    dimensions: [],
    areFiltersInverse: false,
    autoSize: true,
    cap: 0,
    elasticX: false,
    filters: []
  }
  const props = {
    id: "1",
    hasError: false,
    dispatch: jest.fn(),
    chart,
    elasticX: false,
    areFiltersInverse: false
  }
  const createChart = jest.fn()
  const updateChart = jest.fn()

  const ChartComponent = CreateSagaComponent(createChart, updateChart)

  it("should not call createChart on mount if error", () => {
    render(<ChartComponent {...props} hasError />)
    expect(createChart).not.toHaveBeenCalled()
  })

  it("should call createChart on mount ", () => {
    render(<ChartComponent {...props} />)
    expect(createChart).toHaveBeenCalled()
  })

  it("should not call createChart on mount if selector is loading", () => {
    chart.measures.push({ loading: true })
    render(<ChartComponent {...props} />)
    expect(createChart).toHaveBeenCalled()
  })

  it("should dispatch width/height changes", async () => {
    const { rerender } = render(<ChartComponent {...props} />)
    const newChartProps = { width: 100, height: 100 }
    const newChartProps2 = { width: 100, height: 200 }
    const widthHeightProp = { chart: { ...chart, ...newChartProps } }
    const widthHeightProp2 = { chart: { ...chart, ...newChartProps2 } }

    rerender(<ChartComponent {...props} {...widthHeightProp} />)
    await waitFor(() => {
      expect(updateChart).toHaveBeenCalled()
    })
    expect(updateChart).toHaveBeenCalledWith("1", newChartProps)

    rerender(<ChartComponent {...props} {...widthHeightProp2} />)
    await waitFor(() => {
      expect(updateChart).toHaveBeenCalledTimes(2)
    })
    expect(updateChart).toHaveBeenLastCalledWith(
      "1",
      expect.objectContaining(newChartProps2)
    )
  })
})
