// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { REMOVE_DASHBOARD_TAB } from "constants/action-types"
import reducer, { INITIAL } from "./parameter-usage"
import { paramState, mockVariables } from "../parameter-mock-store"

import {
  NOTE_PARAMETER_USAGE,
  CLEAR_PARAMETER_USAGE,
  REMOVE_CHART_FROM_PARAMETER_USAGE
} from "../constants"

const initialState = paramState.parameters.usage

const {
  sampleName,
  otherName,
  someToken,
  selectedTabId,
  otherTabId
} = mockVariables

describe("parameter-usage reducer test suite", () => {
  it("can CLEAR_PARAMETER_USAGE", () => {
    const newState = reducer(initialState, { type: CLEAR_PARAMETER_USAGE })
    expect(newState).toEqual(INITIAL)
  })
  it("can NOTE_PARAMETER_USAGE and add chart", () => {
    const testUsage = {
      chartId: "7",
      tabId: selectedTabId,
      token: someToken,
      parameters: [sampleName]
    }
    const newState = reducer(initialState, {
      type: NOTE_PARAMETER_USAGE,
      payload: testUsage
    })

    expect(newState[selectedTabId][sampleName][testUsage.token]).toEqual([
      "1",
      "2-Lx",
      "3",
      "7"
    ])
  })

  it("can NOTE_PARAMETER_USAGE and remove parameter", () => {
    const testUsage = {
      chartId: "1",
      tabId: selectedTabId,
      token: someToken,
      parameters: []
    }
    const newState = reducer(initialState, {
      type: NOTE_PARAMETER_USAGE,
      payload: testUsage
    })

    expect(newState[selectedTabId][sampleName][testUsage.token]).toEqual([
      "2-Lx",
      "3"
    ])
  })

  it("can REMOVE_DASHBOARD_TAB", () => {
    const newState = reducer(initialState, {
      type: REMOVE_DASHBOARD_TAB,
      tabId: selectedTabId
    })

    expect(newState).toEqual({ [otherTabId]: initialState[otherTabId] })
  })

  it("can REMOVE_CHART_FROM_PARAMETER_USAGE", () => {
    const newState = reducer(initialState, {
      type: REMOVE_CHART_FROM_PARAMETER_USAGE,
      payload: { tabId: selectedTabId, chartId: "1" }
    })

    expect(newState[selectedTabId][sampleName][someToken]).toEqual([
      "2-Lx",
      "3"
    ])
    expect(newState[selectedTabId][otherName][someToken]).toEqual(["3"])
  })
})
