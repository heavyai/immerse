// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapStateToProps } from "components/autosuggest/with-autosuggest-state"

describe("WithAutosuggestState", () => {
  describe("mapStateToProps", () => {
    it("defaults to empty object", () => {
      expect(mapStateToProps({ autosuggest: {} })).toStrictEqual({
        autosuggestedOptions: {}
      })
    })

    it("provides autosuggestedOptions if present", () => {
      const results = {}
      expect(
        mapStateToProps({ autosuggest: { results } }).autosuggestedOptions
      ).toEqual(results)
    })
  })
})
