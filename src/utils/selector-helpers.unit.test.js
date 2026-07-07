// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isEmpty, mapToValues } from "./selector-helpers"

describe("Selector Helper Functions", () => {
  describe("isEmpty Function", () => {
    it("should return true if all objects do not have value or are set inactive", () => {
      const selectors = [
        { name: "test" },
        {},
        { value: "test", inactive: true }
      ]

      expect(isEmpty(selectors)).toEqual(true)
    })

    it("should return false if at least one object has a value and is not inactive", () => {
      const selectors = [
        { name: "test" },
        { value: "arr" },
        { value: "test", inactive: true }
      ]

      expect(isEmpty(selectors)).toEqual(false)
    })
  })

  describe("mapToValues Function", () => {
    it("should map a collection to values for objects that have a value and are not inactive", () => {
      const selectors = [
        { name: "test" },
        { value: "arr" },
        { value: "test", inactive: true }
      ]

      expect(mapToValues(selectors)).toStrictEqual(["arr"])
    })
  })
})
