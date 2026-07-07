// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import useChartsCount from "./useChartsCount"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  charts: {
    "1": { id: "1" },
    "2": { id: "2" },
    "3": { id: "3" },
    "count-1": { id: "count-1" },
    "count-2": { id: "count-2" }
  }
}

/* eslint-disable react/display-name */

describe("useChartsCount test suite", () => {
  it("can useChartsCount", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useChartsCount(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toBe(3)
  })
})
