// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render } from "@testing-library/react"
import ChartTypeButton from "components/chart-type-button/chart-type-button"
import React from "react"

describe("<ChartTypeButton />", () => {
  let props

  beforeEach(() => {
    props = {
      chart: {
        dimensions: [{ value: "join_time", type: "FLOAT" }],
        measures: [{ value: "followers" }],
        type: "table",
        areFiltersInverse: false,
        autoSize: false,
        cap: 0
      },
      chartLabel: "PIE",
      chartType: "pie",
      className: "pie-btn",
      iconId: "chart-pie",
      id: "1",
      isEnabled: true,
      reqMsg: "Requires 1 dimension and 1 measure",
      updateChart: jest.fn(),
      updateChartType: jest.fn(),
      disabled: false
    }
  })

  const renderComponent = () => {
    return render(<ChartTypeButton {...props} />)
  }

  it("should do mount a pie button", () => {
    const { getByTestId } = renderComponent()
    expect(getByTestId("chart-type-pie")).toBeInTheDocument()
  })

  it("should be enabled and not selected", () => {
    const { getByTestId } = renderComponent()
    expect(getByTestId("chart-type-pie")).not.toHaveClass("chart-btn-selected")
    expect(getByTestId("chart-type-pie")).toHaveClass("chart-btn-enabled")
  })

  it("should be endabled and selected", () => {
    props.chart.type = "pie"
    const { getByTestId } = renderComponent()
    expect(getByTestId("chart-type-pie")).toHaveClass("chart-btn-selected")
    expect(getByTestId("chart-type-pie")).toHaveClass("chart-btn-enabled")
  })
  it("should be disabled", () => {
    props.isEnabled = false
    const { getByTestId } = renderComponent()
    expect(getByTestId("chart-type-pie")).not.toHaveClass("chart-btn-enabled")
  })

  it("should update chart type when button is clicked and not selected", () => {
    const { getByTestId } = renderComponent()
    fireEvent.click(getByTestId("chart-type-pie"))
    expect(props.updateChartType).toHaveBeenCalled()
  })

  it("should return noop when button is clicked and also is selected", () => {
    props.chart.type = "pie"
    const { getByTestId } = renderComponent()
    fireEvent.click(getByTestId("chart-type-pie"))
    expect(props.updateChartType).not.toHaveBeenCalled()
  })
})
