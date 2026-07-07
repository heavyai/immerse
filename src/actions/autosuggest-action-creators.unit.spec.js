// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { populateAutosuggest } from "actions/autosuggest-action-creators"
import { expect } from "chai"

describe("autosuggestActionCreators", () => {
  describe("populateAutosuggest", () => {
    let state = {
      autosuggest: {
        loading: true
      }
    }
    const dispatch = () => ({})
    const getState = () => state

    it("should create a thunk", () => {
      expect(populateAutosuggest("foo", "bar")).to.be.a("function")
    })
  })
})
