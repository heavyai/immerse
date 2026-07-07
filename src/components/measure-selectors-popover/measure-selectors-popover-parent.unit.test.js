// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import "startup"
import {
  mapStateToProps,
  maybeFilterMeasures,
  usesAggType,
  numValues
} from "./measure-selectors-popover-parent"
import { CHARTS } from "constants/charts"
const some = (f) => (truthiness, value) => truthiness || f(value)

describe("MeasuresPopover Container", () => {
  describe("maybeFilterMeasures", () => {
    it.skip("filters out array columns if specified in CHARTS", () => {
      const columns = [{ type: "STR", is_array: true }]
      expect(CHARTS.line.measures[0]).not.to.have.property("type")
      expect(
        maybeFilterMeasures("line", {}, "series_1")(columns)
      ).toStrictEqual(columns)
      expect(CHARTS.pointmap.measures[3].type.noArrays).to.eq(true)
      expect(
        maybeFilterMeasures("pointmap", {}, "color")(columns)
      ).toStrictEqual([])
    })

    it("filters out non-dict encoded strings for all charts except table", () => {
      const columns = [{ type: "STR", is_dict: false }]
      expect(maybeFilterMeasures("table", {}, "col0")(columns)).toStrictEqual(
        columns
      )
      expect(
        maybeFilterMeasures("pointmap", {}, "color")(columns)
      ).toStrictEqual([])
    })
  })

  describe("helpers", () => {
    describe("usesAggType", () => {
      it("should return false if selector has star * value", () => {
        const dimensions = [{ value: "test" }]
        const selector = { type: "INT", value: "*" }
        expect(usesAggType(selector, dimensions)).toEqual(false)
      })

      it("should return false if dimensions have no value", () => {
        const dimensions = [{ value: null }]
        const selector = { type: "INT", value: "test" }
        expect(usesAggType(selector, dimensions)).toEqual(false)
      })

      it("should return true if dimensions have no value, but is a number chart", () => {
        const dimensions = [{ value: null }]
        const selector = { type: "INT", value: "test" }
        const chartType = "number"
        expect(usesAggType(selector, dimensions, chartType)).toEqual(true)
      })

      it("should return false if selector type is STR", () => {
        const dimensions = [{ value: "test" }]
        const selector = { type: "STR", value: "test" }
        expect(usesAggType(selector, dimensions)).toEqual(false)
      })

      it("should return false if selector type is BOOL", () => {
        const dimensions = [{ value: "test" }]
        const selector = { type: "BOOL", value: "test" }
        expect(usesAggType(selector, dimensions)).toEqual(false)
      })

      it("should return true if the above are all true", () => {
        const dimensions = [{ value: "test" }]
        const selector = { type: "INT", value: "test" }
        expect(usesAggType(selector, dimensions)).toEqual(true)
      })
    })
  })

  describe("Computed Props", () => {
    const columnMetadata = [
      { name: "test", type: "TIMESTAMP" },
      { name: "test", type: "FLOAT" },
      { name: "test1", type: "STR", is_dict: true },
      { name: "test1", type: "STR", is_array: true }
    ]

    const state = {
      charts: {
        1: {
          dataSource: "flights",
          type: "table",
          dimensions: [],
          measures: []
        }
      },
      dashboard: {
        dataSources: {
          flights: {
            columnMetadata
          }
        }
      }
    }

    const props = {
      chartId: "1",
      dataSource: "flights",
      selector: {
        value: "test"
      },
      addCustomMeasure: () => {},
      addCustomPostFilter: {},
      closeCustomSelector: () => {},
      index: 0,
      isDropdownOpen: false,
      options: [{ value: "test-value" }],
      shouldShowAggTypeSelector: false,
      onClose: () => {}
    }

    const mappedProps = mapStateToProps(state, props)
    const { options } = mappedProps

    const nextState = {
      charts: {
        1: {
          type: "row",
          dimensions: [{ value: "test" }, { value: "test" }],
          measures: []
        }
      },
      dashboard: {
        dataSources: {
          flights: {
            columnMetadata
          }
        }
      }
    }

    const nextProps = mapStateToProps(nextState, props)

    const nextNextProps = mapStateToProps(
      nextState,
      Object.assign({}, props, {
        selector: {
          value: "*"
        }
      })
    )

    describe("options", () => {
      it("should only add an # Records option if there are dimensions on table", () => {
        const isAllRow = ({ label }) => {
          return label === "# Records"
        }
        expect(options.reduce(some(isAllRow), false)).toEqual(false)
        expect(nextProps.options[1].label).toEqual("# Records")
      })

      it("includes time options and non-dict strings only for table without dimensions", () => {
        expect(mapStateToProps(state, props).options).toStrictEqual([
          {
            label: "Custom SQL Measure",
            type: "CUSTOM",
            value: "*CustomMeasure*"
          },
          { name: "test", type: "TIMESTAMP" },
          { name: "test", type: "FLOAT" },
          { name: "test1", type: "STR", is_dict: true },
          { is_array: true, name: "test1", type: "STR" }
        ])
        state.charts[1].type = "row"
        expect(mapStateToProps(state, props).options).toStrictEqual([
          {
            label: "Custom SQL Measure",
            type: "CUSTOM",
            value: "*CustomMeasure*"
          },
          { label: "# Records", type: "SMALLINT", value: "*" },
          { name: "test", type: "FLOAT" },
          { name: "test1", type: "STR", is_dict: true }
        ])
        state.charts[1].dimensions.push({ value: "a dim" })
        expect(mapStateToProps(state, props).options).toStrictEqual([
          {
            label: "Custom SQL Measure",
            type: "CUSTOM",
            value: "*CustomMeasure*"
          },
          { label: "# Records", type: "SMALLINT", value: "*" },
          { name: "test", type: "FLOAT" },
          { name: "test1", type: "STR", is_dict: true }
        ])
      })
    })

    describe("shouldShowAggTypeSelector", () => {
      it("should be true if the measure has a value and that value is not * and if there are dimensions", () => {
        expect(mappedProps.shouldShowAggTypeSelector).toEqual(false)
        expect(nextProps.shouldShowAggTypeSelector).toEqual(true)
        expect(nextNextProps.shouldShowAggTypeSelector).toEqual(false)
      })
    })

    describe("numValues", () => {
      it("should return number of selectors that have values", () => {
        const result = numValues([{ value: "dest" }])
        expect(result).toEqual(1)
      })

      it("should remove values that are null", () => {
        const result = numValues([{ value: "dest" }, { value: null }])
        expect(result).toEqual(1)
      })
    })
  })
})
