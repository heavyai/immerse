// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useChartUpdate, useChartUpdateFromEvent } from "./useChartUpdate"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const TEST_FIELD = "testField"

const mockState = {
  charts: { 1: { [TEST_FIELD]: true } }
}

/* eslint-disable react/display-name */

describe("useChartUpdate test suite", () => {
  it("can useChartUpdate", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useChartUpdate(1, TEST_FIELD), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    result.current("7")

    const actions = store.getActions()

    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe("UPDATE_CHART")
    expect(actions[0].chartId).toBe(1)
    expect(actions[0].payload).toEqual({ [TEST_FIELD]: "7" })
  })

  it("can useChartUpdate with processor", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useChartUpdate(1, TEST_FIELD, (v) => Number(v)),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    result.current("7")

    const actions = store.getActions()

    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe("UPDATE_CHART")
    expect(actions[0].chartId).toBe(1)
    expect(actions[0].payload).toEqual({ [TEST_FIELD]: 7 })
  })

  it("can useChartUpdateFromEvent", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useChartUpdateFromEvent(1, TEST_FIELD),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    result.current({ target: { value: "7" } })

    const actions = store.getActions()

    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe("UPDATE_CHART")
    expect(actions[0].chartId).toBe(1)
    expect(actions[0].payload).toEqual({ [TEST_FIELD]: "7" })
  })

  it("can useChartUpdateFromEvent with field", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useChartUpdateFromEvent(1, TEST_FIELD, "checked"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    result.current({ target: { checked: "7" } })

    const actions = store.getActions()

    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe("UPDATE_CHART")
    expect(actions[0].chartId).toBe(1)
    expect(actions[0].payload).toEqual({ [TEST_FIELD]: "7" })
  })

  it("can useChartUpdateFromEvent with field and processor", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useChartUpdateFromEvent(1, TEST_FIELD, "checked", (v) => Number(v)),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    result.current({ target: { checked: "7" } })

    const actions = store.getActions()

    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe("UPDATE_CHART")
    expect(actions[0].chartId).toBe(1)
    expect(actions[0].payload).toEqual({ [TEST_FIELD]: 7 })
  })
})
