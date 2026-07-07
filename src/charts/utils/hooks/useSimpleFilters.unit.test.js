// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useSimpleFilters } from "./useSimpleFilters"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  charts: { "1": { id: "1", dataSource: "table-1" } },
  filterZones: { z1: { id: "z1", selected: true } },
  omnifilters: [
    {
      name: "1/crossfilter/z1",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      }
    },
    {
      name: "1/crossfilter/z2",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v2"
      }
    },
    {
      name: "1/cf-2/z1",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        filterType: "AND",
        filters: [
          {
            dataSource: "table-1",
            dataExpression: "x",
            filterType: "SIMPLE",
            dataType: "STR",
            dataTypeIsArray: false,
            operator: "=",
            value: "v2"
          },
          {
            dataSource: "table-1",
            dataExpression: "y",
            filterType: "SIMPLE",
            dataType: "STR",
            dataTypeIsArray: false,
            operator: "=",
            value: "v3"
          }
        ]
      }
    },
    {
      name: "internal-crossfilter",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true,
      dataSources: ["table-1"],
      filter: {
        dataSource: "table-1",
        dataExpression: "z",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v3"
      }
    }
  ]
}

/* eslint-disable react/display-name */

describe("useSimpleFilters test suite", () => {
  it("can useSimpleFilters", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useSimpleFilters({ chartId: "1" }), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toBe("v1")
  })

  it("can useSimpleFilters w/name", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useSimpleFilters({ chartId: "1", name: "cf-2" }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual({ AND: ["v2", "v3"] })
  })

  it("can useSimpleFilters w/o useGeneratedInternalId", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () =>
        useSimpleFilters({
          chartId: "1",
          name: "internal-crossfilter",
          useGeneratedInternalId: false
        }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toBe("v3")
  })
})
