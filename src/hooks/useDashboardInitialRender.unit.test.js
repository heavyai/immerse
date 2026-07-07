// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import {
  useDashboardInitialRender,
  useDashboardInitialRenderDone,
  useDashboardInitialRenderPending,
  useDashboardInitialRenderError
} from "./useDashboardInitialRender"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  dc: {
    initialRender: { done: "isDone", pending: "isPending", error: "isError" }
  }
}

/* eslint-disable react/display-name */

describe("useDashboardInitialRender test suite", () => {
  it("can useDashboardInitialRender", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useDashboardInitialRender(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.dc.initialRender)
  })

  it("can useDashboardInitialRenderDone", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useDashboardInitialRenderDone(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.dc.initialRender.done)
  })

  it("can useDashboardInitialRenderPending", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useDashboardInitialRenderPending(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.dc.initialRender.pending)
  })

  it("can useDashboardInitialRenderError", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useDashboardInitialRenderError(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.dc.initialRender.error)
  })
})
