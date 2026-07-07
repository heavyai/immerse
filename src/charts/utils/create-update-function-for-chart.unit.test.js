// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import proxyquire from "proxyquire"
import {
  shouldNotUpdate,
  createUpdateArray
} from "./create-update-function-for-chart"

let colorChartCalled = false

const createUpdateFunctionForChart = proxyquire(
  "./create-update-function-for-chart",
  {
    "actions/dc-action-creators": {
      redrawAll: () => "REDRAW_ALL",
      redrawChart: () => "REDRAW_CHART",
      renderChart: () => "RENDER_CHART"
    },
    "./color-chart": {
      default: (chart, spec, cb) => {
        colorChartCalled = true
        cb()
      }
    }
  }
).default

describe("createUpdateFunctionForChart", () => {
  let dispatch = null
  let generalUpdate = null
  let specificUpdates = {}
  let dcChart = null

  beforeEach(() => {
    colorChartCalled = false
    dispatch = jest.fn()
    generalUpdate = jest.fn()
    dcChart = {
      height: () => 300,
      width: () => 300
    }
  })

  function runUpdate(...args) {
    return createUpdateFunctionForChart(
      generalUpdate,
      specificUpdates
    )(dispatch)(...args)
  }

  it("should call render chart on width update", () => {
    runUpdate(dcChart, { width: 100 }, {})
    expect(generalUpdate).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
  })

  it("should call render chart on height update", () => {
    runUpdate(dcChart, { height: 100 }, {})
    expect(generalUpdate).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
  })

  it("should call redrawall on empty filter update", () => {
    runUpdate(dcChart, { filters: [] }, {})
    expect(generalUpdate).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
  })

  it("should call redrawall on empty rangeFilter update", () => {
    runUpdate(dcChart, { rangeFilter: [] }, {})
    expect(generalUpdate).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
  })

  it("should apply async update on geoJson change", () => {
    specificUpdates = {
      geoJson: (a, b, c, cb) => cb()
    }
    runUpdate(dcChart, { geoJson: {} }, {})
    expect(dispatch).toHaveBeenCalled()
  })

  it.skip("should call colorChart on measures update", () => {
    runUpdate(dcChart, { measures: [] }, {})
    expect(generalUpdate).toHaveBeenCalled()
    expect(colorChartCalled).toEqual(true)
    expect(dispatch).toHaveBeenCalled()
  })

  describe("shouldNotUpdate", () => {
    const tempDcChart = {
      height: () => 300,
      width: () => 300
    }
    it("should return true if height and width are 0", () => {
      const changes = {
        height: 0,
        width: 0
      }
      const result = shouldNotUpdate(tempDcChart, changes)
      expect(result).toEqual(true)
    })
    it("should return true if height and width are same as dcChart", () => {
      const changes = {
        height: 300,
        width: 300
      }
      const result = shouldNotUpdate(dcChart, changes)
      expect(result).toEqual(true)
    })
    it("should return false if height and width are different than dcChart", () => {
      const changes = {
        height: 255,
        width: 255
      }
      const result = shouldNotUpdate(dcChart, changes)
      expect(result).toEqual(false)
    })
  })

  describe("createUpdateArray", () => {
    it("should arbitrary place keys in array if not rangeFilter and filters in changes", () => {
      const changes = {
        width: 100,
        height: 100
      }
      const result = createUpdateArray(changes)
      expect(result).toStrictEqual(["width", "height"])
    })

    it("should place rangeFilter before filters in array", () => {
      const changes = {
        filters: [0, 100],
        rangeFilter: [0, 100]
      }
      const result = createUpdateArray(changes)
      expect(result).toStrictEqual(["rangeFilter", "filters"])
    })
  })
})
