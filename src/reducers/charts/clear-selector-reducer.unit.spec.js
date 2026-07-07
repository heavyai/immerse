// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import clearSelectorREducer from "./clear-selector-reducer"
import { CHARTS_DEFAULT_COLORS, getColors } from "services/colors"

describe("removeSelector Reducer", () => {
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
    }
  }

  it("should set selector empty but keep the name if there is a name", () => {
    const nextState = clearSelectorREducer(state, {
      chartId: "1",
      selectorType: "measures",
      selectorIndex: 1
    })

    expect(nextState[1].measures[0].name).to.deep.equal("color")
  })

  it("should clear the selector", () => {
    const histogramState = {
      [1]: {
        type: "histogram",
        dimensions: [{ value: "arr" }],
        measures: [{ name: "val", value: "all" }],
        savedColors: {}
      }
    }

    const nextState = clearSelectorREducer(histogramState, {
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
        dimensions: [{ value: "arr" }],
        measures: [
          { name: "val", value: "all" },
          { name: "color", value: "all" }
        ],
        savedColors: {}
      }
    }

    const nextState = clearSelectorREducer(pieState, {
      chartId: "1",
      selectorType: "measures",
      selectorIndex: 1
    })

    expect(nextState[1].color).to.deep.equal(
      getColors(CHARTS_DEFAULT_COLORS)["pie"]
    )
  })
})
