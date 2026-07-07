// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useChart } from "./useChart"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  charts: { 1: { name: "some chart" }, 2: { name: "other chart" } }
}

/* eslint-disable react/display-name */

describe("useChart test suite", () => {
  it("can useChart that exists", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useChart(1), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.charts[1])
  })

  it("can useChart that does not exist", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useChart(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toBeUndefined()
  })
})
