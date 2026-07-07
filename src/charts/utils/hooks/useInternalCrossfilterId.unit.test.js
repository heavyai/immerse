// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useInternalCrossfilterId } from "./useInternalCrossfilterId"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  filterZones: {
    100: { id: 100, name: "Filter Set A", selected: true },
    200: { id: 200, name: "Filter Set B", select: false }
  }
}

/* eslint-disable react/display-name */

describe("useInternalCrossfilterId test suite", () => {
  it("can useInternalCrossfilterId w/o name, using generated internal id", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useInternalCrossfilterId({ chartId: 1 }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual("1/crossfilter/100")
  })

  it("can useInternalCrossfilterId w/name, using generated internal id", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () => useInternalCrossfilterId({ chartId: 1, name: "foo" }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual("1/foo/100")
  })

  it("can useInternalCrossfilterId w/o name, w/o generated internal id", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () =>
        useInternalCrossfilterId({ chartId: 1, useGeneratedInternalId: false }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual("crossfilter")
  })

  it("can useInternalCrossfilterId w/name, w/o generated internal id", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(
      () =>
        useInternalCrossfilterId({
          chartId: 1,
          name: "someCrossFilterID",
          useGeneratedInternalId: false
        }),
      {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      }
    )

    expect(result.current).toEqual("someCrossFilterID")
  })
})
