// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { StrictMode } from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook, act } from "@testing-library/react"

import { getQueryRuntime } from "services/query-runtime"
import { useCachedChartData } from "./useCachedChartData"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  chartData: { 1: { able: "able data", baker: "baker data" } }
}

/* eslint-disable react/display-name */

describe("useCachedChartData test suite", () => {
  it("can useCachedChartData", () => {
    const store = mockStore({})
    store.services = new Map()
    const runtime = getQueryRuntime(store.services)
    runtime.write(1, "able", "able data")
    runtime.write(1, "baker", "baker data")
    const { result } = renderHook(
      () => useCachedChartData({ chartId: 1, token: "able" }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual(mockState.chartData[1].able)
  })

  it("can useCachedChartData w/o chartId for undefined", () => {
    const store = mockStore({})
    store.services = new Map()
    const runtime = getQueryRuntime(store.services)
    runtime.write(1, "able", "able data")
    runtime.write(1, "baker", "baker data")
    const { result } = renderHook(() => useCachedChartData(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(undefined)
  })

  it("can useCachedChartData w/o token for undefined", () => {
    const store = mockStore({})
    store.services = new Map()
    const runtime = getQueryRuntime(store.services)
    runtime.write(1, "able", "able data")
    runtime.write(1, "baker", "baker data")
    const { result } = renderHook(() => useCachedChartData({ chartId: 1 }), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(undefined)
  })
})

it("keeps one subscription through strict effect replay and removes it on unmount", () => {
  const store = mockStore({})
  store.services = new Map()
  const runtime = getQueryRuntime(store.services)
  const subscribe = runtime.subscribe
  const active = new Set()
  runtime.subscribe = (listener) => {
    active.add(listener)
    const unsubscribe = subscribe(listener)
    return () => {
      active.delete(listener)
      unsubscribe()
    }
  }
  const { result, unmount } = renderHook(
    () => useCachedChartData({ chartId: 1, token: "rows" }),
    {
      wrapper: ({ children }) => (
        <StrictMode>
          <Provider store={store}>{children}</Provider>
        </StrictMode>
      )
    }
  )
  expect(active.size).toBe(1)
  act(() => {
    runtime.write(1, "rows", ["current"])
  })
  expect(result.current).toEqual(["current"])
  act(() => {
    runtime.invalidate()
  })
  expect(result.current).toBeUndefined()
  unmount()
  expect(active.size).toBe(0)
  runtime.dispose()
})
