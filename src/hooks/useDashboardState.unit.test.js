// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import useDashboardState from "./useDashboardState"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  dashboard: { id: "somedashboard-id", other: "test-data" }
}

/* eslint-disable react/display-name */

describe("useDashboardState test suite", () => {
  it("can useDashboardState", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useDashboardState(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toBe(mockState.dashboard)
  })
})
