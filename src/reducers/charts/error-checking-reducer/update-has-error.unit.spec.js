// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import updateHasError, { missing, noError, hasError } from "./update-has-error"

const CHART_ID = 1

function createChartsState(chartState) {
  return {
    [CHART_ID]: {
      hasError: false,
      ...chartState
    }
  }
}

describe("updateHasError Reducer Helper", () => {
  describe("when any required selector has no value", () => {
    const state = createChartsState({
      measures: [{ isRequired: true, value: null }],
      dimensions: [{ isRequired: true, value: "arrdelay" }]
    })

    it("should set hasError true", () => {
      const {
        1: { hasError }
      } = updateHasError(CHART_ID)(state)
      expect(hasError).to.eql(true)
    })
  })

  describe("when any required selector is loading", () => {
    const state = createChartsState({
      measures: [{ isRequired: true, value: "carrier_name" }],
      dimensions: [{ isRequired: true, value: "arrdelay", loading: true }]
    })
    it("should set hasError true", () => {
      const {
        1: { hasError }
      } = updateHasError(CHART_ID)(state)
      expect(hasError).to.eql(true)
    })
  })

  describe("when a required selector has an error", () => {
    const state = createChartsState({
      measures: [{ isRequired: true, value: "airtime", isError: true }],
      dimensions: [{ isRequired: true, value: "arrdelay" }]
    })
    it("should set hasError true", () => {
      const {
        1: { hasError }
      } = updateHasError(CHART_ID)(state)
      expect(hasError).to.eql(true)
    })
  })

  describe("when all required selectors have a value, are not loading, and do not have errors", () => {
    const state = createChartsState({
      measures: [{ isRequired: true, value: "airtime" }],
      dimensions: [{ isRequired: true, value: "arrdelay" }]
    })
    it("should set hasError false", () => {
      const {
        1: { hasError }
      } = updateHasError(CHART_ID)(state)
      expect(hasError).to.eql(false)
    })
  })
})
