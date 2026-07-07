// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useChartToggle } from "./useChartToggle"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const TEST_FIELD = "testField"

const mockState = {
  charts: { 1: { [TEST_FIELD]: true }, 2: { [TEST_FIELD]: false } }
}

/* eslint-disable react/display-name */

describe("useChartToggle test suite", () => {
  it("can useChartToggle to toggle off", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useChartToggle(1, TEST_FIELD), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    result.current()

    const actions = store.getActions()

    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe("UPDATE_CHART")
    expect(actions[0].chartId).toBe(1)
    expect(actions[0].payload).toEqual({ [TEST_FIELD]: false })
  })

  it("can useChartToggle to toggle on", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useChartToggle(2, TEST_FIELD), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    result.current()

    const actions = store.getActions()

    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe("UPDATE_CHART")
    expect(actions[0].chartId).toBe(2)
    expect(actions[0].payload).toEqual({ [TEST_FIELD]: true })
  })
})
