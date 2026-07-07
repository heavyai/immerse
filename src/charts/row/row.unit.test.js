// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createRowChartAsync, updateRowChart } from "./row-chart"
import dc from "services/dc"
import { noop } from "utils/helpers"

const defaultValues = {
  type: "row",
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
  height: 494,
  width: 486,
  elasticX: true,
  cap: 100,
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
    key: "mapD",
    val: ["#22A7F0", "#3ad6cd", "#d4e666"]
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

describe("rowChart", () => {
  describe("createRowChart", () => {
    it("should create and return a row chart", () => {
      const node = window.document.createElement("DIV")
      const create = createRowChartAsync(crossfilter)
      return create(defaultValues, node).then((c) => {
        chart = c
        expect(dc.instanceOfChart(c)).toEqual(true)
      })
    })
    it("should reject the creation promise if there is an error", () => {
      const node = window.document.createElement("DIV")
      const create = createRowChartAsync({})
      return create(defaultValues, node).catch((error) => {
        expect(Boolean(error)).toEqual(true)
      })
    })
  })

  describe("updateRowChart", () => {
    const update = updateRowChart(() => {})

    beforeEach(() => {
      chart.measureLabelsOn = jest.fn()
    })

    it("should handle change of height to 0", () => {
      update(chart, { height: 0 }, defaultValues)
      expect(chart.measureLabelsOn).toHaveBeenCalledWith(false)
    })

    it("should handle change of height greater than 0", () => {
      update(chart, { height: 500 }, defaultValues)
      expect(chart.measureLabelsOn).toHaveBeenCalledWith(true)
    })

    it("should handle change of width to 0", () => {
      update(chart, { width: 0 }, defaultValues)
      expect(chart.measureLabelsOn).toHaveBeenCalledWith(false)
    })

    it("should handle change of width greater than 0", () => {
      update(chart, { width: 500 }, defaultValues)
      expect(chart.measureLabelsOn).toHaveBeenCalledWith(true)
    })
  })
})
