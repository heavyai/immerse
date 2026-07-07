// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  isValidName,
  isValidRequiredValue,
  isValidParameter,
  getParameterPropertyError
} from "./validation"
import { ParameterTypes } from "components/parameters/parameters-types"

describe("ImmerseSQLPlusPlus test suite", () => {
  it("can determine isValidName", () => {
    expect(isValidName("abc")).toEqual(true)
    expect(isValidName("abc1")).toEqual(true)
    expect(isValidName("1abc")).toEqual(true)
    expect(isValidName("")).toEqual(false)
  })

  it("can determine isValidRequiredValue", () => {
    expect(isValidRequiredValue("abc")).toEqual(true)
    expect(isValidRequiredValue("")).toEqual(false)
    expect(isValidRequiredValue()).toEqual(false)
    expect(isValidRequiredValue(null)).toEqual(false)
  })

  it("can determine isValidParameter", () => {
    expect(isValidParameter({ name: "abc", defaultValue: "123" })).toEqual(true)
    expect(isValidParameter({ name: "", defaultValue: "123" })).toEqual(false)
    expect(isValidParameter({ name: "abc", defaultValue: "" })).toEqual(false)
    expect(isValidParameter({ name: "1abc", defaultValue: undefined })).toEqual(
      false
    )
  })

  describe("getParameterPropertyError", () => {
    it("correctly validates text parameters", () => {
      expect(
        getParameterPropertyError(
          { defaultValue: "", type: ParameterTypes.TEXT },
          "defaultValue"
        )
      ).toBeTruthy()
      expect(
        getParameterPropertyError(
          { defaultValue: "abc", type: ParameterTypes.TEXT },
          "defaultValue"
        )
      ).toBeFalsy()
    })

    it("correctly validates number parameters", () => {
      expect(
        getParameterPropertyError(
          { defaultValue: "0", type: ParameterTypes.NUMBER },
          "defaultValue"
        )
      ).toBeFalsy()
      expect(
        getParameterPropertyError(
          { defaultValue: "1", min: "-2", type: ParameterTypes.NUMBER },
          "defaultValue"
        )
      ).toBeFalsy()
      expect(
        getParameterPropertyError(
          { defaultValue: "1", max: "6", type: ParameterTypes.NUMBER },
          "defaultValue"
        )
      ).toBeFalsy()
      expect(
        getParameterPropertyError(
          {
            defaultValue: "0",
            min: "-6",
            max: "6",
            type: ParameterTypes.NUMBER
          },
          "defaultValue"
        )
      ).toBeFalsy()

      expect(
        getParameterPropertyError(
          { defaultValue: "", type: ParameterTypes.NUMBER },
          "defaultValue"
        )
      ).toBeTruthy()
      expect(
        getParameterPropertyError(
          { defaultValue: "abc", type: ParameterTypes.NUMBER },
          "defaultValue"
        )
      ).toBeTruthy()
      expect(
        getParameterPropertyError(
          { defaultValue: "1", min: "abc", type: ParameterTypes.NUMBER },
          "defaultValue"
        )
      ).toBeTruthy()
      expect(
        getParameterPropertyError(
          {
            defaultValue: "1",
            min: "1",
            max: "abc",
            type: ParameterTypes.NUMBER
          },
          "defaultValue"
        )
      ).toBeTruthy()
      expect(
        getParameterPropertyError(
          { defaultValue: "-21", min: "5", type: ParameterTypes.NUMBER },
          "defaultValue"
        )
      ).toBeTruthy()
      expect(
        getParameterPropertyError(
          { defaultValue: "a", min: "5", type: ParameterTypes.NUMBER },
          "defaultValue"
        )
      ).toBeTruthy()
      expect(
        getParameterPropertyError(
          {
            defaultValue: "1",
            min: "5",
            max: "4",
            type: ParameterTypes.NUMBER
          },
          "defaultValue"
        )
      ).toBeTruthy()
    })
  })
})
