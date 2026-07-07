// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { calculateDomainForColorRange } = require("./utils")

describe("Contour Utils", () => {
  describe("calculateDomainForColorRange", () => {
    it("should calculate basic domain", () => {
      const domain = calculateDomainForColorRange(
        ["#ffa", "#ffb", "#ffc", "#ffd", "#ffe", "#fff"],
        0,
        10
      )
      expect(domain.length).toBe(6)
      expect(domain).toEqual([0, 2, 4, 6, 8, 10])
    })

    it("should calculate with non integer intervals", () => {
      const colors = ["#ffa", "#ffb", "#ffc", "#ffd", "#ffe"]
      const domain = calculateDomainForColorRange(colors, 0, 10)
      expect(domain.length).toBe(colors.length)
      expect(domain).toEqual([0, 2.5, 5, 7.5, 10])
    })

    it("should handle negative numbers just fine", () => {
      const colors = ["#ffa", "#ffb", "#ffc", "#ffd", "#ffe"]
      const domain = calculateDomainForColorRange(colors, -999, -666)
      expect(domain.length).toBe(colors.length)
      expect(domain).toEqual([-999, -915.75, -832.5, -749.25, -666])
    })
  })
})
