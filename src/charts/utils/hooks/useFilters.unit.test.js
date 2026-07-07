// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import {
  useAllFilters,
  useEnabledFilters,
  useChartFilters,
  useDashboardFilters
} from "./useFilters"

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

describe("useFilters test suite", () => {
  it("can useAllFilters", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useAllFilters(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toBe(mockState.omnifilters)
  })

  it("can useEnabledFilters", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useEnabledFilters(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(
      mockState.omnifilters.filter((f) => f.enabled)
    )
  })

  it("can useChartFilters w/o table", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useChartFilters({ chartId: "1" }), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual([
      mockState.omnifilters[2], // same table, from different chart
      mockState.omnifilters[3], // same table, from different chart
      mockState.omnifilters[6] // chart specific filter
    ])
  })

  it("can useChartFilters w/table", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useChartFilters({ chartId: "1", table: "table-1" }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual([
      mockState.omnifilters[2], // same table, from different chart
      mockState.omnifilters[3], // same table, from different chart
      mockState.omnifilters[6] // chart specific filter
    ])
  })

  it("can useDashboardFilters", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useDashboardFilters({ table: "table-1" }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual([
      mockState.omnifilters[7],
      mockState.omnifilters[8]
    ])
  })

  it("can useDashboardFilters and exclude", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () =>
        useDashboardFilters({
          table: "table-1",
          excludeFilters: ["test-filter-7"]
        }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual([mockState.omnifilters[8]])
  })
})
