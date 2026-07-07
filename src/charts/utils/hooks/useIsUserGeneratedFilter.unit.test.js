// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useIsUserGeneratedFilter } from "./useIsUserGeneratedFilter"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  omnifilters: [
    { name: "test-filter-1", userGenerated: true },
    { name: "test-filter-2", userGenerated: false }
  ]
}

/* eslint-disable react/display-name */

describe("useIsUserGeneratedFilter test suite", () => {
  it("can useIsUserGeneratedFilter that is", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useIsUserGeneratedFilter("test-filter-1"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual(true)
  })

  it("can useIsUserGeneratedFilter that is not", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useIsUserGeneratedFilter("test-filter-2"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual(false)
  })

  it("can useIsUserGeneratedFilter on non-existent filter", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useIsUserGeneratedFilter("test-filter-3"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual(false)
  })
})
