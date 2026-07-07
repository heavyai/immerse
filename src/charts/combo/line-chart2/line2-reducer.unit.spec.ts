// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { initialChart } from "reducers/charts/helpers/initialChart"
import * as Line2Actions from "charts/combo/line-chart2/line2-action-creators"
import line2Reducer from "./line2-reducer"
import { expect } from "chai"
import { X_AXIS_DIMENSION_LABEL } from "./line2-consts"

describe("combo chart reducer", () => {
  const dimensions = [
    {
      name: X_AXIS_DIMENSION_LABEL,
      value: undefined
    },
    {
      name: X_AXIS_DIMENSION_LABEL,
      value: "columnOne"
    },
    {
      name: X_AXIS_DIMENSION_LABEL,
      value: "columnTwo"
    },
    {
      name: "Y Axis",
      value: "another value"
    }
  ]
  const id = "1"
  const initialState = {
    [id]: {
      ...initialChart({ type: "line2" }),
      dimensions
    }
  }
  describe("SET_EXTRACT action", () => {
    const extract = "day"
    const action = Line2Actions.setExtract(id, extract)
    const state = line2Reducer[action.type](initialState, action)

    it("should only set extract of x axis dimensions", () => {
      const nonXDimension = state[id].dimensions.filter(
        (dim) => dim.name !== X_AXIS_DIMENSION_LABEL
      )
      expect(nonXDimension).to.not.have.property("autobin")
      expect(nonXDimension).to.not.have.property("extract")
      expect(nonXDimension).to.not.have.property("timeBin")
    })

    it("should not set extract on X dimensions that have no value", () => {
      const nullXDimension = state[id].dimensions.filter(
        (dim) => dim.name === X_AXIS_DIMENSION_LABEL && !dim.value
      )

      expect(nullXDimension).to.not.have.property("autobin")
      expect(nullXDimension).to.not.have.property("extract")
      expect(nullXDimension).to.not.have.property("timeBin")
    })
    it("should set all extract params on x dimensions with a truthy value", () => {
      const xDimensions = state[id].dimensions.filter(
        (dim) => dim.name === X_AXIS_DIMENSION_LABEL && dim.value
      )

      xDimensions.forEach((dim) => {
        expect(dim).to.have.property("autobin", false)
        expect(dim).to.have.property("extract", true)
        expect(dim).to.have.property("timeBin", "day")
      })
    })
  })

  describe("SET_BINNING action", () => {
    const bin = "quater"
    const action = Line2Actions.setBinning(id, bin)
    const state = line2Reducer[action.type](initialState, action)

    it("should only set binning of x axis dimensions", () => {
      const nonXDimension = state[id].dimensions.filter(
        (dim) => dim.name !== X_AXIS_DIMENSION_LABEL
      )
      expect(nonXDimension).to.not.have.property("autobin")
      expect(nonXDimension).to.not.have.property("extract")
      expect(nonXDimension).to.not.have.property("timeBin")
    })

    it("should not set binning on X dimensions that have no value", () => {
      const nullXDimension = state[id].dimensions.filter(
        (dim) => dim.name === X_AXIS_DIMENSION_LABEL && !dim.value
      )

      expect(nullXDimension).to.not.have.property("autobin")
      expect(nullXDimension).to.not.have.property("extract")
      expect(nullXDimension).to.not.have.property("timeBin")
    })
    it("should set binning on all x dimensions with a truthy value", () => {
      const xDimensions = state[id].dimensions.filter(
        (dim) => dim.name === X_AXIS_DIMENSION_LABEL && dim.value
      )
      xDimensions.forEach((dim) => {
        expect(dim).to.have.property("autobin", false)
        expect(dim).to.have.property("extract", false)
        expect(dim).to.have.property("timeBin", bin)
      })
    })
  })

  describe("SET_AUTOBIN action", () => {
    const action = Line2Actions.setAutoBin(id, { isSelected: true })
    const state = line2Reducer[action.type](initialState, action)

    it("should only set autobinning of x axis dimensions", () => {
      const nonXDimension = state[id].dimensions.filter(
        (dim) => dim.name !== X_AXIS_DIMENSION_LABEL
      )
      expect(nonXDimension).to.not.have.property("autobin")
      expect(nonXDimension).to.not.have.property("extract")
      expect(nonXDimension).to.not.have.property("timeBin")
    })

    it("should not set autobinning on X dimensions that have no value", () => {
      const nullXDimension = state[id].dimensions.filter(
        (dim) => dim.name === X_AXIS_DIMENSION_LABEL && !dim.value
      )

      expect(nullXDimension).to.not.have.property("autobin")
      expect(nullXDimension).to.not.have.property("extract")
      expect(nullXDimension).to.not.have.property("timeBin")
    })
    it("should set autobinning on all x dimensions with a truthy value", () => {
      const xDimensions = state[id].dimensions.filter(
        (dim) => dim.name === X_AXIS_DIMENSION_LABEL && dim.value
      )
      xDimensions.forEach((dim) => {
        expect(dim).to.have.property("autobin", true)
        expect(dim).to.have.property("extract", false)
        expect(dim).to.have.property("timeBin", "auto")
      })
    })
  })

  describe("CHANGE_DIMENSION_FORMAT", () => {
    const dateFormat = "dateFormat"
    const action = Line2Actions.changeDimensionFormat(id, dateFormat)
    const state = line2Reducer[action.type](initialState, action)

    it("should set the dateFormat of all dimensions with a non-null value", () => {
      const nonNullDimensions = state[id].dimensions.filter((dim) =>
        Boolean(dim.value)
      )
      nonNullDimensions.forEach((dim) => {
        expect(dim).to.have.property("dateFormat", dateFormat)
      })
    })

    it("should not set the dateFormat of all dimensions with a falsy value", () => {
      const nullDimensions = state[id].dimensions.filter((dim) => !dim.value)
      nullDimensions.forEach((dim) => {
        expect(dim).to.not.have.property("dateFormat")
      })
    })
  })

  describe("SET_CHART_BIN_EXTENT_AND_FILTER_STRING_MULTISOURCE", () => {
    const actionType =
      Line2Actions.SET_CHART_BIN_EXTENT_AND_FILTER_STRING_MULTISOURCE
    const action = {
      type: actionType,
      chartId: id,
      multiSourceIndex: null,
      extent: [0, 1],
      filter: "filter"
    }
    const state = line2Reducer[action.type](initialState, action)

    it("updates filterString", () => {
      expect(state[id].filterString).to.deep.equal({ null: "filter" })
    })

    it("updates xAxisDimension", () => {
      expect(state[id].dimensions[0]).to.deep.equal({
        ...dimensions[0],
        currentLowValue: 0,
        currentHighValue: 1
      })
    })
  })
})
