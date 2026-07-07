// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  createScatterChartAsync,
  mapSpecToHeader,
  updateScatterChart
} from "./scatter-chart"
import dc from "services/dc"
import { noop } from "utils/helpers"

const spec = {
  type: "scatter",
  title: "",
  filters: [],
  measures: [
    {
      isError: false,
      isRequired: false,
      inactive: false,
      name: "x",
      label: "# Records",
      value: "*",
      type: "SMALLINT",
      aggType: "Count",
      custom: false,
      originIndex: 0
    },
    {
      isError: false,
      isRequired: false,
      inactive: false,
      name: "y",
      label: "# Records",
      value: "*",
      type: "SMALLINT",
      aggType: "Count",
      custom: false,
      originIndex: 0
    }
  ],
  dimensions: [
    {
      inactive: false,
      name: null,
      isError: false,
      isRequired: false,
      table: "flights",
      type: "STR",
      is_array: false,
      is_dict: true,
      name_is_ambiguous: false,
      label: "dest",
      value: "dest",
      max_val: null,
      min_val: null,
      maxBinSize: null,
      currentHighValue: null,
      currentLowValue: null,
      autobin: false,
      numOfBins: null,
      isBinned: false,
      isBinnable: false
    }
  ],
  binParams: null,
  height: 1024,
  width: 1232,
  elasticX: true,
  cap: 10,
  othersGrouper: false,
  ticks: 3,
  sortColumn: {
    col: {
      name: "val"
    },
    index: 0,
    order: "desc"
  },
  color: {
    type: "ordinal",
    key: "rainbow",
    val: [
      "#ea5545",
      "#f46a9b",
      "#ef9b20",
      "#edbf33",
      "#ede15b",
      "#bdcf32",
      "#87bc45",
      "#27aeef",
      "#b33dc6"
    ]
  },
  areFiltersInverse: false,
  geoJson: null
}

let setEliminateNull = false

const crossfilter = {
  dimension: () => ({
    group: () => ({
      reduce: () => ({
        order: noop
      }),
      binParams: noop
    }),
    setEliminateNull: (val) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setEliminateNull = val
    }
  })
}

let chart = jest.fn()

describe("scatterChart", () => {
  describe("createScatterChart", () => {
    it("should create and return a scatter chart", () => {
      const node = window.document.createElement("DIV")
      const create = createScatterChartAsync(crossfilter)
      return create(spec, node).then((c) => {
        chart = c
        expect(dc.instanceOfChart(c)).toEqual(true)
      })
    })
    it("should reject the creation promise if there is an error", () => {
      const node = window.document.createElement("DIV")
      const create = createScatterChartAsync({})
      return create(spec, node).catch((error) => {
        expect(Boolean(error)).toEqual(true)
      })
    })
  })

  describe("Scatter Update Methods", () => {
    const update = updateScatterChart(() => {})
    it("should set x and y axis labels on measure updates", () => {
      const measureUpdate = {
        measures: [
          {
            isError: false,
            isRequired: false,
            inactive: false,
            name: "x",
            label: "# Records",
            value: "*",
            type: "SMALLINT",
            aggType: "Count",
            custom: false,
            originIndex: 0
          },
          {
            isError: false,
            isRequired: false,
            inactive: false,
            name: "y",
            label: "airtime",
            value: "airtime",
            type: "SMALLINT",
            colorType: "quantitative",
            aggType: "Avg",
            custom: false,
            originIndex: 0,
            table: "flights_123M",
            is_array: false,
            is_dict: false,
            name_is_ambiguous: false
          }
        ]
      }
      const updateSpec = Object.assign({}, spec, measureUpdate)
      update(chart, measureUpdate, updateSpec)
      expect(chart.xAxisLabel()).toEqual(measureUpdate.measures[0].label)
      expect(chart.yAxisLabel()).toEqual(measureUpdate.measures[1].label)
    })
  })

  describe("mapSpecToHeader", () => {
    it("doesn't add measures if they have no value", () => {
      const measures = [{}]
      const dimensions = [{ label: "foo" }]
      expect(mapSpecToHeader({ measures, dimensions })).toStrictEqual([
        { label: "foo", type: "dimension" }
      ])
    })
  })
})
