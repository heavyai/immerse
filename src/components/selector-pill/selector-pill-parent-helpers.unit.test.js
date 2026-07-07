// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSelectorAlias } from "./selector-pill-parent-helpers"
import { MEASURE_NAME_ALIASES } from "constants/data-aliases"
import "charts/chart-definitions"

describe("getSelectorAlias function", () => {
  describe("getSelectorAlias for table charts", () => {
    const measures = [
      { value: "arrtime", name: null, selectorType: "measures" }
    ]

    const dimensions = [
      { value: "arrtime", name: null, selectorType: "dimensions" }
    ]

    const measuresAliases = measures.map((measure, index) => {
      return getSelectorAlias("table", { ...measure, index }, dimensions.length)
    })

    const dimensionsAliases = dimensions.map((dimension, index) => {
      return getSelectorAlias(
        "table",
        { ...dimension, index },
        dimensions.length
      )
    })

    it('should return an alias with the "Col" prefix', () => {
      const isColPrefix = (alias) => alias.substring(0, 3) === "Col"
      expect(measuresAliases.every(isColPrefix)).toEqual(true)
      expect(dimensionsAliases.every(isColPrefix)).toEqual(true)
    })

    it("should return an alias with a numeriacl suffix based on its index", () => {
      const hasProperIndex = (start) => (alias, index) => {
        return alias[alias.length - 1] === (index + start).toString()
      }
      expect(dimensionsAliases.every(hasProperIndex(1))).toEqual(true)
      expect(
        measuresAliases.every(hasProperIndex(dimensions.length + 1))
      ).toEqual(true)
    })
  })

  describe("getSelectorAlias for other chart types", () => {
    it("should return null if the selector has no name", () => {
      const alias = getSelectorAlias("pie", {}, 0)
      expect(alias).toEqual(null)
    })

    it("should return null if the chart type is not found in data aliases", () => {
      const alias = getSelectorAlias("poof", { name: "val" }, 0)
      expect(alias).toEqual(null)
    })

    it("should return the proper alias based on the chart type", () => {
      expect(
        getSelectorAlias("row", { name: "val", selectorType: "measures" }, 0)
      ).toEqual(MEASURE_NAME_ALIASES?.row?.val)
      expect(
        getSelectorAlias("pie", { name: "color", selectorType: "measures" }, 0)
      ).toEqual(MEASURE_NAME_ALIASES.pie.color)
      expect(
        getSelectorAlias("scatter", { name: "y", selectorType: "measures" }, 0)
      ).toEqual(MEASURE_NAME_ALIASES.scatter.y)
      expect(
        getSelectorAlias("scatter", { name: "x", selectorType: "measures" }, 0)
      ).toEqual(MEASURE_NAME_ALIASES.scatter.x)
      expect(
        getSelectorAlias(
          "line",
          { name: "series_1", selectorType: "measures" },
          0
        )
      ).toEqual(MEASURE_NAME_ALIASES.line.series_1)
    })
  })
})
