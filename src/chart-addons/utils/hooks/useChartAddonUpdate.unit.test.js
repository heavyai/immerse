// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import {
  useChartAddonUpdate,
  useChartAddonSingleUpdate
} from "./useChartAddonUpdate"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const TEST_FIELD = "testField"

const mockState = {
  chartAddons: { 1: { [TEST_FIELD]: true } }
}

/* eslint-disable react/display-name */

describe("useChartAddonUpdate test suite", () => {
  it("can useChartAddonUpdate", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useChartAddonUpdate(1), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const updates = { a: "b", c: "7" }

    result.current(updates)

    const actions = store.getActions()

    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe("UPDATE_CHART_ADDON")
    expect(actions[0].payload).toEqual({ id: 1, updates })
  })

  it("can useChartAddonSingleUpdate", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useChartAddonSingleUpdate(1, TEST_FIELD),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    result.current("7")

    const actions = store.getActions()

    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe("UPDATE_CHART_ADDON")
    expect(actions[0].payload).toEqual({
      id: 1,
      updates: { [TEST_FIELD]: "7" }
    })
  })

  it("can useChartAddonSingleUpdate w/processor", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useChartAddonSingleUpdate(1, TEST_FIELD, (v) => Number(v)),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    result.current("7")

    const actions = store.getActions()

    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe("UPDATE_CHART_ADDON")
    expect(actions[0].payload).toEqual({ id: 1, updates: { [TEST_FIELD]: 7 } })
  })
})
