// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import updateSelectorReducer from "./update-selector-reducer"
import { updateSelector } from "actions/charts-action-creators"
import { setAggType } from "./helpers/measure-object-helpers"

chai.use(spies)

describe("updateSelectorReducer", () => {
  let action
  let dispatch
  let getState

  const state = {
    charts: {
      1: {
        type: "pie",
        measures: [{ aggType: "AVG" }, { aggType: "AVG" }],
        dimensions: []
      }
    }
  }

  beforeEach(() => {
    action = {}
    dispatch = sinon.spy(a => (action = a))
    getState = () => state
  })

  it("should set the measure with the key/value at the specific index", () => {
    const aggType = "MAX"
    const thunk = updateSelector("1", "measures", 1, setAggType(aggType))
    thunk(dispatch, getState)
    expect(dispatch).to.have.been.called
    const nextState = updateSelectorReducer(state.charts, action)
    expect(nextState[1].measures[1].aggType).to.eql(aggType)
  })
})
