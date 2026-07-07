// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { filterAggtypesOnMeasureType } from "./measure-aggtype-selector-parent"

describe("MeasureAggTypeSelectorParent", () => {
  describe("filterAggTypesOnMeasureType", () => {
    it("should filter AGG_TYPES based on FLOAT", () => {
      expect(filterAggtypesOnMeasureType({ type: "FLOAT" })).toStrictEqual([
        "Avg",
        "Min",
        "Max",
        "Sum",
        "# Unique",
        "Stddev",
        "Sample",
        "Median"
      ])
    })

    it("should filter AGG_TYPES based on INT", () => {
      expect(filterAggtypesOnMeasureType({ type: "INT" })).toStrictEqual([
        "Avg",
        "Min",
        "Max",
        "Sum",
        "# Unique",
        "Stddev",
        "Sample",
        "Median"
      ])
    })

    it("should filter AGG_TYPES based on SMALLINT", () => {
      expect(filterAggtypesOnMeasureType({ type: "SMALLINT" })).toStrictEqual([
        "Avg",
        "Min",
        "Max",
        "Sum",
        "# Unique",
        "Stddev",
        "Sample",
        "Median"
      ])
    })

    it("should filter AGG_TYPES based on dict encoded STR", () => {
      expect(
        filterAggtypesOnMeasureType({ type: "STR", is_dict: true })
      ).toStrictEqual([
        "Avg",
        "Min",
        "Max",
        "Sum",
        "# Unique",
        "Stddev",
        "Sample",
        "Median"
      ])
    })

    it("should filter AGG_TYPES based on non-dict encoded STR", () => {
      expect(
        filterAggtypesOnMeasureType({ type: "STR", is_dict: false })
      ).toStrictEqual([])
    })
  })
})
