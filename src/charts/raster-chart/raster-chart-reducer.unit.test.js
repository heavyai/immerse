// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  customCategoricalColor,
  customOrdinalColor
} from "reducers/charts/helpers/color-helpers"
import reducers from "./raster-chart-reducer"
import * as actions from "./raster-chart-actions"
import { MEASURE_DEFAULT_COLORS, getColors } from "services/colors"

describe("RasterChart Reducer", () => {
  describe("UPDATE_RASTER_CHART", () => {
    it("should properly handle action", () => {
      const initialState = {
        1: {
          initMinMax: [undefined],
          color: {},
          dimensions: [],
          measures: []
        }
      }

      const nextState = {
        1: {
          initMinMax: [undefined],
          color: {},
          dimensions: [],
          measures: [],
          width: 500
        }
      }

      const action = actions.updateRasterChart("1", { width: 500 })
      const reducer = reducers[actions.UPDATE_RASTER_CHART]
      expect(reducer(initialState, action)).toStrictEqual(nextState)
    })
  })
  describe("UPDATE_DENSITY_ACCUMULATOR", () => {
    it("should properly set density accumlator to true and update color to quantitative", () => {
      const initialState = {
        1: {
          initMinMax: [undefined],
          color: {},
          dimensions: [],
          measures: [],
          densityAccumulatorEnabled: false
        }
      }

      const nextState = {
        1: {
          initMinMax: [undefined],
          color: getColors(MEASURE_DEFAULT_COLORS).quantitative,
          dimensions: [],
          measures: [],
          densityAccumulatorEnabled: true
        }
      }

      const action = actions.updateDensityAccumulator("1", {
        densityAccumulatorEnabled: true
      })
      const reducer = reducers[actions.UPDATE_DENSITY_ACCUMULATOR]
      expect(reducer(initialState, action)).toStrictEqual(nextState)
    })

    it("should properly set density accumulator to false and update color to solid", () => {
      const initialState = {
        1: {
          initMinMax: [undefined],
          color: {},
          dimensions: [],
          measures: [],
          densityAccumulatorEnabled: true
        }
      }

      const nextState = {
        1: {
          initMinMax: [undefined],
          color: getColors(MEASURE_DEFAULT_COLORS).solid,
          dimensions: [],
          measures: [],
          densityAccumulatorEnabled: false
        }
      }

      const action = actions.updateDensityAccumulator("1", {
        densityAccumulatorEnabled: false
      })
      const reducer = reducers[actions.UPDATE_DENSITY_ACCUMULATOR]
      expect(reducer(initialState, action)).toStrictEqual(nextState)
    })
  })
  describe("REMOVE_RASTER_CHART_MEASURE", () => {
    it("should properly handle action when size measure is removed", () => {
      const initialState = {
        1: {
          initMinMax: [undefined],
          autoSize: false,
          color: {},
          dimensions: [],
          measures: [
            {},
            {},
            {
              isRequired: false,
              value: "amount",
              label: "amount",
              minMax: [],
              name: "size"
            }
          ]
        }
      }

      const nextState = {
        1: {
          initMinMax: [undefined],
          autoSize: true,
          color: {},
          dimensions: [],
          measures: [
            {},
            {},
            { isRequired: false, isError: false, name: "size" }
          ]
        }
      }

      const action = actions.removeRasterChartMeasure("1", 2)
      const reducer = reducers[actions.REMOVE_RASTER_CHART_MEASURE]
      expect(reducer(initialState, action)).toStrictEqual(nextState)
    })
    it("should properly handle action when color measure is removed", () => {
      const initialState = {
        1: {
          initMinMax: [undefined],
          autoSize: false,
          color: { type: "quantitative" },
          dimensions: [],
          measures: [
            {},
            {},
            {},
            {
              isRequired: false,
              value: "amount",
              label: "amount",
              minMax: [],
              name: "color"
            }
          ]
        }
      }

      const nextState = {
        1: {
          initMinMax: [undefined],
          autoSize: false,
          color: {
            type: "solid",
            key: "blue",
            val: ["#27aeef"]
          },
          dimensions: [],
          measures: [
            {},
            {},
            {},
            { isError: false, isRequired: false, name: "color" }
          ]
        }
      }

      const action = actions.removeRasterChartMeasure("1", 3)
      const reducer = reducers[actions.REMOVE_RASTER_CHART_MEASURE]
      expect(reducer(initialState, action)).toStrictEqual(nextState)
    })
  })
  describe("ADD_RASTER_CHART_MEASURE", () => {
    it("should properly handle action", () => {
      const initialState = {
        1: {
          initMinMax: [undefined],
          color: {},
          autoSize: true,
          dimensions: [],
          sizeRange: [],
          measures: [{}]
        }
      }

      const nextState = {
        1: {
          initMinMax: [undefined],
          color: {},
          autoSize: true,
          dimensions: [],
          sizeRange: [],
          measures: [{ aggType: "Avg", custom: false, loading: true }]
        }
      }

      const action = {
        type: actions.ADD_RASTER_CHART_MEASURE,
        chartId: "1",
        index: 0,
        measure: { loading: true }
      }

      const reducer = reducers[actions.ADD_RASTER_CHART_MEASURE]
      expect(reducer(initialState, action)).toStrictEqual(nextState)
    })

    it("should handle size measures properly", () => {
      const initialState = {
        1: {
          initMinMax: [undefined],
          color: {},
          autoSize: true,
          dimensions: [],
          sizeRange: [1, 20],
          measures: [{ name: "size" }]
        }
      }

      const nextState = {
        1: {
          initMinMax: [undefined],
          color: {},
          autoSize: false,
          dimensions: [],
          sizeRange: [3, 10],
          measures: [
            { aggType: "Avg", custom: false, loading: true, name: "size" }
          ]
        }
      }

      const action = {
        type: actions.ADD_RASTER_CHART_MEASURE,
        chartId: "1",
        index: 0,
        measure: { loading: true }
      }

      const reducer = reducers[actions.ADD_RASTER_CHART_MEASURE]
      expect(reducer(initialState, action)).toStrictEqual(nextState)
    })
  })

  describe("UPDATE_COLOR_LEGEND", () => {
    it("should modify chart state to reflect a new color legend", () => {
      const initialState = {
        1: {
          colorDomain: null
        }
      }

      const action = actions.updateColorLegend(1, { colorDomain: [1, 200] })
      const reducer = reducers[actions.UPDATE_COLOR_LEGEND]
      const {
        1: { colorDomain }
      } = reducer(initialState, action)

      expect(colorDomain).toStrictEqual([1, 200])
    })
  })

  describe("UPDATE_RASTER_CHART_MEASURE", () => {
    it("should properly handle updating color ordinal color measure", () => {
      const initialState = {
        1: {
          color: {},
          dimensions: [],
          measures: [{}, {}, {}, { type: "STR", name: "color" }]
        }
      }

      const action = actions.updateMeasure({
        chartId: "1",
        selector: { type: "STR" },
        index: 3,
        domain: ["R", "D"]
      })
      const reducer = reducers[actions.UPDATE_RASTER_CHART_MEASURE]
      const {
        1: { color, measures }
      } = reducer(initialState, action)

      expect(color).toStrictEqual(customCategoricalColor(measures[3]))
      expect(measures[3]).toStrictEqual({
        type: "STR",
        name: "color",
        loading: false,
        categories: ["R", "D"],
        colorType: "ordinal",
        initMinMax: undefined,
        hideOther: undefined
      })
    })
    it("should properly handle updating color quantitative color measure", () => {
      const initialState = {
        1: {
          color: {},
          dimensions: [],
          measures: [{}, {}, {}, { type: "INT", name: "color" }]
        }
      }

      const action = actions.updateMeasure({
        chartId: "1",
        selector: { type: "INT" },
        index: 3,
        domain: [0, 10]
      })
      const reducer = reducers[actions.UPDATE_RASTER_CHART_MEASURE]
      const {
        1: { color, measures }
      } = reducer(initialState, action)

      expect(color).toStrictEqual(
        getColors(MEASURE_DEFAULT_COLORS).quantitative
      )
      expect(measures[3]).toStrictEqual({
        type: "INT",
        name: "color",
        loading: false,
        minMax: [0, 10],
        colorType: "quantitative",
        initMinMax: undefined,
        hideOther: undefined
      })
    })
    it("should properly handle action", () => {
      const initialState = {
        1: {
          color: {},
          dimensions: [],
          measures: [{ type: "INT" }, {}, {}, {}]
        }
      }

      const action = actions.updateMeasure({
        chartId: "1",
        selector: { type: "INT" },
        index: 0,
        domain: [0, 10]
      })
      const reducer = reducers[actions.UPDATE_RASTER_CHART_MEASURE]
      const {
        1: { measures }
      } = reducer(initialState, action)

      expect(measures[0]).toStrictEqual({
        type: "INT",
        minMax: [0, 10],
        loading: false,
        initMinMax: undefined,
        hideOther: undefined
      })
    })
  })

  describe("UPDATE_MEASURES_DOMAINS", () => {
    it("should properly handle STR type color updates", () => {
      const initialState = {
        1: {
          color: {},
          dimensions: [],
          measures: [
            { type: "INT", name: "x", minMax: null },
            { type: "INT", name: "y", minMax: null },
            { type: "INT", name: "size", minMax: null },
            { type: "STR", name: "color", categories: null }
          ]
        }
      }

      const action = actions.updateMeasuresDomains("1", [
        {
          name: "x",
          key: "minMax",
          domain: [1, 10]
        },
        {
          name: "y",
          key: "minMax",
          domain: [1, 10]
        },
        {
          name: "size",
          key: "minMax",
          domain: [1, 10]
        },
        {
          name: "color",
          key: "categories",
          domain: ["R"]
        }
      ])

      const reducer = reducers[actions.UPDATE_MEASURES_DOMAINS]
      const {
        1: { color, measures }
      } = reducer(initialState, action)

      expect(measures).toStrictEqual([
        { type: "INT", name: "x", minMax: [1, 10] },
        { type: "INT", name: "y", minMax: [1, 10] },
        { type: "INT", name: "size", minMax: [1, 10] },
        { type: "STR", name: "color", categories: ["R"], colorType: "ordinal" }
      ])

      expect(color).toStrictEqual(customOrdinalColor(measures[3]))
    })

    it("should properly handle non STR type color updates", () => {
      const initialState = {
        1: {
          color: {},
          dimensions: [],
          measures: [
            { type: "INT", name: "x", minMax: null },
            { type: "INT", name: "y", minMax: null },
            { type: "INT", name: "size", minMax: null },
            { type: "INT", name: "color", categories: null }
          ]
        }
      }

      const action = actions.updateMeasuresDomains("1", [
        {
          name: "x",
          key: "minMax",
          domain: [1, 10]
        },
        {
          name: "y",
          key: "minMax",
          domain: [1, 10]
        },
        {
          name: "size",
          key: "minMax",
          domain: [1, 10]
        },
        {
          name: "color",
          key: "categories",
          domain: [0, 100]
        }
      ])

      const reducer = reducers[actions.UPDATE_MEASURES_DOMAINS]
      const {
        1: { color, measures }
      } = reducer(initialState, action)

      expect(measures).toStrictEqual([
        { type: "INT", name: "x", minMax: [1, 10] },
        { type: "INT", name: "y", minMax: [1, 10] },
        { type: "INT", name: "size", minMax: [1, 10] },
        {
          type: "INT",
          name: "color",
          categories: [0, 100],
          colorType: "quantitative"
        }
      ])

      expect(color).toStrictEqual(
        getColors(MEASURE_DEFAULT_COLORS).quantitative
      )
    })
  })

  describe("SELECT_GEO_JOIN_DATA_SOURCE", () => {
    it("should add table to geoJoin", () => {
      const reducer = reducers.SELECT_GEO_JOIN_DATA_SOURCE
      const {
        1: {
          geoJoin: { table }
        }
      } = reducer(
        {
          1: {
            geoJoin: { table: "flights" }
          }
        },
        {
          type: "SELECT_GEO_JOIN_DATA_SOURCE",
          chartId: "1",
          dataSource: "tweets"
        }
      )
      expect(table).toEqual("tweets")
    })
  })

  describe("UPDATE_GEO_JOIN_COLUMN", () => {
    it("should add column to geoJoin", () => {
      const reducer = reducers.UPDATE_GEO_JOIN_COLUMN
      const {
        1: {
          geoJoin: { column }
        }
      } = reducer(
        {
          1: {
            geoJoin: { table: "flights", column: "" }
          }
        },
        actions.updateGeoJoinColumn(1, "dest")
      )
      expect(column).toEqual("dest")
    })
  })
})
