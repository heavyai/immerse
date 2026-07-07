// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import ChartContainer, {
  chartContainerTestId
} from "components/chart-container/chart-container"
import { noop } from "utils/helpers"

describe("ChartContainer Component", () => {
  const Chart = () => <div data-testid="chart-component" />

  const baseProps = {
    cid: "1",
    chartSpec: { hasError: false, areFiltersInverse: false, autoSize: false },
    chart: {},
    dispatch: noop,
    ChartComponent: Chart,
    areSelectorsEmpty: false,
    allChartsInitialized: false,
    hasError: false,
    loading: false,
    requiredAttributes: false,
    updateChart: () => {}
  }

  const renderContainer = (overrideProps = {}) => {
    const props = { ...baseProps, ...overrideProps }
    return render(<ChartContainer {...props} />)
  }

  describe("render", () => {
    it("should not render ChartComponent when there is an error", () => {
      const { queryByTestId } = renderContainer({ hasError: true })
      expect(queryByTestId("chart-component")).toBeNull()
    })

    it("should not render ChartComponent when there is no ChartComponent", () => {
      const { queryByTestId } = renderContainer({ ChartComponent: null })
      expect(queryByTestId("chart-component")).toBeNull()
    })

    it("should not render ChartComponent when selectors are empty", () => {
      const { queryByTestId } = renderContainer({ areSelectorsEmpty: true })
      expect(queryByTestId("chart-component")).toBeNull()
    })

    it("should render the chart container wrapper", () => {
      const { getByTestId } = renderContainer()
      expect(getByTestId(chartContainerTestId)).toBeInTheDocument()
    })
  })
})
