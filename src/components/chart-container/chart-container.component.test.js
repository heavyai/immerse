// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { renderWithRedux } from "jest/renderScaffolding"
import "@testing-library/jest-dom/extend-expect"
import ChartContainer, {
  chartContainerTestId
} from "components/chart-container/chart-container"
import { noop } from "utils/helpers"

describe("ChartContainer Component", () => {
  let component = null

  class MockedChartContainer extends ChartContainer {
    UNSAFE_componentWillReceiveProps = noop
    resizeChart = jest.fn()
  }

  const Chart = () => <div className="chart-component" />

  const props = {
    cid: "1",
    chartSpec: { hasError: false, areFiltersInverse: false, autoSize: false },
    dispatch: noop,
    inDashboard: true,
    inEditor: false,
    ChartComponent: Chart,
    areSelectorsEmpty: false,
    allChartsInitialized: false,
    hasError: false,
    loading: false,
    requiredAttributes: false,
    updateChart: noop
  }

  beforeEach(() => {
    component = <MockedChartContainer {...props} />
  })

  const initialState = {
    routing: {
      locationBeforeTransitions: {
        pathname: "/dashboard"
      }
    },
    dashboard: {},
    charts: {
      1: {
        height: 400,
        width: 400,
        dimensions: [],
        measures: []
      }
    }
  }

  it("should render the component", () => {
    const { getByTestId } = renderWithRedux(component, null, initialState)
    expect(getByTestId(chartContainerTestId)).toBeTruthy()
    expect(getByTestId(chartContainerTestId).tagName).toBe("DIV")
  })
})
