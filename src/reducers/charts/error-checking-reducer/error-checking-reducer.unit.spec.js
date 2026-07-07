// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import errorCheckingReducer from "./error-checking-reducer"

describe("errorCheckingReducer Reducer", () => {
  it("should return the state for the CLEAR_CHART action-type", () => {
    const initialState = {
      [1]: {
        type: "pie",
        measures: [{ name: "val" }, { name: "color" }],
        dimensions: [{}],
        hasError: null
      }
    }

    let action = {
      type: "CLEAR_CHARTS"
    }

    let nextState = errorCheckingReducer(initialState, action, initialState)
    let nextChart = nextState["1"]

    expect(nextChart.hasError).to.deep.equal(null)
  })

  it("it should update the state with the hasError flag set to true if there are missing or incorrect selectors", () => {
    const initialState = {
      [1]: {
        hasError: false,
        type: "pie",
        measures: [
          { name: "val", isRequired: true },
          { name: "color", isRequired: true }
        ],
        dimensions: [{}],
        hasError: null
      }
    }

    let action = {
      chartType: "pie",
      chartId: "1"
    }

    let nextState = errorCheckingReducer(initialState, action, initialState)
    let nextChart = nextState["1"]

    expect(nextChart.hasError).to.eql(true)
  })

  it("it should return the state if there are no missing requirements", () => {
    const initialState = {
      [1]: {
        hasError: false,
        type: "pie",
        dimensions: [{ value: "arr" }],
        measures: [
          { name: "val", value: "dest", isRequired: true },
          { name: "color", value: "time", isRequired: true }
        ],
        hasError: null
      }
    }

    let action = {
      type: "pie",
      chartId: "1"
    }

    let nextState = errorCheckingReducer(initialState, action, initialState)
    let nextChart = nextState["1"]

    expect(nextChart.hasError).to.deep.equal(false)
  })

  it("it should update the hasError state to be null if there is no chart type", () => {
    const initialState = {
      [1]: {
        type: undefined,
        measures: [{ name: "val" }, { name: "color" }],
        dimensions: [{}],
        hasError: null
      }
    }

    let action = {
      type: undefined,
      chartId: "1"
    }

    let nextState = errorCheckingReducer(initialState, action, initialState)
    let nextChart = nextState["1"]

    expect(nextChart.hasError).to.deep.equal(null)
  })

  it("it should return state if there is chart", () => {
    const initialState = {}

    let action = {
      type: "DELETE_CHART",
      chartId: "1"
    }

    let nextState = errorCheckingReducer(initialState, action, initialState)

    expect(nextState).to.deep.equal(initialState)
  })

  it("should update the hasError if there is no error but previously there was", () => {
    const initialState = {
      [1]: {
        type: "pie",
        measures: [
          { name: "val", value: "time", isRequired: true },
          { name: "color", value: "dest", isRequired: true }
        ],
        dimensions: [{ value: "All" }],
        hasError: true
      }
    }

    let action = {
      chartType: "pie",
      chartId: "1"
    }

    let nextState = errorCheckingReducer(initialState, action, initialState)
    let nextChart = nextState["1"]

    expect(nextChart.hasError).to.eql(false)
  })
})
