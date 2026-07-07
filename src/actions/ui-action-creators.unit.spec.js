// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"

import {
  HIDE_CLEAR_FILTERS_DROPDOWN,
  SHOW_CLEAR_FILTERS_DROPDOWN,
  SET_SELECTOR_POSITION
} from "constants/action-types"

import {
  hideClearFiltersDropDown,
  showClearFiltersDropDown,
  setSelectorPosition
} from "actions/ui-action-creators"

describe("UI Action Creators", () => {
  describe("hideClearFiltersDropDown", () => {
    it("should return the HIDE_CLEAR_FILTERS_DROPDOWN action type", () => {
      expect(hideClearFiltersDropDown().type).to.eql(
        HIDE_CLEAR_FILTERS_DROPDOWN
      )
    })
  })

  describe("showClearFiltersDropDown", () => {
    it("should return the SHOW_CLEAR_FILTERS_DROPDOWN action type", () => {
      expect(showClearFiltersDropDown().type).to.eql(
        SHOW_CLEAR_FILTERS_DROPDOWN
      )
    })
  })

  describe("setSelectorPosition", () => {
    it("should return the SET_SELECTOR_POSITION action type", () => {
      const selectorType = "measures"
      const index = 3
      const position = 50
      expect(setSelectorPosition(selectorType, index, position)).to.deep.equal({
        type: SET_SELECTOR_POSITION,
        selectorType,
        index,
        position
      })
    })
  })
})
