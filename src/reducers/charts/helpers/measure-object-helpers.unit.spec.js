// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import {
  setCustomTrueOrFalse,
  setDefaultAggType
} from "./measure-object-helpers"

describe("Measure Object Helpers", () => {
  it('should add custom property to true when aggType is "Custom"', () => {
    const measure = { aggType: "Custom" }
    const result = setCustomTrueOrFalse(measure)
    expect(result).to.deep.equal({ aggType: "Custom", custom: true })
  })
  it("should leave custom as custom when passed in", () => {
    const measure = { custom: true }
    const result = setDefaultAggType(measure)
    expect(result).to.deep.equal({ custom: true, aggType: "Custom" })
  })
  it("should set default aggType to average", () => {
    const measure = { value: "airtime", type: "INT" }
    const result = setDefaultAggType(measure)
    expect(result).to.deep.equal({
      value: "airtime",
      type: "INT",
      aggType: "Avg"
    })
  })
  it("should set default aggType to Count if value is # Records(*)", () => {
    const measure = { value: "*", type: "" }
    const result = setDefaultAggType(measure)
    expect(result).to.deep.equal({ value: "*", type: "", aggType: "Count" })
  })
})
