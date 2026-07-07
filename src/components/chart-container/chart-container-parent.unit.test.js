// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapStateToProps } from "components/chart-container/chart-container-parent"
import { createCrossfilterService } from "services/crossfilter"
import { routeToChartEditor } from "utils/routerPath"

const CHART_ID = 1

const chartState = {
  [CHART_ID]: {
    dataSource: "flights",
    measures: [],
    dimensions: []
  }
}

const connectionState = {
  geoJsonConfig: "GEO_JSON_CONFIG"
}

const routingState = {
  locationBeforeTransitions: {
    pathname: ""
  }
}

const dcState = {
  initialRender: {
    done: false
  },
  redraw: {
    error: null,
    id: null
  },
  render: {
    error: null,
    id: null
  }
}

function createChartState(chart) {
  return {
    [CHART_ID]: {
      ...chart
    }
  }
}

function getState(state) {
  return {
    connection: connectionState,
    charts: chartState,
    routing: routingState,
    router: {
      location: {
        pathname: ""
      }
    },
    chartEditor: {},
    dc: dcState,
    dashboard: {
      id: 1,
      selectedTabId: "1"
    },
    ...state
  }
}

const manager = createCrossfilterService()
manager.setCrossfilter("flights", { cloneWithChartId: () => ({}) })
const services = new Map()
services.set("crossfilter", manager)

function getProps(props = {}) {
  return {
    cid: CHART_ID,
    MapD: services,
    ...props
  }
}

describe("Chart Container Parent", () => {
  describe("mapStateToProps", () => {
    describe("areSelectorsLoading", () => {
      it("should return false if there are no selectors loading", () => {
        const chart = {
          dataSource: "flights",
          measures: [{ loading: false }],
          dimensions: [{ loading: false }]
        }
        const props = mapStateToProps(getState(), getProps({ chart }))
        expect(props.areSelectorsLoading).toEqual(false)
      })

      it("should return true if there are ARE selectors loading", () => {
        const chart = {
          dataSource: "flights",
          measures: [{ loading: true }],
          dimensions: [{ loading: false }]
        }
        const props = mapStateToProps(getState(), getProps({ chart }))
        expect(props.areSelectorsLoading).toEqual(true)
      })
    })

    describe("chartSpec", () => {
      it("should add geoMetaData if chart is Choropleth", () => {
        const chart = {
          type: "choropleth",
          dataSource: "flights",
          measures: [],
          dimensions: []
        }
        const props = mapStateToProps(getState(), getProps({ chart }))
        expect(props.chartSpec.geoJsonConfig).toEqual("GEO_JSON_CONFIG")
      })

      it("should filter out unsable selectors", () => {
        const chart = {
          type: "pie",
          dataSource: "flights",
          measures: [
            { value: "test" },
            { value: "test", isError: true },
            { value: "test", inactive: true },
            { value: "test", loading: true }
          ],
          dimensions: [
            { value: "test" },
            { value: "test", isError: true },
            { value: "test", inactive: true },
            { value: "test", loading: true }
          ]
        }
        const props = mapStateToProps(getState(), getProps({ chart }))
        expect(props.chartSpec.measures).toStrictEqual([{ value: "test" }])
        expect(props.chartSpec.dimensions).toStrictEqual([{ value: "test" }])
      })
    })

    describe("hasError", () => {
      it("should be true if chart has error", () => {
        const chart = {
          hasError: true,
          dataSource: "flights",
          measures: [],
          dimensions: []
        }
        const props = mapStateToProps(getState(), getProps({ chart }))
        expect(props.hasError).toEqual(true)
      })

      it("should be true if there is a dc error and in chart editor", () => {
        const chart = {
          hasError: false,
          dataSource: "flights",
          measures: [],
          dimensions: []
        }

        expect(
          mapStateToProps(
            getState({
              dc: Object.assign({}, dcState, {
                redraw: {
                  error: true,
                  id: CHART_ID
                }
              }),
              router: {
                location: {
                  pathname: routeToChartEditor("mapd", 1, 1)
                }
              }
            }),
            getProps({ chart })
          ).hasError
        ).toEqual(true)

        expect(
          mapStateToProps(
            getState({
              dc: Object.assign({}, dcState, {
                render: {
                  error: true,
                  id: CHART_ID
                }
              }),
              router: {
                location: {
                  pathname: routeToChartEditor("mapd", 1, 1)
                }
              }
            }),
            getProps({ chart })
          ).hasError
        ).toEqual(true)

        expect(
          mapStateToProps(
            getState({
              dc: Object.assign({}, dcState, {
                redraw: {
                  error: true,
                  id: CHART_ID
                }
              })
            }),
            getProps({ chart })
          ).hasError
        ).toEqual(false)

        expect(
          mapStateToProps(
            getState({
              dc: Object.assign({}, dcState, {
                render: {
                  error: true,
                  id: "2"
                }
              }),
              router: {
                location: {
                  pathname: routeToChartEditor("mapd", 1, 1)
                }
              }
            }),
            getProps({ chart })
          ).hasError
        ).toEqual(false)

        expect(
          mapStateToProps(
            getState({
              charts: createChartState(chart),
              dc: Object.assign({}, dcState, {
                redraw: {
                  error: true,
                  id: "2"
                }
              }),
              router: {
                location: {
                  pathname: routeToChartEditor("mapd", 1, 1)
                }
              }
            }),
            getProps({ chart })
          ).hasError
        ).toEqual(false)
      })
    })
  })
})
