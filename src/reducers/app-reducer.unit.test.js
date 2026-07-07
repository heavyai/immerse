// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as actions from "actions/app-action-creators"
import reducer, { initialState } from "./app-reducer"

describe("App Reducer", () => {
  it("should initialize the correct state", () => {
    expect(reducer(undefined, {})).toEqual(initialState)
  })
  it("should handle RESET_APP_ERROR action type", () => {
    expect(reducer({ error: true }, actions.resetAppError()).error).toEqual(
      false
    )
  })
  it("should handle SAVE_LAST_CHART_ACTION action type", () => {
    const action = { type: "UPDATE" }
    expect(
      reducer(initialState, actions.saveLastChartAction(action))
        .lastChartUpdateAction
    ).toEqual(action)
  })
  it("should handle SET_USER_AGENT action type", () => {
    expect(
      reducer(initialState, actions.setUserAgent("firefox")).isFirefox
    ).toEqual(true)
  })
})
