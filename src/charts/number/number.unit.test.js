// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createNumberChartAsync } from "./number-chart"
import dc from "services/dc"
import { noop } from "utils/helpers"

const defaultValues = {
  type: "number",
  title: "",
  filters: [],
  measures: [
    {
      isError: false,
      isRequired: false,
      inactive: false,
      name: "val",
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

const crossfilter = {
  groupAll: () => {
    return {
      getCrossfilterId: () => 0,
      reduceMulti: () => ({
        order: noop
      })
    }
  },
  dimension: () => ({
    group: () => ({
      reduce: () => ({
        order: noop
      }),
      binParams: noop
    }),
    groupAll: () => {
      return {
        getCrossfilterId: () => 0,
        reduceMulti: () => ({
          order: noop
        })
      }
    }
  })
}

describe("NumberChart", () => {
  describe("createNumberChart", () => {
    it("should create and return a number chart", () => {
      const node = window.document.createElement("DIV")
      const create = createNumberChartAsync(crossfilter)
      return create(defaultValues, node).then((c) => {
        expect(dc.instanceOfChart(c)).toEqual(true)
      })
    })
    it("should reject the creation promise if there is an error", () => {
      const node = window.document.createElement("DIV")
      const create = createNumberChartAsync({})
      return create(defaultValues, node).catch((error) => {
        expect(Boolean(error)).toEqual(true)
      })
    })
  })
})
