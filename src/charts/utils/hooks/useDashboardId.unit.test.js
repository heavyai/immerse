// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useDashboardId } from "./useDashboardId"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  dashboard: { id: "someDashboardId" }
}

/* eslint-disable react/display-name */

describe("useDashboardId test suite", () => {
  it("can useDashboardId", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useDashboardId(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.dashboard.id)
  })
})
