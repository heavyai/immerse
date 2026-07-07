// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

import { renderHook } from "@testing-library/react-hooks"

import { useCrossLinks } from "./useCrossLinks"

import { Provider } from "react-redux"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

const mockState = {
  crosslinks: { A: { id: "A" }, B: { id: "B" }, C: { id: "C" } }
}

/* eslint-disable react/display-name */

describe("useCrossLinks test suite", () => {
  it("can useCrossLinks", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useCrossLinks(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toEqual(mockState.crosslinks)
  })
})
