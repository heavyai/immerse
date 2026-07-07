// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"
import { useCurrentEditingChart } from "./useCurrentEditingChart"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe("useCurrentEditingChart", () => {
  let mockState

  beforeEach(() => {
    mockState = {
      charts: {
        1: { id: 1, name: "I'm a chart" }
      },
      chartEditor: {
        editId: 1
      }
    }
  })

  const renderWithProvider = () => {
    const store = mockStore(mockState)
    return renderHook(() => useCurrentEditingChart(), {
      // eslint-disable-next-line react/display-name
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })
  }

  it("should return chart matching editId if exists", () => {
    const { result } = renderWithProvider()

    expect(result.current).toEqual({
      chart: mockState.charts[1],
      chartId: 1
    })
  })

  it("should return undefined if editId is not in charts", () => {
    mockState.chartEditor.editId = 5
    const { result } = renderWithProvider()

    expect(result.current).toEqual({
      chart: undefined,
      chartId: 5
    })
  })
})
