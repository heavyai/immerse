// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import { formatNumber, xDomain, xScale } from "./coordinate-helpers"

describe("Coordinate Helpers", () => {
  describe("xDomain", () => {
    it("should return domain as currentLowValue and currentHighValue when not extract", () => {
      const currentLowValue = new Date()
      const currentHighValue = new Date()
      expect(xDomain({ currentLowValue, currentHighValue })).to.deep.equal([
        currentLowValue,
        currentHighValue
      ])
    })
    it("should return proper domain when extract year", () => {
      const currentLowValue = new Date()
      const currentHighValue = new Date()
      expect(
        xDomain({
          extract: true,
          timeBin: "year",
          currentLowValue,
          currentHighValue
        })
      ).to.deep.equal([
        currentLowValue.getFullYear(),
        currentHighValue.getFullYear()
      ])
    })
    it("should return proper domain when extract quarter", () => {
      expect(xDomain({ extract: true, timeBin: "quarter" })).to.deep.equal([
        1,
        4
      ])
    })
    it("should return proper domain when extract isodow", () => {
      expect(xDomain({ extract: true, timeBin: "isodow" })).to.deep.equal([
        1,
        7
      ])
    })
    it("should return proper domain when extract month", () => {
      expect(xDomain({ extract: true, timeBin: "month" })).to.deep.equal([
        1,
        12
      ])
    })
    it("should return proper domain when extract day", () => {
      expect(xDomain({ extract: true, timeBin: "day" })).to.deep.equal([1, 31])
    })
    it("should return proper domain when extract hour", () => {
      expect(xDomain({ extract: true, timeBin: "hour" })).to.deep.equal([0, 23])
    })
    it("should return proper domain when extract minute", () => {
      expect(xDomain({ extract: true, timeBin: "minute" })).to.deep.equal([
        0,
        59
      ])
    })
    it("should return proper domain when extract default", () => {
      expect(xDomain({ extract: true })).to.deep.equal([1, 7])
    })
  })

  describe("xScale", () => {
    it("should return linear when extract or type is not time", () => {
      expect(xScale({ extract: true })(2)).to.eql(2)
      expect(xScale({ extract: false, type: "INT" })(2)).to.eql(2)
    })
    it("should return utc when type is time", () => {
      expect(xScale({ type: "TIMESTAMP" })(new Date(1183766400000))).to.eql(
        1183766400000
      )
    })
  })

  describe("formatNumber", () => {
    it("should not return milliseconds when passing in value between 0 and 1", () => {
      expect(formatNumber(0.5)).to.eql(0.5)
    })
    it("should round to closest value with 2 decimals when passing in value between 0 and 1", () => {
      expect(formatNumber(0.55125124)).to.eql(0.55)
    })
    it("should return 1.0B when passing in a numerical value of 1000000000", () => {
      expect(formatNumber(1000000000)).to.eql("1.0B")
    })
    it("should return standard SI value for thousand", () => {
      expect(formatNumber(1000)).to.eql("1.0k")
    })
    it("should return standard SI value for million", () => {
      expect(formatNumber(1000000)).to.eql("1.0M")
    })
  })
})
