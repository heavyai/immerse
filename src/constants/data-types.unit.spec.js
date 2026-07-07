// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"

import { iconFromType, isNonDictString } from "constants/data-types"

describe("isNonDictString", () => {
  it("returns true for non-dictionary-encoded non-bool text types", () => {
    expect(isNonDictString({ type: "INT", is_dict: false })).to.eql(false)
    expect(isNonDictString({ type: "DATE", is_dict: true })).to.eql(false)
    expect(isNonDictString({ type: "STR", is_dict: false })).to.eql(true)
    expect(isNonDictString({ type: "varchar", is_dict: true })).to.eql(false)
    expect(isNonDictString({ type: "BOOL", is_dict: false })).to.eql(false)
    expect(isNonDictString({ type: "BOOL", is_dict: true })).to.eql(false)
  })
})

describe("iconFromType", () => {
  it("returns expected values", () => {
    expect(iconFromType("BOOL")).to.eql("boolean")
    expect(iconFromType("CUSTOM")).to.eql("custom")
    expect(iconFromType("DATE")).to.eql("time")
    expect(iconFromType("STR")).to.eql("string")
    expect(iconFromType("TIMESTAMP")).to.eql("time")
    expect(iconFromType("INT")).to.eql("number")
    expect(iconFromType("SOMETHING ELSE")).to.eql("number")

    expect(iconFromType("BOOL", true)).to.eql("array-boolean")
    expect(iconFromType("CUSTOM", true)).to.eql("array-custom")
    expect(iconFromType("DATE", true)).to.eql("array-time")
    expect(iconFromType("STR", true)).to.eql("array-string")
    expect(iconFromType("TIMESTAMP", true)).to.eql("array-time")
  })
})
