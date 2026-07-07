// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createTableChartAsync } from "./table-chart"
import dc from "services/dc"
import { noop } from "utils/helpers"

const defaultValues = {
  type: "table",
  title: "",
  filters: [],
  measures: [
    {
      isError: false,
      isRequired: false,
      inactive: false,
      name: "val",
      label: "carrier_name",
      value: "carrier_name",
      type: "STRING",
      aggType: "Unique",
      custom: false,
      originIndex: 0
    }
  ],
  dimensions: [],
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
  color: {},
  areFiltersInverse: false,
  geoJson: null
}

let setEliminateNull = false

const crossfilter = {
  filter: noop,
  dimension: () => ({
    projectOn: () => crossfilter.dimension(),
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

describe("tableChart", () => {
  describe("createTableChart", () => {
    it("should create and return a table chart when there are no dimensions", () => {
      const node = window.document.createElement("DIV")
      const create = createTableChartAsync(crossfilter)
      return create(defaultValues, node).then((c) => {
        expect(dc.instanceOfChart(c)).toEqual(true)
      })
    })
    it("should create and return a table chart when there are dimensions", () => {
      const node = window.document.createElement("DIV")
      const create = createTableChartAsync(crossfilter)
      return create(
        Object.assign({}, defaultValues, {
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
          ]
        }),
        node
      ).then((c) => {
        expect(dc.instanceOfChart(c)).toEqual(true)
      })
    })
    it("should reject the creation promise if there is an error", () => {
      const node = window.document.createElement("DIV")
      const create = createTableChartAsync({})
      return create(defaultValues, node).catch((error) => {
        expect(Boolean(error)).toEqual(true)
      })
    })
  })
})
