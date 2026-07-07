// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import { compose, map, prop, values } from "ramda"

import checkForDimensionErrors, {
  maybeSetDimensionError
} from "./check-for-dimension-errors"

describe("Dimension Error Checking", () => {
  describe("maybeSetDimensionError function", () => {
    const dimensionTypes = {
      string: { type: "STR" },
      date: { type: "DATE" },
      timestamp: { type: "TIMESTAMP" },
      int: { type: "INT" }
    }

    it("should set isError to false for dimensions with no types", () => {
      expect(
        maybeSetDimensionError("pie")({ value: "test" }, 0).isError
      ).to.eql(false)
    })

    it("should set isError to false for inactive dimensions", () => {
      expect(
        maybeSetDimensionError("pie")({ inactive: "test" }, 0).isError
      ).to.eql(false)
    })

    it("should check for measure errors for chart types that need numerical dimensions", () => {
      const errorCheckForNumerical = maybeSetDimensionError("line")

      expect(
        errorCheckForNumerical(dimensionTypes.timestamp, 0).isError
      ).to.eql(false)
      expect(errorCheckForNumerical(dimensionTypes.string, 0).isError).to.eql(
        true
      )
      expect(errorCheckForNumerical(dimensionTypes.int, 0).isError).to.eql(
        false
      )
    })

    it("should check for measure errors for chart types that do not need numerical dimensions", () => {
      const errorCheckForNumerical = maybeSetDimensionError("table")

      expect(errorCheckForNumerical(dimensionTypes.string, 0).isError).to.eql(
        false
      )
      expect(errorCheckForNumerical(dimensionTypes.int, 0).isError).to.eql(
        false
      )
      expect(
        errorCheckForNumerical(dimensionTypes.timestamp, 0).isError
      ).to.eql(false)
    })
  })

  describe("checkForDimensionErrors function", () => {
    const mapIsError = compose(values, map(prop("isError")))

    it("should do error checking for numerical chart types", () => {
      const numericalChecking = checkForDimensionErrors("line")

      expect(
        mapIsError(numericalChecking([{ type: "TIMESTAMP" }, { type: "DATE" }]))
      ).to.deep.equal([false, true])

      expect(
        mapIsError(numericalChecking([{ type: "INT" }, { type: "BOOL" }]))
      ).to.deep.equal([false, true])

      expect(
        mapIsError(
          numericalChecking([{ type: "STR" }, { type: "STR", inactive: true }])
        )
      ).to.deep.equal([true, false])
    })

    it("should do error checking for non-numerical chart types", () => {
      const dimensions = [
        { type: "TIMESTAMP" },
        { type: "DATE" },
        { type: "INT" },
        { type: "BOOL" },
        { type: "STR" },
        { value: "test" },
        { type: "STR", inactive: true }
      ]

      const numericalChecking = checkForDimensionErrors("table")
      const newDimensions = numericalChecking(dimensions)
      const isErrorValues = mapIsError(newDimensions)

      expect(isErrorValues).to.deep.equal([
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ])
    })
  })
})
