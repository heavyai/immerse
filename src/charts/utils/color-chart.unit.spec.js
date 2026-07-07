// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import {
  colorChartWithMeasure,
  colorChartWithCustomColors,
  shouldRemoveLegend
} from "charts/utils/color-chart"
import colorChart from "charts/utils/color-chart"
import sinon from "sinon"
import spies from "sinon-chai"
import { CHARTS_DEFAULT_COLORS, getColors } from "services/colors"

describe("colorChart", () => {
  describe("shouldRemoveLegend", () => {
    const chart = {
      colorAccessor: x => {
        if (typeof x === "function") {
        }
        return chart
      },
      colors: x => {
        if (typeof x === "function") {
        }
        return chart
      },
      legend: x => {
        if (typeof x === "object") {
          return chart
        }
        return {
          setKey: () => {
            return {
              setTitle: setTitle
            }
          },
          legendType: () => {
            return "custom"
          },
          removeLegend: () => {}
        }
      },
      ordinalColors: () => {}
    }

    it("remove legend if color is solid", () => {
      const removeLegend = shouldRemoveLegend(chart, { type: "solid" })
      expect(removeLegend).to.deep.equal(true)
    })

    it("don't remove legend if color type is the same as legend type", () => {
      const removeLegend = shouldRemoveLegend(chart, {
        type: "custom",
        customDomain: ["#ff0000"]
      })
      expect(removeLegend).to.deep.equal(false)
    })

    it("remove legend if color type is the different as legend type", () => {
      const removeLegend = shouldRemoveLegend(chart, { type: "quantitative" })
      expect(removeLegend).to.deep.equal(true)
    })
  })

  describe("colorChartWithMeasure", () => {
    it("defaults to quantitative palette if no color type", () => {
      expect(colorChartWithMeasure(0, {}, 0, 0, []).range()).to.eql(
        getColors(CHARTS_DEFAULT_COLORS).defaultQuantitative.val
      )
    })
    it("uses specified palette if color type is quantitative", () => {
      const color = { type: "quantitative", val: ["red", "white", "blue"] }
      expect(colorChartWithMeasure(0, color, 0, 0, []).range()).to.eql(
        color.val
      )
    })
    it("reverses color range if requested", () => {
      const color = {
        reverse: true,
        type: "quantitative",
        val: ["red", "white", "blue"]
      }
      expect(colorChartWithMeasure(0, color, 0, 0, []).range()).to.deep.equal([
        "blue",
        "white",
        "red"
      ])
    })
    it("mutates chart if present", () => {
      let passingTests = 1
      const chart = {
        colorAccessor: x => {
          if (typeof x === "function") {
            passingTests = 2 * passingTests
          }
          return chart
        },
        colors: x => {
          if (typeof x === "function") {
            passingTests = 3 * passingTests
          }
          return chart
        },
        legend: x => {
          if (typeof x === "object") {
            passingTests = 5 * passingTests
          }
          return chart
        }
      }
      expect(colorChartWithMeasure(chart, {}, 0, 0, [])).to.eql(chart)
      expect(passingTests).to.eql(30)
    })
    it("returns color scale if no chart", () => {
      const scale = colorChartWithMeasure(0, {}, 0, 0, [1, 2])
      expect(scale.domain()).to.deep.equal([1, 2])
      expect(scale.range()).to.deep.equal(
        getColors(CHARTS_DEFAULT_COLORS).defaultQuantitative.val
      )
    })
  })

  describe("colorChartWithCustomColors", () => {
    const color = {
      customKey: "key0",
      customDomain: ["a", "b", "c"],
      customRange: ["red", "white", "blue"],
      defaultOtherDomain: "Default",
      defaultOtherRange: "purple"
    }

    const setTitle = sinon.spy()
    let isMulti = false

    const chart = {
      isMulti: () => isMulti,
      colorAccessor: x => {
        if (typeof x === "function") {
        }
        return chart
      },
      colors: x => {
        if (typeof x === "function") {
        }
        return chart
      },
      legend: x => {
        if (typeof x === "object") {
          return chart
        }
        return {
          setKey: () => {
            return {
              setTitle: setTitle
            }
          }
        }
      }
    }
    it("should return a colorScale if no chart is provided", () => {
      const colorScale = colorChartWithCustomColors(null, color, null)
      expect(colorScale.domain()).to.deep.equal(
        color.customDomain.concat(["Other"])
      )
      expect(colorScale.range()).to.deep.equal(
        color.customRange.concat([color.defaultOtherRange])
      )
    })

    it("should add other to colorScale", () => {
      chart.showOther = () => true

      const colorScale = colorChartWithCustomColors(chart, color, ["dimension"])
      expect(colorScale.domain()).to.deep.equal(
        color.customDomain.concat("Other")
      )
      expect(colorScale.range()).to.deep.equal(
        color.customRange.concat(color.defaultOtherRange)
      )
    })

    it("should set legend title", () => {
      colorChartWithCustomColors(chart, color, [
        { value: "test" },
        "dimension2"
      ])
      expect(setTitle).to.have.been.calledWith("test")
    })
  })
})
