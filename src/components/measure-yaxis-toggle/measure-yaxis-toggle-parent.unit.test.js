// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import {
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
} from "./measure-yaxis-toggle-parent"
import { Y_AXIS_ORIENTATIONS } from "constants/charts"

describe("MeasureYAxisToggle Parent", () => {
  const dispatch = () => {}
  const state = {
    charts: {
      1: {
        dataSource: "flights",
        type: "line2",
        dimensions: [],
        measures: [
          {
            name: "y axis",
            yAxisOrientation: Y_AXIS_ORIENTATIONS.LEFT
          }
        ]
      }
    }
  }

  const props = {
    chartId: "1",
    measureIndex: 0
  }

  const mergedProps = mergeProps(
    mapStateToProps(state, props),
    mapDispatchToProps(dispatch),
    props
  )

  describe("mapStateToProps", () => {
    it("should return the current chart.type as chartType", () => {
      const expected = {
        chartType: "line2",
        yAxisOrientation: Y_AXIS_ORIENTATIONS.LEFT
      }
      expect(mapStateToProps(state, props)).to.deep.equal(expected)
    })
  })

  describe("mapDispatchToProps", () => {
    it("should return an object with the dispatch function", () => {
      expect(mapDispatchToProps(dispatch)).to.deep.equal({ dispatch })
    })
  })

  describe("mergeProps", () => {
    it("should return an object with the correct props", () => {
      expect(mergedProps).to.have.property("chartType")
      expect(mergedProps).to.have.property("yAxisOrientation")
      expect(mergedProps).to.have.property("toggleYAxisOrientation")
    })

    it("should return the correct type of props", () => {
      expect(mergedProps.chartType).to.be.a("string")
      expect(mergedProps.yAxisOrientation).to.be.an("string")
      expect(mergedProps.toggleYAxisOrientation).to.be.a("function")
    })
  })
})
