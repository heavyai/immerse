// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useCurrentFilterSet } from "./useCurrentFilterSet"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  filterZones: {
    1: { id: 1, name: "Filter Set A", selected: true },
    2: { id: 2, name: "Filter Set B", select: false }
  }
}

/* eslint-disable react/display-name */

describe("useCurrentFilterSet test suite", () => {
  it("can useCurrentFilterSet", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useCurrentFilterSet(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.filterZones[1])
  })
})
