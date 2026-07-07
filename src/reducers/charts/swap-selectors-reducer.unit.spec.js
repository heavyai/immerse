// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import { swapSelectors } from "actions/selector-action-creators"
import swapSelectorsReducer from "./swap-selectors-reducer"

describe("SwapSelectors Reducer", () => {
  const state = {
    ["1"]: {
      measures: [
        { inactive: false, name: "col0", value: "arr" },
        { inactive: true, name: "col1", value: "dest" }
      ],
      dimensions: [
        { inactive: false, value: "carrier_name" },
        { inactive: false, value: "arrtime" },
        { inactive: false }
      ]
    }
  }

  const swapMeasures = swapSelectors("1", "measures")
  const nextState = swapSelectorsReducer(state, swapMeasures(0, 1))

  const measures = state["1"].measures
  const nextMeasures = nextState["1"].measures

  const swapDimensions = swapSelectors("1", "dimensions")

  const dimensions = state["1"].dimensions
  const nextNextState = swapSelectorsReducer(state, swapDimensions(0, 1))
  const nextDimensions = nextNextState["1"].dimensions

  it("should return new selectors with the hover and drag selectors swapped", () => {
    expect(nextMeasures.length).to.eql(2)
    expect(nextMeasures[0].value).to.eql(measures[1].value)
    expect(nextMeasures[1].value).to.eql(measures[0].value)

    expect(nextDimensions.length).to.eql(3)
    expect(nextDimensions[0].value).to.deep.equal(dimensions[1].value)
    expect(nextDimensions[0].inactive).to.deep.equal(dimensions[1].inactive)
    expect(nextDimensions[1].value).to.deep.equal(dimensions[0].value)
    expect(nextDimensions[1].inactive).to.deep.equal(dimensions[0].inactive)
  })

  it("should preserve the name and inactive state of the swapped selectors", () => {
    expect(nextMeasures[0].name).to.eql(measures[0].name)
    expect(nextMeasures[0].inactive).to.eql(measures[0].inactive)
    expect(nextMeasures[1].name).to.eql(measures[1].name)
    expect(nextMeasures[1].inactive).to.eql(measures[1].inactive)
  })
})
