// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"

import { relativeToMoment, filterLabel } from "./time-helpers"
import relativeTimeFilters from "constants/relative-time-filters"
import moment from "moment"

describe("Time Helper Functions", () => {
  describe("relativeToMoment Function", () => {
    it("should converts relative time filters to moment objects", () => {
      const asMoments = relativeTimeFilters.map((i) => [
        relativeToMoment(i.lower),
        relativeToMoment(i.upper)
      ])
      asMoments.forEach((i) => {
        expect(i[0]).to.be.instanceof(moment)
        expect(i[1]).to.be.instanceof(moment)
      })
    })
  })

  describe("filterLabel Function", () => {
    it("should format relative filters as labels", () => {
      const asFilters = relativeTimeFilters.map((i) => ({
        isRelative: true,
        relativeLabel: i.label,
        operand: [i.lower, i.upper]
      }))
      const asLabels = asFilters.map((i) => filterLabel(i))
      asLabels.forEach((l) => {
        expect(l).to.include("(")
        expect(l).to.include(")")
      })
    })

    it('should return "" if provided with unknown label', () => {
      const filter = {
        isRelative: true,
        relativeLabel: "foo",
        operand: [{ now: true }, { now: true }]
      }
      expect(filterLabel(filter)).to.eq("")
    })
  })
})
