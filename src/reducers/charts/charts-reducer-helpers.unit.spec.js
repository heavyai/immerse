// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import { inc, dec, merge } from "ramda"
import {
  updateChart,
  maybeAddEmptySelector,
  maybeOffsetSorting,
  maybeResetColorDomain,
  maybeSetMeasureState,
  resetColorDomain,
  setChartNextColor,
  getBinParams,
  getNumOfBins
} from "./charts-reducer-helpers"
import {
  CHARTS_DEFAULT_COLORS,
  MEASURE_DEFAULT_COLORS,
  getColors
} from "services/colors"

describe("Charts Reducer Helper Functions", () => {
  describe("updateChart Function", () => {
    const state = {
      [1]: {
        measures: [{}]
      }
    }

    const update = updateChart("1")
    const updateMeasures = update("measures")
    const addMeasure = updateMeasures(m => m.concat([{}]))
    const next = addMeasure(state)

    it("should apply update to key of chart", () => {
      expect(next["1"].measures.length).to.eql(2)
    })
  })

  describe("maybeAddEmptySelector Function", () => {
    const state = {
      [1]: {
        type: "table",
        dimensions: [{ name: "col1", value: "here" }]
      }
    }

    const update = maybeAddEmptySelector("dimensions", "1")
    const next = update(state)

    it("should add empty selector if max is infinity and last selector has a value", () => {
      expect(next["1"].dimensions.length).to.eql(2)
    })

    it("should add empty selector if its a custom measure", () => {
      const state = {
        [1]: {
          type: "",
          measures: [{ value: "test", custom: true }]
        }
      }

      const nextState = maybeAddEmptySelector("measures", "1")(state)
      expect(nextState["1"].measures.length).to.eql(2)

      expect(nextState).to.deep.equal({
        [1]: {
          type: "",
          measures: [{ value: "test", custom: true }, {}]
        }
      })
    })

    it("should return state if the max number of measures is reached", () => {
      const state = {
        [1]: {
          type: "",
          measures: [{}, {}]
        }
      }

      const nextState = maybeAddEmptySelector("measures", "1")(state)
      expect(nextState["1"].measures.length).to.eql(2)
      expect(nextState).to.deep.equal(state)
    })

    it("should return state if the max number of dimensions is reached", () => {
      const state = {
        [1]: {
          type: "heatmap",
          dimensions: [{}, {}]
        }
      }

      const nextState = maybeAddEmptySelector("dimensions", "1")(state)
      expect(nextState["1"].dimensions.length).to.eql(2)
      expect(nextState).to.deep.equal(state)
    })
  })

  describe("maybeOffsetSorting Function", () => {
    const state = {
      [1]: {
        type: "table",
        dimensions: [{ name: "key0" }],
        measures: [{ name: "col0" }, { name: "col1" }],
        filters: [],
        sortColumn: {
          col: {
            name: "col1"
          },
          index: 2,
          order: "asc"
        }
      }
    }

    it("should offset sort index if sorted by measure and adding dimension", () => {
      const nextState = maybeOffsetSorting(
        inc,
        1,
        "dimensions",
        "1",
        state[1]
      )(state)
      expect(nextState["1"].sortColumn.index).to.eql(3)
    })

    it("should offset measures when adding a measure", () => {
      const nextState = maybeOffsetSorting(
        dec,
        0,
        "measures",
        "1",
        state[1]
      )(state)
      expect(nextState["1"].sortColumn.index).to.eql(1)
      expect(nextState["1"].sortColumn.col.name).to.eql("col0")
    })
  })

  describe("setChartNextColor", () => {
    const initialState = {
      measures: [],
      dimensions: [],
      savedColors: {},
      color: { defaultOtherDomain: "Default" }
    }

    it("uses chart defaults", () => {
      const pie = merge(initialState, { type: "pie" }) // ordinal rainbox
      const row = merge(initialState, { type: "row" }) // ordinal heavy
      const line = merge(initialState, { type: "line" }) // quantitative
      const number = merge(initialState, { type: "number" }) // solid
      expect(setChartNextColor(0)([pie])[0].color).to.deep.equal(
        getColors(CHARTS_DEFAULT_COLORS)["pie"]
      )
      expect(setChartNextColor(0)([row])[0].color).to.deep.equal(
        getColors(CHARTS_DEFAULT_COLORS)["row"]
      )
      expect(setChartNextColor(0)([line])[0].color).to.deep.equal(
        getColors(CHARTS_DEFAULT_COLORS)["line"]
      )
      expect(setChartNextColor(0)([number])[0].color).to.deep.equal(
        getColors(CHARTS_DEFAULT_COLORS)["number"]
      )
    })

    it("uses measure defaults", () => {
      const numeric = merge(initialState, {
        measures: [{ type: "INT", name: "color", value: "*" }],
        type: "pie"
      })
      const time = merge(initialState, {
        measures: [{ type: "DATE", name: "color", value: "*" }],
        type: "pie"
      })
      const text = merge(initialState, {
        measures: [{ type: "STR", name: "color", value: "*" }],
        type: "pie"
      })
      const bool = merge(initialState, {
        measures: [{ type: "BOOL", name: "color", value: "*" }],
        type: "pie"
      })
      const custom = merge(initialState, {
        measures: [{ type: "CUSTOM", name: "color", value: "*" }],
        type: "pie"
      })
      expect(setChartNextColor(0)([numeric])[0].color).to.deep.equal(
        getColors(MEASURE_DEFAULT_COLORS)["quantitative"]
      )
      expect(setChartNextColor(0)([time])[0].color).to.deep.equal(
        getColors(MEASURE_DEFAULT_COLORS)["quantitative"]
      )
      expect(setChartNextColor(0)([text])[0].color).to.deep.equal(
        getColors(MEASURE_DEFAULT_COLORS)["ordinal"]
      )
      expect(setChartNextColor(0)([bool])[0].color).to.deep.equal(
        getColors(MEASURE_DEFAULT_COLORS)["ordinal"]
      )
      expect(setChartNextColor(0)([custom])[0].color).to.deep.equal(
        getColors(MEASURE_DEFAULT_COLORS)["solid"]
      )
    })

    it("uses saved colors when no measure", () => {
      const savedColors = {
        ordinal: {
          key: "rainbow",
          type: "ordinal",
          val: [
            "#ea5545",
            "#f46a9b",
            "#ef9b20",
            "#edbf33",
            "#ede15b",
            "#bdcf32",
            "#87bc45",
            "#27aeef",
            "#937BD9",
            "#b33dc6"
          ]
        },
        quantitative: {
          type: "quantitative",
          key: "mapDScale",
          val: [
            "#115f9a",
            "#1984c5",
            "#22a7f0",
            "#48b5c4",
            "#76c68f",
            "#a6d75b",
            "#c9e52f",
            "#d0ee11",
            "#d0f400"
          ]
        },
        solid: {
          type: "solid",
          key: "blue",
          val: ["#27aeef"]
        }
      }
      const pie = merge(initialState, { savedColors, type: "pie" }) // ordinal rainbox
      const row = merge(initialState, { savedColors, type: "row" }) // ordinal heavy
      const heat = merge(initialState, { savedColors, type: "heat" }) // quantitative
      const number = merge(initialState, { savedColors, type: "number" }) // solid
      expect(setChartNextColor(0)([pie])[0].color).to.deep.equal(
        savedColors.ordinal
      )
      expect(setChartNextColor(0)([row])[0].color).to.deep.equal(
        merge(savedColors.ordinal, {
          key: "mapD",
          val: ["#22A7F0", "#3ad6cd", "#d4e666"]
        })
      )
      expect(setChartNextColor(0)([heat])[0].color).to.deep.equal(
        savedColors.quantitative
      )
      expect(setChartNextColor(0)([number])[0].color).to.deep.equal(
        savedColors.solid
      )
    })

    it("uses correct custom_column color type key for bar chart with color dimension", () => {
      const color = {
        type: "custom",
        key: "mapD",
        val: ["#22A7F0", "#3ad6cd", "#d4e666"],
        column: "origin",
        customKey: "key1",
        isCustom: true,
        customDomain: ["ATL", "ORD", "DFW", "DEN", "LAX"],
        customRange: ["#ea5545", "#bdcf32", "#b33dc6", "#ef9b20", "#87bc45"],
        lineStyles: ["solid", "solid", "solid", "solid", "solid"],
        defaultOtherDomain: "other",
        defaultOtherRange: "#27aeef"
      }

      const savedColors = {
        custom: {
          type: "custom",
          key: "mapD",
          val: ["#22A7F0", "#3ad6cd", "#d4e666"],
          customKey: "key1",
          isCustom: true,
          customDomain: ["Count # Records"],
          customRange: ["#ea5545"],
          lineStyles: ["solid"],
          defaultOtherDomain: "other",
          defaultOtherRange: "#27aeef"
        }
      }

      const dimensions = [
        {
          isError: false,
          isRequired: false,
          inactive: false,
          name: "X Axis",
          table: "flights",
          type: "STR",
          precision: 0,
          is_array: false,
          is_dict: true,
          name_is_ambiguous: false,
          label: "carrier_name",
          value: "carrier_name",
          custom: false,
          axisLabel: null,
          max_val: null,
          min_val: null,
          maxBinSize: null,
          currentHighValue: null,
          currentLowValue: null,
          autobin: false,
          numOfBins: null,
          isBinned: false,
          isBinnable: false
        },
        {
          inactive: false,
          name: "Color",
          isError: false,
          isRequired: false,
          table: "flights",
          type: "STR",
          precision: 0,
          is_array: false,
          is_dict: true,
          name_is_ambiguous: false,
          label: "origin",
          value: "origin",
          custom: false,
          axisLabel: null,
          max_val: null,
          min_val: null,
          maxBinSize: null,
          currentHighValue: null,
          currentLowValue: null,
          autobin: false,
          numOfBins: null,
          isBinned: false,
          isBinnable: false,
          topN: ["ATL", "ORD", "DFW", "DEN", "LAX"]
        }
      ]

      const state = merge(initialState, {
        color,
        savedColors,
        dimensions,
        type: "bar"
      })

      expect(setChartNextColor(0)([state])[0].color.customDomain).to.deep.equal(
        color.customDomain
      )
    })

    it("uses saved colors when measure", () => {
      const savedColors = {
        ordinal: { type: "ordinal", defaultOtherDomain: "Default" },
        quantitative: { type: "quantitative", defaultOtherDomain: "Default" },
        solid: { type: "solid", defaultOtherDomain: "Default" }
      }
      const startingState = merge(initialState, { savedColors, type: "pie" })
      const numeric = merge(startingState, {
        measures: [{ type: "INT", name: "color", value: "*" }]
      })
      const time = merge(startingState, {
        measures: [{ type: "DATE", name: "color", value: "*" }]
      })
      const text = merge(startingState, {
        measures: [{ type: "STR", name: "color", value: "*" }]
      })
      const bool = merge(startingState, {
        measures: [{ type: "BOOL", name: "color", value: "*" }]
      })
      const custom = merge(startingState, {
        measures: [{ type: "CUSTOM", name: "color", value: "*" }]
      })
      expect(setChartNextColor(0)([numeric])[0].color).to.deep.equal(
        savedColors.quantitative
      )
      expect(setChartNextColor(0)([time])[0].color).to.deep.equal(
        savedColors.quantitative
      )
      expect(setChartNextColor(0)([text])[0].color).to.deep.equal(
        savedColors.ordinal
      )
      expect(setChartNextColor(0)([bool])[0].color).to.deep.equal(
        savedColors.ordinal
      )
      expect(setChartNextColor(0)([custom])[0].color).to.deep.equal(
        savedColors.solid
      )
    })
  })

  describe("maybeResetColorDomain", () => {
    const state = {
      [1]: {
        type: "table",
        dimensions: [{ name: "col1", value: "here" }],
        measures: [
          { name: "val", value: "airtime" },
          { name: "color", value: "arrdelay" }
        ],
        colorDomain: [0, 1000]
      }
    }

    it("should reset colorDomain when it is a color measure", () => {
      const nextState = maybeResetColorDomain(1, "measures", 1)(state)
      expect(nextState["1"].colorDomain).to.eql(null)
    })

    it("should not reset colorDomain when it is a value measure", () => {
      const nextState = maybeResetColorDomain(1, "measures", 0)(state)
      expect(nextState["1"].colorDomain).to.deep.equal([0, 1000])
    })

    it("should not reset colorDomain when it is a dimensions selector type", () => {
      const nextState = maybeResetColorDomain(0, "dimensions", 1)(state)
      expect(nextState["1"].colorDomain).to.deep.equal([0, 1000])
    })
  })

  describe("getBinParams", () => {
    it("should autobin when cardinality is greater than 50", () => {
      const minMax = { min_val: 100, max_val: 400 }
      const cardinality = 200
      const result = getBinParams(minMax, cardinality)
      expect(result).to.deep.equal({
        autobin: true,
        currentHighValue: 400,
        currentLowValue: 100,
        isBinnable: true,
        isBinned: true,
        maxBinSize: 250,
        max_val: 400,
        min_val: 100,
        cardinality
      })
    })

    it("should not autobin when cardinality is less than 50", () => {
      const minMax = { min_val: 100, max_val: 140 }
      const cardinality = 20
      const result = getBinParams(minMax, cardinality)
      expect(result).to.deep.equal({
        autobin: false,
        currentHighValue: 140,
        currentLowValue: 100,
        isBinnable: true,
        isBinned: false,
        maxBinSize: 250,
        max_val: 140,
        min_val: 100,
        cardinality
      })
    })
  })

  describe("getNumOfBins", () => {
    it("should return default num bins for not time", () => {
      const dimType = "INT"
      const chartType = "pie"
      const result = getNumOfBins(dimType, chartType)
      expect(result).to.eql(12)
    })

    it("should return default num bins for time", () => {
      const dimType = "DATE"
      const chartType = "pie"
      const result = getNumOfBins(dimType, chartType)
      expect(result).to.eql(1000)
    })

    it("should return default num bins for time and chart is heatmap", () => {
      const dimType = "DATE"
      const chartType = "heat"
      const result = getNumOfBins(dimType, chartType)
      expect(result).to.eql(50)
    })
  })

  describe("maybeSetMeasureState", () => {
    it("should set extra y-measure inactive when color dimension has value", () => {
      const state = {
        [1]: {
          type: "line2",
          dimensions: [{ name: "x axis" }, { name: "Color", value: "column" }],
          measures: [{ name: "series_1" }, { name: "y axis" }]
        }
      }

      const result = maybeSetMeasureState(1)(state)

      expect(result[1].measures[1].inactive).to.eql(true)
    })

    it("should only set inactive measures when color dimension has value for dimension's source", () => {
      const state = {
        [1]: {
          multiSources: { 1: null },
          type: "line2",
          dimensions: [
            { name: "x axis", multiSourceIndex: 0 },
            { name: "Color", multiSourceIndex: 0 },
            { name: "x axis", multiSourceIndex: 1 },
            { name: "Color", value: "column0", multiSourceIndex: 1 }
          ],
          measures: [
            { name: "series_1", multiSourceIndex: 0 },
            { name: "y axis", multiSourceIndex: 0 },
            { name: "series_1", multiSourceIndex: 1 },
            { name: "y axis", multiSourceIndex: 1 }
          ]
        }
      }

      const result = maybeSetMeasureState(1, 1)(state)

      expect(result[1].measures[1].inactive).to.eql(undefined)
      expect(result[1].measures[3].inactive).to.eql(true)
    })
  })
})
