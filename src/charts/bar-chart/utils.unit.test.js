// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { autoSetMarginBottom } from "./utils"
import { SHORT_BOTTOM_MARGIN } from "./bar-constants"

describe("Stacked Bar Utils", () => {
  describe("autoSetMarginBottom", () => {
    let data = [
      { key0: null, val: 100 },
      { key0: "Corporation", val: 150 },
      { key0: "Individual", val: 30 },
      { key0: "Foreign Corporation Has A Long Name", val: 1000 },
      { key0: "Co-Owner", val: 40 },
      { key0: "Partnership", val: 1 }
    ]
    let width = 100
    const margin = {
      top: 32,
      right: 32,
      bottom: SHORT_BOTTOM_MARGIN,
      left: 70
    }
    let numberGroups = 100
    const axisFontSize = 10

    it("should increase the bottom margin size and set labelsAreRotated to true when the chart width is too narrow", () => {
      const result = JSON.stringify(
        autoSetMarginBottom(
          data,
          margin,
          width,
          numberGroups,
          100,
          axisFontSize
        )
      )
      const expected = JSON.stringify({
        margin: {
          top: 32,
          right: 32,
          bottom: 167,
          left: 70
        },
        labelsAreRotated: true
      })
      expect(result).toEqual(expected)
    })

    it("should shorten the bottom margin size and set labelsShouldRotate to false when the chart width is wide enough", () => {
      width = 600
      numberGroups = 10
      const result = JSON.stringify(
        autoSetMarginBottom(data, margin, width, numberGroups, 10, axisFontSize)
      )
      const expected = JSON.stringify({
        margin: {
          top: 32,
          right: 32,
          bottom: SHORT_BOTTOM_MARGIN,
          left: 70
        },
        labelsAreRotated: false
      })
      expect(result).toEqual(expected)
    })

    it("should shorten the bottom margin size and set labelsShouldRotate to true when the chart width is too narrow and label lengths are short", () => {
      const newKeys = ["CA", "NY", "OR", "DC", "WA", "MA"]
      data = data.map((d, i) => ({ ...d, key0: newKeys[i] }))
      width = 50
      const result = JSON.stringify(
        autoSetMarginBottom(data, margin, width, numberGroups, 10, axisFontSize)
      )
      const expected = JSON.stringify({
        margin: {
          top: 32,
          right: 32,
          bottom: 77,
          left: 70
        },
        labelsAreRotated: true
      })
      expect(result).toEqual(expected)
    })
  })
})
