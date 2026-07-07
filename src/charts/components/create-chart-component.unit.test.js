// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, waitFor } from "@testing-library/react"
import * as ActionTypes from "constants/action-types"
import mockAppState from "utils/test-helpers/mock-app-state"
import createChartComponent from "./create-chart-component"

const redrawAllActionType = "REDRAW_ALL"
const renderSuccessActionType = "CHART_RENDER_REQUEST"

jest.mock("actions/dc-action-creators", () => ({
  redrawAll: () => redrawAllActionType,
  chartRenderSuccess: (id) => ({
    type: renderSuccessActionType,
    id
  }),
  chartRenderRequest: (id) => ({
    type: "CHART_RENDER_REQUEST_REQUEST",
    id
  }),
  chartRenderError: (error, id) => ({
    type: "CHART_RENDER_ERROR",
    id,
    error
  })
}))

describe("Chart Component", () => {
  /** @type {any} */
  let chartInstance = null
  /** @type {{unmount: () => void, rerender: (ui: React.ReactElement) => void}} */
  let renderApi = { unmount: () => {}, rerender: () => {} }

  // chart methods
  let updateChart = null
  let createChart = null
  let addListeners = null

  // dc chart api methods
  let on = null
  let dcRender = null
  let dcRenderAsync = null
  let filters = null
  let resetSvg = null
  let filterAll = null
  let destroyChart = null
  // eslint-disable-next-line no-underscore-dangle
  let _anchorName = null
  let anchorName = null
  let binParams = null

  const chart = {
    color: {},
    measures: [{}],
    dimensions: [
      { value: "test", isBinned: true },
      { value: "test", isBinned: true, timeBin: "auto" },
      { value: "test" }
    ],
    filters: [],
    areFiltersInverse: false,
    autoSize: true,
    cap: 0,
    elasticX: false
  }

  const props = {
    id: "1",
    chart,
    crossfilter: {},
    allChartsInitialized: true,
    hasError: false,
    elasticX: false,
    areFiltersInverse: false
  }

  const listener = () => {}

  beforeEach(() => {
    props.dispatch = jest.fn().mockImplementation((actionOrThunk) => {
      if (typeof actionOrThunk === "function") {
        return actionOrThunk(props.dispatch, () => mockAppState)
      } else {
        return actionOrThunk
      }
    })

    on = jest.fn()
    dcRender = jest.fn()
    dcRenderAsync = jest.fn()
    filters = jest.fn()
    resetSvg = jest.fn()
    filterAll = jest.fn()
    binParams = jest.fn()
    destroyChart = jest.fn()
    _anchorName = () => {}
    anchorName = () => {}

    createChart = jest.fn(
      () =>
        new Promise((resolve) =>
          resolve({
            on,
            binParams,
            render: dcRender,
            renderAsync: dcRenderAsync,
            filters,
            resetSvg,
            filterAll,
            destroyChart,
            _anchorName,
            anchorName
          })
        )
    )
    updateChart = jest.fn()
    addListeners = jest.fn(() => listener)

    const Chart = createChartComponent(
      () => createChart,
      () => updateChart,
      addListeners
    )

    class SpiedChart extends Chart {
      createAndRenderChart = jest.fn(this.createAndRenderChart)
      renderChart = jest.fn(this.renderChart)
      destroyChart = jest.fn(this.destroyChart)
      render = jest.fn(this.render.bind(this))
    }

    const ref = React.createRef()
    const { unmount, rerender } = render(<SpiedChart {...props} ref={ref} />)
    chartInstance = ref.current
    renderApi = { unmount, rerender }
  })

  describe("syncChartStateWithAppState", () => {
    it("should call setCustomDefaultOtherColorValue", async () => {
      chartInstance.syncChartStateWithAppState()
      await waitFor(() => {
        expect(props.dispatch).toHaveBeenCalled()
      })
      expect(props.dispatch).toHaveBeenCalledWith({
        type: ActionTypes.SET_CUSTOM_DEFAULT_OTHER_COLOR,
        chartId: "1",
        value: "Default",
        key: "defaultOtherDomain",
        noSave: true
      })
    })

    it("should call setCustomDefaultOtherColorValue (duplicate test)", async () => {
      chartInstance.syncChartStateWithAppState()
      await waitFor(() => {
        expect(props.dispatch).toHaveBeenCalled()
      })
      expect(props.dispatch).toHaveBeenCalledWith({
        type: ActionTypes.SET_CUSTOM_DEFAULT_OTHER_COLOR,
        chartId: "1",
        value: "Default",
        key: "defaultOtherDomain",
        noSave: true
      })
    })
  })

  describe("componentDidMount", () => {
    it("should call renderChart", async () => {
      await waitFor(() => {
        expect(chartInstance.createAndRenderChart).toHaveBeenCalled()
      })
    })

    it("should create a dcChart and render it", async () => {
      await waitFor(() => {
        expect(createChart).toHaveBeenCalled()
      })
    })

    it("should assign a value to its dcChart property", async () => {
      await waitFor(() => {
        expect(typeof chartInstance.dcChart).toEqual("object")
      })
    })

    it("should assign a create and update chart method", () => {
      expect(typeof chartInstance.createChart).toEqual("function")
      expect(typeof chartInstance.updateChart).toEqual("function")
    })

    it("should setup an addChartEventListeners method", () => {
      expect(addListeners).toHaveBeenCalled()
      expect(chartInstance.addChartEventListeners).toEqual(listener)
    })
  })

  describe("UNSAFE_componentWillReceiveProps", () => {
    it("should call renderChart when there is no dcChart", (done) => {
      chartInstance.dcChart = null
      chartInstance.UNSAFE_componentWillReceiveProps(props)
      chartInstance.UNSAFE_componentWillReceiveProps(
        Object.assign({}, props, {
          chart: Object.assign({}, props.chart, { type: "pie" })
        })
      )
      expect(chartInstance.createAndRenderChart).toHaveBeenCalledTimes(2)
      done()
    })

    it("should not call destroyChart when the diff includes dimensions and the values have not changed", async () => {
      const newProps = Object.assign({}, props, {
        chart: {
          dimensions: [
            { value: "test", isBinned: false },
            { value: "test", isBinned: true, timeBin: "auto" },
            { value: "test" }
          ]
        }
      })

      chartInstance.dcChart = {
        filterAll,
        binParams,
        resetSvg,
        destroyChart,
        on,
        anchorName
      }

      await chartInstance.UNSAFE_componentWillReceiveProps(newProps)

      expect(updateChart).toHaveBeenCalled()
      expect(chartInstance.render).toHaveBeenCalledTimes(1)
    })

    it("should call destroyChart hook when the diff includes dimensions and the values have changed", () => {
      const newProps = Object.assign({}, props, {
        chart: {
          dimensions: [{ value: "test" }, { value: "example" }],
          filters: []
        }
      })

      chartInstance.dcChart = {
        filterAll,
        binParams,
        resetSvg,
        destroyChart,
        on,
        anchorName
      }
      chartInstance.UNSAFE_componentWillReceiveProps(newProps)
      expect(updateChart).not.toHaveBeenCalled()
      expect(chartInstance.render).toHaveBeenCalledTimes(1)
    })

    it("should call destroyChart hook when number chart has changed measures", () => {
      chart.type = "number"
      const newProps = Object.assign({}, props, {
        chart: {
          measures: [{ value: "changed" }]
        }
      })

      chartInstance.dcChart = {
        filterAll,
        binParams,
        resetSvg,
        destroyChart,
        on,
        anchorName
      }
      chartInstance.UNSAFE_componentWillReceiveProps(newProps)
      expect(updateChart).not.toHaveBeenCalled()
      expect(chartInstance.render).toHaveBeenCalledTimes(1)
    })
  })

  describe("componentWillUnmount", () => {
    it("should destroy the chart", () => {
      chartInstance.dcChart = {
        filterAll,
        resetSvg,
        destroyChart,
        on,
        anchorName
      }
      renderApi.unmount()
      expect(destroyChart).toHaveBeenCalled()
    })
  })

  describe("shouldComponentUpdate", () => {
    it("should return false if shouldCallReactRender is false", () => {
      expect(chartInstance.shouldComponentUpdate()).toEqual(false)
    })

    it("should return true if and set shouldCallReactRender to false if it is true", () => {
      const component = chartInstance
      component.shouldCallReactRender = true
      expect(component.shouldComponentUpdate()).toEqual(true)
      expect(component.shouldCallReactRender).toEqual(false)
    })
  })

  describe("renderChart", () => {
    it("applies filters", () => {
      let filtersCalled = 1
      const tempChart = {
        filter: (val, isInverse) => {
          filtersCalled = filtersCalled * val * (isInverse ? -1 : 1)
        },
        renderAsync: () => new Promise((res) => res()),
        binParams: (a) => a
      }
      const chartSpec = {
        filters: [2, 3, 5],
        areFiltersInverse: false,
        dimensions: []
      }
      chartInstance.renderChart(chartSpec, 1)(tempChart)
      expect(filtersCalled).toEqual(30)
      chartInstance.dcChart = null
    })

    it("applies inverted filters", () => {
      let filtersCalled = 1
      const tempChart = {
        filter: (val, isInverse) => {
          filtersCalled = filtersCalled * val * (isInverse ? -1 : 1)
        },
        renderAsync: () => new Promise((res) => res()),
        binParams: (a) => a
      }
      const chartSpec = {
        filters: [2, 3, 5],
        areFiltersInverse: true,
        dimensions: []
      }
      chartInstance.renderChart(chartSpec, 1)(tempChart)
      expect(filtersCalled).toEqual(-30)
      chartInstance.dcChart = null
    })

    it("should dispatch chart render success when charts are not initialized", () => {
      let filtersCalled = 1
      const tempChart = {
        filter: (val, isInverse) => {
          filtersCalled = filtersCalled * val * (isInverse ? -1 : 1)
        },
        renderAsync: jest.fn(() => new Promise((res) => res())),
        binParams: (a) => a
      }
      const chartSpec = {
        filters: [2, 3, 5],
        areFiltersInverse: false,
        dimensions: []
      }
      chartInstance.props = Object.assign({}, chartInstance.props, {
        allChartsInitialized: false
      })
      chartInstance.renderChart(chartSpec, 1)(tempChart)
      expect(props.dispatch).toHaveBeenCalledWith({
        type: renderSuccessActionType,
        id: "1"
      })
      expect(tempChart.renderAsync).not.toHaveBeenCalled()
      chartInstance.dcChart = null
    })

    it("should call renderAsync when charts have been initialized", () => {
      let filtersCalled = 1
      const tempChart = {
        filter: (val, isInverse) => {
          filtersCalled = filtersCalled * val * (isInverse ? -1 : 1)
        },
        renderAsync: jest.fn(() => new Promise((res) => res())),
        binParams: (a) => a
      }
      const chartSpec = {
        filters: [2, 3, 5],
        areFiltersInverse: false,
        dimensions: []
      }
      chartInstance.renderChart(chartSpec, 1)(tempChart)
      expect(tempChart.renderAsync).toHaveBeenCalled()
      chartInstance.dcChart = null
    })
  })
})
