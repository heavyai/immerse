// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"

import { filterIdx, mapIdx, mergeR, concatR } from "./ramda-helpers"

describe("Ramda Helper Functions", () => {
  describe("filterIdx", () => {
    it("should filter over collection and apply a condition with value and index arguments", () => {
      const collection = ["a", "b", "c"]
      const setIndex = (v, i) => i
      expect(mapIdx(setIndex, collection)).to.deep.equal([0, 1, 2])
    })
  })

  describe("mapIdx", () => {
    it("should map over collection and apply an iterator with value and index arguments", () => {
      const collection = ["a", "b", "c"]
      const onlySecond = (v, i) => i === 1
      expect(filterIdx(onlySecond, collection)).to.deep.equal(["b"])
    })
  })

  describe("mergeR", () => {
    it("should merge two objects starting and overwriting from right to left", () => {
      expect(mergeR({ key: 1 }, { key: 2 })).to.deep.equal({ key: 1 })
    })
  })

  describe("concatR", () => {
    it("should concat two arrays starting from right to left", () => {
      expect(concatR([0], [1])).to.deep.equal([1, 0])
    })
  })
})
