// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
} from "./bar-line-toggle-parent"

describe("BarLineToggleParent", () => {
  const dispatch = () => {}
  let state = null
  let props = null
  let mergedProps = null

  beforeEach(() => {
    state = {
      charts: {
        1: {
          dataSource: "trees",
          type: "line2",
          dimensions: [{}],
          measures: [
            { name: "y axis" },
            { name: "y axis" },
            { name: "y axis" }
          ],
          markTypes: ["line", "bar"]
        }
      }
    }
    props = {
      chartId: "1",
      measureIndex: 0
    }
    mergedProps = mergeProps(
      mapStateToProps(state, props),
      mapDispatchToProps(dispatch),
      props
    )
  })

  describe("mapStateToProps", () => {
    it("should return the markType for the current measure when one exists", () => {
      const expected = { markType: "line" }
      expect(mapStateToProps(state, props)).toStrictEqual(expected)
    })

    it("should return `null` for the current measure when it doesn't exist", () => {
      props.measureIndex = 2
      const expected = { markType: null }
      expect(mapStateToProps(state, props)).toStrictEqual(expected)
    })
  })

  describe("mapDispatchToProps", () => {
    it("should return an object with the dispatch function", () => {
      expect(mapDispatchToProps(dispatch)).toStrictEqual({ dispatch })
    })
  })

  describe("mergeProps", () => {
    it("should return an object with the correct props", () => {
      expect(mergedProps).toHaveProperty("markType")
      expect(mergedProps).toHaveProperty("setMarkType")
    })

    it("should return the correct type of props", () => {
      expect(mergedProps.markType).toBe("line")
    })
  })
})
