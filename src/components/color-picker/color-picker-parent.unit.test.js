// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CHARTS_DEFAULT_COLORS,
  CUSTOM_COLORS,
  getColors
} from "services/colors"
import "charts/chart-definitions"
import { mapStateToProps } from "./color-picker-parent"

describe("ColorPicker Parent Component", () => {
  describe("mapStateToProps", () => {
    it("should return the correct color prop", () => {
      const state = {
        charts: {
          1: {
            type: "",
            dimensions: [],
            measures: [],
            color: getColors(CHARTS_DEFAULT_COLORS).default
          }
        },
        sharedSettings: {}
      }

      const props = mapStateToProps(state, { id: "1" })
      expect(props.color).toStrictEqual(
        getColors(CHARTS_DEFAULT_COLORS).default
      )
    })

    it("should return the correct customColorsOn prop", () => {
      const state = {
        charts: {
          1: {
            type: "pie",
            dimensions: [],
            measures: [],
            color: { isCustom: true },
            colorByDimension: "colorDim"
          }
        },
        sharedSettings: {}
      }

      let props = mapStateToProps(state, { id: "1" })
      expect(props.customColorsOn).toEqual(true)

      state.charts[1].measures = [
        { name: "color", value: "test", colorType: "ordinal" }
      ]
      props = mapStateToProps(state, { id: "1" })
      expect(props.customColorsOn).toEqual(false)

      state.charts[1].type = "pointmap"
      props = mapStateToProps(state, { id: "1" })
      expect(props.customColorsOn).toEqual(true)
    })

    describe.skip("trueColor", () => {
      const state = {
        charts: {
          1: {
            type: "line",
            dimensions: [],
            color: { foo: "bar" }
          }
        },
        sharedSettings: {}
      }

      const defaultColor = {
        ...state.charts[1].color,
        isCustom: false,
        ...getColors(CHARTS_DEFAULT_COLORS).line
      }
      const quantitativeColor = {
        ...state.charts[1].color,
        isCustom: false,
        ...getColors(CHARTS_DEFAULT_COLORS).defaultQuantitative
      }
      const customColor = {
        ...state.charts[1].color,
        ...getColors(CUSTOM_COLORS)
      }
      const chartColor = state.charts[1].color

      it("lets solid colors through unchanged", () => {
        state.charts[1].color.type = "solid"
        state.charts[1].measures = [{ name: "color", value: true }]
        const props = mapStateToProps(state, { id: "1" })
        expect(props.color).toEqual(chartColor)
      })

      it("detects when user removed quantitative color", () => {
        state.charts[1].color.type = "quantitative"
        state.charts[1].measures = []
        const props = mapStateToProps(state, { id: "1" })
        expect(props.color).toStrictEqual(defaultColor)
      })

      it("detects when user added quantitative colors", () => {
        state.charts[1].color.type = "!qualitative"
        state.charts[1].color.isCustom = false
        state.charts[1].measures = [{ name: "color", value: true }]
        const props = mapStateToProps(state, { id: "1" })
        expect(props.color).toStrictEqual(quantitativeColor)
      })

      it("detects when user switched from custom colored chart to one that's not custom-colorable", () => {
        state.charts[1].type = "table" // not customColorable
        state.charts[1].color.isCustom = true
        state.charts[1].measures = [{ name: "color", value: true }]
        // state.charts[1].measures = [{name: "color", value: true, type: "custom"}]
        const props = mapStateToProps(state, { id: "1" })
        expect(props.color).toStrictEqual(customColor)
      })

      it("defaults to the chart's color", () => {
        const props = mapStateToProps(state, { id: "1" })
        expect(props.color).toEqual(chartColor)
      })
    })
  })
})
