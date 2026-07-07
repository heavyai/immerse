// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useLegacyFilters } from "./useLegacyFilters"

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
        dataExpression: "x",
        filterType: "SIMPLE",
        dataType: "STR",
        dataTypeIsArray: false,
        operator: "=",
        value: "v1"
      },
      chartFilters: ["v1"]
    },
    {
      name: "test-filter-0",
      chartId: "1",
      layerId: "a",
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
      },
      chartFilters: ["v2"]
    },
    {
      name: "test-filter-0",
      chartId: "1",
      layerId: "b",
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
      },
      chartFilters: ["v3"]
    }
  ]
}

/* eslint-disable react/display-name */

describe("useLegacyFilters test suite", () => {
  it("can useLegacyFilters", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useLegacyFilters({ chartId: "1" }), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(["v1"])
  })
  it("can useLegacyFilters w/layerId", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useLegacyFilters({ chartId: "1", layerId: "a" }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual(["v2"])
  })
})
