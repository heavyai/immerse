// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHeatChartAsync } from "./heat-chart"
import dc from "services/dc"
import { noop } from "utils/helpers"

const spec = {
  autoSize: true,
  areFiltersInverse: false,
  binParams: null,
  cap: 100,
  color: {
    type: "quantitative",
    key: "heatScale",
    val: [
      "#1984c5",
      "#22a7f0",
      "#63bff0",
      "#a7d5ed",
      "#e2e2e2",
      "#e1a692",
      "#de6e56",
      "#e14b31",
      "#c23728"
    ]
  },
  colorDomain: null,
  dcFlag: 7,
  dimensions: [
    {
      inactive: false,
      name: "X Axis",
      isError: false,
      isRequired: false,
      table: "flights",
      type: "STR",
      is_array: false,
      is_dict: true,
      name_is_ambiguous: false,
      label: "origin_state",
      value: "origin_state",
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
      name: "Y Axis",
      isError: false,
      isRequired: false,
      table: "flights",
      type: "SMALLINT",
      is_array: false,
      is_dict: false,
      name_is_ambiguous: false,
      label: "arrtime",
      value: "arrtime",
      min_val: 1,
      max_val: 2400,
      currentLowValue: 1,
      currentHighValue: 2400,
      isBinned: true,
      isBinnable: true,
      autobin: true,
      maxBinSize: 250,
      numOfBins: 22,
      extract: false,
      timeBin: null
    }
  ],
  elasticX: true,
  filters: [],
  geoJson: "us-states.json",
  height: null,
  loading: false,
  measures: [
    {
      isError: false,
      isRequired: false,
      inactive: false,
      name: "color",
      label: "# Records",
      value: "*",
      type: "SMALLINT",
      colorType: "quantitative",
      aggType: "Count",
      custom: false,
      originIndex: 0
    }
  ],
  rangeChartEnabled: true,
  othersGrouper: false,
  savedColors: {
    quantitative: {
      type: "quantitative",
      key: "heatScale",
      val: [
        "#1984c5",
        "#22a7f0",
        "#63bff0",
        "#a7d5ed",
        "#e2e2e2",
        "#e1a692",
        "#de6e56",
        "#e14b31",
        "#c23728"
      ]
    }
  },
  sortColumn: {
    col: {
      name: "val"
    },
    index: 0,
    order: "desc"
  },
  ticks: 3,
  timeBinInputVal: "",
  title: "",
  type: "heat",
  width: null,
  hasError: false,
  showColorPopup: false,
  rangeFilter: []
}
let setEliminateNull = false

const crossfilter = {
  dimension: () => ({
    group: () => ({
      reduce: () => ({
        order: noop,
        allAsync: (callback) => callback(null, [])
      }),
      binParams: noop
    }),
    setEliminateNull: (val) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setEliminateNull = val
    }
  })
}

describe("heatChart", () => {
  describe("createHeatChart", () => {
    it("should create and return a heat chart", () => {
      const node = window.document.createElement("DIV")
      const create = createHeatChartAsync(crossfilter, noop)
      return create(spec, node).then((c) => {
        expect(dc.instanceOfChart(c)).toEqual(true)
      })
    })
    it("should reject the creation promise if there is an error", () => {
      const node = window.document.createElement("DIV")
      const create = createHeatChartAsync({}, noop)
      return create(spec, node).catch((error) => {
        expect(Boolean(error)).toEqual(true)
      })
    })
  })
})
