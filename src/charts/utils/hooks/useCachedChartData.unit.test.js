// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useCachedChartData } from "./useCachedChartData"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  chartData: { 1: { able: "able data", baker: "baker data" } }
}

/* eslint-disable react/display-name */

describe("useCachedChartData test suite", () => {
  it("can useCachedChartData", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useCachedChartData({ chartId: 1, token: "able" }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual(mockState.chartData[1].able)
  })

  it("can useCachedChartData w/o chartId for undefined", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useCachedChartData(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(undefined)
  })

  it("can useCachedChartData w/o token for undefined", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useCachedChartData({ chartId: 1 }), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(undefined)
  })
})
