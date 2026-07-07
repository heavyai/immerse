// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import {
  useDashboardDcRedrawAll,
  useDashboardDcRedrawAllDone,
  useDashboardDcRedrawAllPending,
  useDashboardDcRedrawAllError
} from "./useDashboardDcRedrawAll"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  dc: { redrawAll: { done: "isDone", pending: "isPending", error: "isError" } }
}

/* eslint-disable react/display-name */

describe("useDashboardRedrawAll test suite", () => {
  it("can useDashboardRedrawAll", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useDashboardDcRedrawAll(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.dc.redrawAll)
  })

  it("can useDashboardRedrawAllDone", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useDashboardDcRedrawAllDone(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.dc.redrawAll.done)
  })

  it("can useDashboardRedrawAllPending", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useDashboardDcRedrawAllPending(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.dc.redrawAll.pending)
  })

  it("can useDashboardRedrawAllError", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useDashboardDcRedrawAllError(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.dc.redrawAll.error)
  })
})
