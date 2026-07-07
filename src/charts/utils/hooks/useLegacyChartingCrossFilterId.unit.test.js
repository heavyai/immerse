// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useLegacyChartingCrossFilterId } from "./useLegacyChartingCrossFilterId"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  omnifilters: [
    {
      name: "test-filter-1",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: true
    },
    {
      name: "test-filter-2",
      chartId: "1",
      appliesTo: "CROSSFILTER",
      enabled: false
    },
    { name: "test-filter-3", chartId: "1", appliesTo: "CHART", enable: true }
  ]
}

/* eslint-disable react/display-name */

describe("useLegacyChartingCrossFilterId test suite", () => {
  it("can useLegacyChartingCrossFilterId that is", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useLegacyChartingCrossFilterId("1"), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual("test-filter-1")
  })

  it("can useLegacyChartingCrossFilterId that is not", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useLegacyChartingCrossFilterId("test-filter-2"),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual(undefined)
  })
})
