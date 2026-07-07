// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useChartAddon } from "./useChartAddon"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  chartAddons: {
    1: { name: "some chart addon" },
    2: { name: "other chart addon" }
  }
}

/* eslint-disable react/display-name */

describe("useChartAddon test suite", () => {
  it("can useChartAddon that exists", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useChartAddon(1), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.chartAddons[1])
  })

  it("can useChartAddon that does not exist", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useChartAddon(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toBeUndefined()
  })
})
