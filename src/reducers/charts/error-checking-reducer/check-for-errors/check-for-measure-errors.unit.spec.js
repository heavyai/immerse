// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import { compose, map, prop, values } from "ramda"

import checkForMeasureErrors, {
  customMeasureCheck,
  countAllMeasureCheck,
  maybeSetMeasureError,
  measureTypeAllowed
} from "./check-for-measure-errors"

import { ALL_NUMERICAL_TYPES, TIME_UNITS } from "constants/data-types"

describe("Measure Error Checking", () => {
  describe("customMeasureCheck function", () => {
    it("should set isError to true if there it si custom but has no value", () => {
      expect(customMeasureCheck("row")({ custom: true }).isError).to.eql(true)
    })

    it("should not overwrite the previous isError", () => {
      expect(
        customMeasureCheck("row")({ custom: true, value: "bob", isError: true })
          .isError
      ).to.eql(true)
    })

    it("should not set isError to true for inactive measures", () => {
      expect(
        customMeasureCheck("row")({
          custom: true,
          isError: false,
          inactive: true
        }).isError
      ).to.eql(false)
    })
  })

  describe("countAllMeasureCheck function", () => {
    // it('should set isError to true if value is * and chart is pointmap', () => {
    //   expect(countAllMeasureCheck('pointmap')({ value: "*" }).isError).to.eql(true);
    // })

    // it('should set isError to true if value is * and chart is backendScatter', () => {
    //   expect(countAllMeasureCheck('backendScatter')({ value: "*" }).isError).to.eql(true);
    // })

    it("should not set isError to true for inactive measures", () => {
      expect(
        countAllMeasureCheck("row")({ isError: false, value: "*" }).isError
      ).to.eql(false)
    })

    it("should not set isError to true for inactive measures", () => {
      expect(
        countAllMeasureCheck("row")({ isError: false, inactive: true }).isError
      ).to.eql(false)
    })
  })

  describe("checkForMeasureErrors function", () => {
    const mapIsError = compose(values, map(prop("isError")))
    const measures = [
      { value: "test", type: "TIMESTAMP" },
      { value: "test", type: "DATE" },
      { value: "*", type: "INT" },
      { value: "test", type: "BOOL" },
      { value: "test", type: "STR", is_dict: true },
      { value: "test" },
      { custom: true, value: null },
      { value: "test", type: "STR", inactive: true, is_dict: true },
      { custom: true, isError: true }
    ]

    it("should do error checking for non table chart types", () => {
      const newMeasures = checkForMeasureErrors("line")(measures)
      const isErrorValues = mapIsError(newMeasures)

      expect(isErrorValues).to.deep.equal([
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        true
      ])
    })

    it("should do error checking for table chart types", () => {
      const empty = [{}]
      const full = [{ value: "test", inactive: false }]

      const newMeasuresWithNoDimensions = checkForMeasureErrors(
        "table",
        empty
      )(measures)
      const newMeasuresWithDimensions = checkForMeasureErrors(
        "table",
        full
      )(measures)

      expect(mapIsError(newMeasuresWithNoDimensions)).to.deep.equal([
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        true
      ])

      expect(mapIsError(newMeasuresWithDimensions)).to.deep.equal([
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        true
      ])
    })
  })

  describe("measureTypeAllowed function", () => {
    it("marks measure isError if it doesn't match specified type", () => {
      const chartType = "pointmap" // 1st measure can't be INT
      const measure = { value: "test", name: "x", type: "INT" }
      const checkedMeasure = measureTypeAllowed(chartType)(measure)
      expect(checkedMeasure.isError).to.eq(true)
    })
    it("marks measure isError if it's array", () => {
      const chartType = "pie"
      const measure = { value: "test", name: "x", type: "STR", is_array: true }
      const checkedMeasure = measureTypeAllowed(chartType)(measure)
      expect(checkedMeasure.isError).to.eq(true)
    })
    it("marks measure isError if it's non-dict string", () => {
      const chartType = "pie"
      const measure = { value: "test", name: "x", type: "STR", is_dict: false }
      const checkedMeasure = measureTypeAllowed(chartType)(measure)
      expect(checkedMeasure.isError).to.eq(true)
    })
    it("does not mark measure isError if measure has no type", () => {
      const chartType = "pointmap"
      const measure = { value: "test", name: "x" }
      const checkedMeasure = measureTypeAllowed(chartType)(measure)
      expect(checkedMeasure).to.not.have.property("isError")
    })
    it("does not mark measure isError if no type specified", () => {
      const chartType = "line"
      const measure = { value: "test", name: "val", type: "INT" }
      const checkedMeasure = measureTypeAllowed(chartType)(measure)
      expect(checkedMeasure).to.not.have.property("isError")
    })
  })
})
