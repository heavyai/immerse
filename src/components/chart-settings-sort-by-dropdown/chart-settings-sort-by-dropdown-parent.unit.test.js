// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapStateToProps } from "./chart-settings-sort-by-dropdown-parent"

describe("Chart settings sort by dropdown", () => {
  describe("mapStateToProps", () => {
    const state = {
      charts: {
        1: {
          type: "",
          dimensions: [],
          measures: [],
          hasError: "sort",
          sortColumn: {
            col: {
              name: "val"
            },
            index: 0,
            order: "asc"
          }
        }
      }
    }

    it("should return correct error prop if there is an error in chart", () => {
      const props = mapStateToProps(state, { chartId: "1" })
      expect(props.error).toEqual(true)
    })

    it("should return currentSortValue", () => {
      const props = mapStateToProps(state, { chartId: "1" })
      expect(props.currentSortValue).toStrictEqual(state.charts["1"].sortColumn)
    })

    it("should return currentOrderingValue", () => {
      const props = mapStateToProps(state, { chartId: "1" })
      expect(props.currentOrderingValue).toStrictEqual(
        state.charts["1"].sortColumn.order
      )
    })
  })
})
