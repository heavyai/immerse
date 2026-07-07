// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createPieChartAsync } from "./pie-chart"
import dc from "services/dc"
import { noop } from "utils/helpers"

const defaultValues = {
  type: "pie",
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

let setEliminateNull = false

const mockGroup = () => {
  const group = {
    reduce: () => group,
    order: noop,
    binParams: noop,
    topAsync: jest.fn(() => Promise.resolve([]))
  }
  return group
}

const mockDimension = () => {
  const dimension = {
    group: mockGroup,
    getDimensionName: jest.fn(() => "dest"),
    value: jest.fn(() => dimension),
    filter: jest.fn(() => dimension),
    filterMulti: jest.fn(() => dimension),
    filterAll: jest.fn(() => dimension),
    setEliminateNull: (val) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setEliminateNull = val
    }
  }
  return dimension
}

const crossfilter = {
  dimension: mockDimension
}

describe("pieChart", () => {
  describe("createPieChart", () => {
    it("should create and return a row chart", () => {
      const node = window.document.createElement("DIV")
      const create = createPieChartAsync(crossfilter)
      return create(defaultValues, node).then((c) => {
        expect(dc.instanceOfChart(c)).toEqual(true)
      })
    })
    it("should reject the creation promise if there is an error", () => {
      const node = window.document.createElement("DIV")
      const create = createPieChartAsync({})
      return create(defaultValues, node).catch((error) => {
        expect(Boolean(error)).toEqual(true)
      })
    })
  })
})
