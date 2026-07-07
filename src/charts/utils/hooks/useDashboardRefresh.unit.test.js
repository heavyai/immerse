// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useDashboardRefresh } from "./useDashboardRefresh"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  dashboard: { streaming: { last_request: 100 } }
}

/* eslint-disable react/display-name */

describe("useDashboardRefresh test suite", () => {
  it("can useDashboardRefresh", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useDashboardRefresh(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.dashboard.streaming.last_request)
  })
})
