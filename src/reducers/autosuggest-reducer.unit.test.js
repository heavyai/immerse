// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import reducer, { initialState } from "./autosuggest-reducer"

import { AUTOSUGGEST_SUCCESS } from "constants/action-types"

describe("Filter Autosuggest Reducer", () => {
  it("should be initialized correctly", () => {
    expect(reducer(undefined, {})).toEqual(initialState)
  })
  it("should handle AUTOSUGGEST_SUCCESS actions", () => {
    const expression = "at"
    const results = [{}, {}]
    const nextState = reducer(
      {
        error: false,
        loading: true,
        results: {}
      },
      {
        type: AUTOSUGGEST_SUCCESS,
        expression,
        results
      }
    )
    expect(nextState.loading).toEqual(false)
    expect(nextState.results[expression]).toEqual(results)
  })
})
