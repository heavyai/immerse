// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import composeMeasures, {
  addUniqueAggtypeMeasure,
  addRegularMeasure
} from "./compose-measures"
import "charts/chart-definitions"

describe("Compose Measures", () => {
  it("should return the group", () => {
    const group = { binParams: () => {} }
    const dimension = { group: () => group }
    const measures = []
    const chartSpec = { dimensions: [] }
    expect(composeMeasures(dimension, measures, "line", chartSpec)).toEqual(
      group
    )
  })

  it("should create a regular measure", () => {
    const measure = { value: "airtime", aggType: "Avg", label: "avg airtime" }
    const chartType = "pie"
    const i = 0
    expect(addRegularMeasure(measure, chartType, i, [])).toEqual({
      agg_mode: "Avg",
      expression: "airtime",
      name: "val",
      isComposite: false,
      measureName: "avg airtime"
    })
  })

  it("should create count distinct aggType measure", () => {
    const measure = {
      value: "airtime",
      aggType: "# Unique",
      label: "unique airtime"
    }
    const chartType = "pie"
    const i = 0
    expect(addUniqueAggtypeMeasure(measure, chartType, i, [])).toEqual({
      agg_mode: "approx_count_distinct",
      expression: "airtime",
      name: "val",
      isComposite: true,
      measureName: "unique airtime"
    })
  })

  it("should create a custom measure", () => {
    const measure = {
      value: "SUM(airtime)",
      aggType: "Custom",
      custom: true,
      label: "sum airtime"
    }
    const chartType = "pie"
    const i = 0
    expect(addRegularMeasure(measure, chartType, i, [])).toEqual({
      agg_mode: "Custom",
      expression: "SUM(airtime)",
      name: "val",
      isComposite: true,
      measureName: "sum airtime"
    })
  })
})
