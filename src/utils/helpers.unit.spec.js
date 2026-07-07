// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import * as Helpers from "./helpers"

describe("Helpers", () => {
  describe("diff", () => {
    const chart = {
      type: "pie",
      title: "Untitled Chart",
      measures: [
        {
          label: "# Records",
          value: "*",
          type: "SMALLINT",
          isRequired: true,
          isError: null,
          aggType: "Count",
          originIndex: 0,
          name: "val",
          inactive: false
        }
      ],
      dimensions: [
        {
          type: "SMALLINT",
          label: "actualelapsedtime",
          value: "actualelapsedtime",
          inactive: false,
          min_val: 12,
          max_val: 1379,
          currentLowValue: 12,
          currentHighValue: 1379,
          maxBinSize: 689,
          autobin: true,
          isRequired: true,
          isError: null
        }
      ],
      binParams: null,
      height: 549,
      width: 384,
      elasticX: true,
      cap: 12,
      othersGrouper: false,
      ticks: 3,
      sortColumn: null,
      color: null
    }

    const nextChart = {
      type: "pie",
      title: "Untitled Chart",
      measures: [
        {
          label: "# Records",
          value: "*",
          type: "SMALLINT",
          isRequired: true,
          isError: null,
          aggType: "Count",
          originIndex: 0,
          name: "val",
          inactive: false
        }
      ],
      dimensions: [
        {
          type: "SMALLINT",
          label: "actualelapsedtime",
          value: "actualelapsedtime",
          inactive: false,
          min_val: 12,
          max_val: 1379,
          currentLowValue: 12,
          currentHighValue: 1379,
          maxBinSize: 689,
          autobin: true,
          isRequired: true,
          isError: null
        }
      ],
      binParams: null,
      height: 497,
      width: 384,
      elasticX: true,
      cap: 12,
      othersGrouper: false,
      ticks: 3,
      sortColumn: null,
      color: null
    }

    it("should only return the diff", () => {
      expect(Helpers.diff(chart, nextChart)).to.eql({ height: 497 })
    })

    it("includes keys added in new chart", () => {
      nextChart.measures.push({ name: "size" })
      expect(Helpers.diff(chart, nextChart)).to.eql({
        height: 497,
        measures: [
          {
            label: "# Records",
            value: "*",
            type: "SMALLINT",
            isRequired: true,
            isError: null,
            aggType: "Count",
            originIndex: 0,
            name: "val",
            inactive: false
          },
          {
            name: "size"
          }
        ]
      })
    })
  })

  describe("#addColNames", () => {
    const { addColNames } = Helpers
    const measures = [
      {
        aggType: "Avg",
        label: "airtime",
        type: "measures",
        value: "airtime"
      },
      {
        aggType: "Avg",
        label: "arrdelay",
        type: "measures",
        value: "arrdelay"
      }
    ]
    it("should return the measures with the names added", () => {
      const result = addColNames(measures)
      result.forEach((measure, i) => {
        expect(measure.name).to.eql(`col${i}`)
      })
    })
  })

  describe("#removeColNames", () => {
    const { removeColNames } = Helpers
    const measures = [
      {
        aggType: "Avg",
        label: "airtime",
        type: "measures",
        value: "airtime",
        name: "col0"
      },
      {
        aggType: "Avg",
        label: "arrdelay",
        type: "measures",
        value: "arrdelay",
        name: "col1"
      }
    ]
    it("should return the measures with the names set to undefined", () => {
      const result = removeColNames(measures)
      result.forEach(measure => {
        expect(measure.name).to.eql(undefined)
      })
    })
  })
})
