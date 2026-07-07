// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import {
  setSelectorClear,
  setInactive,
  setActive,
  setIsError,
  setIsRequired
} from "./selector-object-helpers"

describe("Selector Object Helpers", () => {
  describe("setSelectorClear function", () => {
    it("should return empty object if there is no name or multiSourceIndex passed", () => {
      expect(setSelectorClear({ value: "test" })).to.deep.equal({})
    })

    it("should retain name or multiSourceIndex if passed", () => {
      expect(setSelectorClear({ value: "test", name: "test" })).to.deep.equal({
        name: "test"
      })
      expect(
        setSelectorClear({
          value: "test",
          name: "test",
          multiSourceIndex: 3
        })
      ).to.deep.equal({
        name: "test",
        multiSourceIndex: 3
      })
    })
  })

  describe("setIsError function", () => {
    it("should set the isError property of an object", () => {
      const isError = false
      expect(setIsError(isError, { isError: true }).isError).to.eql(isError)
    })
  })

  describe("setIsRequired function", () => {
    it("should set the isRequired property of an object", () => {
      const isRequired = false
      expect(setIsRequired(isRequired, { isRequired: true }).isRequired).to.eql(
        isRequired
      )
    })
  })

  describe("setInactive function", () => {
    it("should set inactive property of an object to true", () => {
      expect(setInactive({ inactive: false }).inactive).to.eql(true)
    })
  })

  describe("setActive function", () => {
    it("should set inactive property of an object to false", () => {
      expect(setActive({ inactive: true }).inactive).to.eql(false)
    })
  })
})
