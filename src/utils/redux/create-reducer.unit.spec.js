// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import createReducer from "./create-reducer"

describe("createReducer", () => {
  const initialState = []

  const reducers = {
    ["UPDATE"](state, action) {
      state[action.index] = action.value
      return state
    },
    ["CREATE"](state, action) {
      return state.concat([action])
    },
    ["TRIGGER_FINAL"](state, action) {
      return state
    }
  }

  const finalReducer = (state, action) => {
    if (action.type === "TRIGGER_FINAL") {
      return state.concat(["BAM"])
    }

    return state
  }

  const reducer = createReducer(reducers, initialState, finalReducer)

  it("should return a reducer function that takes state and action", () => {
    const create = { type: "CREATE" }
    const update = { type: "UPDATE", index: 1, value: 6 }
    const unknown = { type: "UNKOWN" }

    expect(reducer([], create)).to.deep.equal([create])
    expect(reducer([1, 2, 3], update)).to.deep.equal([1, 6, 3])
    expect(reducer([1], unknown)).to.deep.equal([1])
  })

  it("should accept a finalReducer as its last argument and apply it to the next state", () => {
    expect(reducer([], { type: "TRIGGER_FINAL" })).to.deep.equal(["BAM"])
  })
})
