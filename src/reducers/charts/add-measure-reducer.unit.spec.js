// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"

import addMeasureReducer from "./add-measure-reducer"

describe("addMeasure Reducer", () => {
  let initialState
  beforeEach(() => {
    initialState = {
      ["1"]: {
        type: "pie",
        measures: [{}],
        dimensions: [{}],
        savedColors: {},
        color: {}
      }
    }
  })

  it("should add or update a measure at the selected index", () => {
    const action = {
      chartId: "1",
      index: 0,
      measure: {
        type: "SMALLINT",
        value: "*",
        label: "arrtime"
      }
    }

    const nextState = addMeasureReducer(initialState, action)

    const nextMeasures = [
      {
        type: "SMALLINT",
        value: "*",
        custom: false,
        label: "arrtime",
        aggType: "Count",
        originIndex: 0
      }
    ]

    expect(nextState["1"].measures).to.deep.equal(nextMeasures)
  })

  it("should set aggType Value to string as # Unique", () => {
    const action = {
      chartId: "1",
      index: 0,
      measure: {
        type: "STR",
        value: "*",
        label: "arrtime"
      }
    }

    const nextState = addMeasureReducer(initialState, action)

    const nextMeasures = [
      {
        type: "STR",
        value: "*",
        custom: false,
        label: "arrtime",
        aggType: "# Unique",
        originIndex: 0
      }
    ]

    expect(nextState["1"].measures).to.deep.equal(nextMeasures)
  })

  it("should set aggType Value to FLOAT as AGG", () => {
    const action = {
      chartId: "1",
      index: 0,
      measure: {
        type: "FLOAT",
        value: "bin",
        label: "arrtime"
      }
    }

    const nextState = addMeasureReducer(initialState, action)

    const nextMeasures = [
      {
        type: "FLOAT",
        value: "bin",
        custom: false,
        label: "arrtime",
        aggType: "Avg",
        originIndex: 0
      }
    ]

    expect(nextState["1"].measures).to.deep.equal(nextMeasures)
  })

  it("should not add an extra empty measure if the last measure is already empty", () => {
    initialState[1].type = "table"
    initialState[1].measures = [
      { name: "col0", value: "lol" },
      { name: "col1", value: "lol" },
      { name: "col2" }
    ]

    const action = {
      chartId: "1",
      index: 1,
      measure: {
        type: "FLOAT",
        value: "*",
        label: "arrtime"
      }
    }

    const nextState = addMeasureReducer(initialState, action)
    expect(nextState["1"].measures.length).to.eql(3)
  })

  it("sets up a custom color measure if categories are present", () => {
    const action = {
      chartId: "1",
      index: 0,
      measure: {
        name: "color",
        value: "countries",
        categories: ["Default", "US", "CA", "BR"]
      }
    }
    const nextState = addMeasureReducer(initialState, action)
    expect(nextState["1"].measures[0]).to.deep.equal({
      aggType: "Avg",
      categories: ["Default", "US", "CA", "BR"],
      custom: false,
      name: "color",
      originIndex: 0,
      value: "countries"
    })
  })
})
