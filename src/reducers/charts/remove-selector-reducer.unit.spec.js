// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import removeSelectorReducer, {
  isFiniteSelector,
  maybeRemoveOrClearSelector,
  maybeRemoveColorDomainAndRange
} from "./remove-selector-reducer"
import { CHARTS_DEFAULT_COLORS, getColors } from "services/colors"

describe("Remove selector reducer", () => {
  const state = {
    [1]: {
      type: "table",
      dimensions: [{ value: "dest_city" }, { value: "lat" }, {}],
      measures: [
        { name: "color", value: "arrtime" },
        { name: "val", value: "dest" },
        {}
      ],
      savedColors: {}
    },
    [2]: {
      type: "row",
      sortColumn: {
        col: { name: "key0" }
      },
      dimensions: [{ value: "dest_city" }, { value: "lat" }, {}],
      measures: [{ name: "color", value: "arrtime" }, {}],
      savedColors: {}
    },
    [3]: {
      type: "row",
      sortColumn: {
        col: { name: "key1" }
      },
      dimensions: [{ value: "dest_city" }, { value: "lat" }, {}],
      measures: [{ name: "color", value: "arrtime" }, {}],
      savedColors: {}
    },
    [4]: {
      type: "row",
      sortColumn: {
        col: { name: "color" }
      },
      dimensions: [{ value: "dest_city" }, { value: "lat" }, {}],
      measures: [{ name: "color", value: "arrtime" }, {}],
      savedColors: {}
    }
  }

  it("should reset sort column name to key0 when removed index equals key index", () => {
    expect(
      removeSelectorReducer(state, {
        chartId: "3",
        selectorType: "dimensions",
        selectorIndex: 1
      })[3].sortColumn.col.name
    ).to.deep.equal("key0")

    expect(
      removeSelectorReducer(state, {
        chartId: "1",
        selectorType: "measures",
        selectorIndex: 1
      })[3].sortColumn.col.name
    ).to.deep.equal("key1")
  })

  it("should reset sort column name to key0 when selector is color measure", () => {
    expect(
      removeSelectorReducer(state, {
        chartId: "4",
        selectorType: "measures",
        selectorIndex: 1
      })[4].sortColumn.col.name
    ).to.deep.equal("key0")
  })

  it("should set selector empty but keep the name if there is a name", () => {
    const nextState = removeSelectorReducer(state, {
      chartId: "1",
      selectorType: "measures",
      selectorIndex: 1
    })

    expect(nextState[1].measures[0].name).to.deep.equal("color")
  })

  it("should remove the selector if there is no name", () => {
    const nextState = removeSelectorReducer(state, {
      chartId: "1",
      selectorType: "dimensions",
      selectorIndex: 1
    })

    expect(nextState[1].dimensions).to.deep.equal([{ value: "dest_city" }, {}])
  })

  it("should not remove the selector is there is no name but the selector is required", () => {
    const histogramState = {
      [1]: {
        type: "histogram",
        dimensions: [{ value: "arr" }],
        measures: [{ name: "val", value: "all" }],
        savedColors: {}
      }
    }

    const nextState = removeSelectorReducer(histogramState, {
      chartId: "1",
      selectorType: "dimensions",
      selectorIndex: 0
    })

    const nextDimensions = nextState[1].dimensions

    expect(nextDimensions.length).to.eql(1)
    expect(nextDimensions[0]).to.deep.equal({})
  })

  it('should remove the color value on the chart it the selector removed is named "color"', () => {
    const pieState = {
      [1]: {
        type: "pie",
        color: { type: "quantitative" },
        savedColors: {},
        dimensions: [{ value: "arr" }],
        measures: [
          { name: "val", value: "all" },
          { name: "color", value: "all" }
        ]
      }
    }

    const nextState = removeSelectorReducer(pieState, {
      chartId: "1",
      selectorType: "measures",
      selectorIndex: 1
    })
    expect(nextState[1].color).to.deep.equal({
      ...getColors(CHARTS_DEFAULT_COLORS)["pie"],
      customDomain: [],
      customRange: [],
      domainIsDirty: false
    })
  })
})

describe("removeSelector Reducer helpers", () => {
  describe("isFiniteSelector Helper Function", () => {
    it("should return whether or not a dimension is finite", () => {
      expect(isFiniteSelector("dimensions", "table")).to.eql(false)
      expect(isFiniteSelector("dimensions", "pie")).to.eql(false)
      expect(isFiniteSelector("dimensions", "line")).to.eql(true)
    })

    it("should return whether or not a measure is finite", () => {
      expect(isFiniteSelector("measures", "table")).to.eql(false)
      expect(isFiniteSelector("measures", "pie")).to.eql(true)
      expect(isFiniteSelector("measures", "line")).to.eql(true)
      expect(isFiniteSelector("measures", "line2")).to.eql(false)
    })

    it("should default to false if invalid selectorType", () => {
      expect(isFiniteSelector("invalidType", "table")).to.eql(false)
    })
  })

  describe("maybeRemoveOrClearSelector Helper Function", () => {
    it("should set selector empty if selector is finite", () => {
      const reducer = maybeRemoveOrClearSelector("1", "pie", {
        index: 1,
        type: "measures",
        inactive: false
      })
      const nextState = reducer({
        [1]: {
          type: "table",
          measures: [
            { name: "color", value: "arrtime" },
            { name: "val", value: "dest" },
            {}
          ]
        }
      })

      expect(nextState[1].measures[1]).to.deep.equal({ name: "val" })
    })

    it("should remove selector if selector is infinite", () => {
      const reducer = maybeRemoveOrClearSelector("1", "table", {
        index: 1,
        type: "dimensions",
        inactive: false
      })
      const nextState = reducer({
        [1]: {
          type: "table",
          dimensions: [{ value: "dest_city" }, { value: "lat" }, {}]
        }
      })

      expect(nextState[1].dimensions).to.deep.equal([
        { value: "dest_city" },
        {}
      ])
    })

    it("should remove selector and update originIndex if selector is infinite and a measure", () => {
      const reducer = maybeRemoveOrClearSelector("1", "table", {
        index: 0,
        type: "measures",
        inactive: false
      })
      const nextState = reducer({
        [1]: {
          type: "table",
          measures: [
            { value: "lon", originIndex: 0 },
            { value: "lat", originIndex: 1 },
            {}
          ]
        }
      })

      expect(nextState[1].measures).to.deep.equal([
        { value: "lat", originIndex: 0 },
        {}
      ])
    })

    it("should remove the selector if it is inactive", () => {
      const reducer = maybeRemoveOrClearSelector("1", "pie", {
        index: 1,
        type: "measures",
        inactive: true
      })
      const nextState = reducer({
        [1]: {
          type: "table",
          measures: [
            { name: "color", value: "arrtime" },
            { name: "val", value: "dest" },
            {}
          ]
        }
      })

      expect(nextState[1].measures[1]).to.deep.equal({})
      expect(nextState[1].measures.length).equal(2)
    })
  })

  describe("Maybe Remove Color Domain", () => {
    const chartState = {
      [1]: {
        colorDomain: [1, 1000]
      }
    }

    it("should remove color domain when removing a dimension", () => {
      const nextState = maybeRemoveColorDomainAndRange(
        1,
        null,
        "dimensions"
      )(chartState)
      expect(nextState[1].colorDomain).to.eql(null)
    })

    it("should remove color domain when removing a color measure", () => {
      const nextState = maybeRemoveColorDomainAndRange(
        1,
        "color",
        "measures"
      )(chartState)
      expect(nextState[1].colorDomain).to.eql(null)
    })

    it("should not remove color domain when removing a value measure", () => {
      const nextState = maybeRemoveColorDomainAndRange(
        1,
        "value",
        "measures"
      )(chartState)
      expect(nextState[1].colorDomain).to.deep.equal([1, 1000])
    })
  })
})
