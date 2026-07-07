// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useChartFilterString } from "./useChartFilterString"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  charts: { "1": { id: "1", dataSource: "table-1" } },
  omnifilters: [
    {
      name: "test-filter-0",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      }
    },
    {
      name: "test-filter-1",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      }
    },
    {
      name: "test-filter-2",
      chartId: "2",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      },
      layerId: "layer-1"
    },
    {
      name: "test-filter-3",
      chartId: "2",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      },
      layerId: "layer-2"
    },
    {
      name: "test-filter-4",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-2"],
      filter: {
        dataSource: "table-2",
        table: "table-2",
        dataExpression: "y",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v2"
      }
    },
    {
      name: "test-filter-5",
      chartId: "2",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-2"],
      filter: {
        dataSource: "table-2",
        table: "table-2",
        dataExpression: "y",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v2"
      }
    },
    {
      name: "test-filter-6",
      chartId: "1",
      appliesTo: "CHART",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      }
    },
    {
      name: "test-filter-7",
      appliesTo: "GLOBAL",
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      },
      enabled: true
    },
    {
      name: "test-filter-8",
      appliesTo: "GLOBAL",
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      },
      enabled: true
    },
    {
      name: "test-filter-9",
      appliesTo: "GLOBAL",
      dataSources: ["table-2"],
      filter: {
        dataSource: "table-2",
        table: "table-2",
        dataExpression: "y",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v2"
      },
      enabled: true
    },
    {
      name: "test-filter-10",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: false,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        table: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      }
    },
    {
      name: "test-filter-11",
      appliesTo: "GLOBAL",
      dataSources: ["table-2"],
      filter: {
        dataSource: "table-2",
        table: "table-2",
        dataExpression: "y",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v2"
      },
      enabled: false
    }
  ]
}

/* eslint-disable react/display-name */

describe("useChartFilterString test suite", () => {
  it("can useChartFilterString", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useChartFilterString({ chartId: "1" }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toBe(
      "x = 'v1' AND x = 'v1' AND x = 'v1' AND x = 'v1' AND x = 'v1'"
    )
  })

  it("can useChartFilterString w/table", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useChartFilterString({ chartId: "1", table: "table-1" }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toBe(
      "x = 'v1' AND x = 'v1' AND x = 'v1' AND x = 'v1' AND x = 'v1'"
    )
  })

  it("can useChartFilterString on other table", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useChartFilterString({ chartId: "1", table: "table-2" }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toBe("y = 'v2' AND y = 'v2'")
  })

  it("can useChartFilterString on other chart", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useChartFilterString({ chartId: "2", table: "table-2" }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toBe("y = 'v2' AND y = 'v2'")
  })
})
