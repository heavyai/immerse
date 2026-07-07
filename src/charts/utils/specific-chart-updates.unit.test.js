// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import specificChartUpdates from "charts/utils/specific-chart-updates"
import { mapBinnedDimensions } from "utils/map-binned-dimensions"

describe("specificChartUpdates", () => {
  const chart = {}

  const sortColumn = {
    col: {
      name: "val"
    },
    index: 0,
    order: "asc"
  }

  const measures = [
    {
      name: "val"
    }
  ]

  const dimensions = [{}, {}]

  describe("dimensions", () => {
    beforeEach(() => {
      chart.expireCache = jest.fn()
      chart.group = () => chart
      chart.binParams = jest.fn()
      chart.setBinParams = chart.binParams
    })

    it("calls the appropriate chart dimension methods", () => {
      const transformation = mapBinnedDimensions(dimensions)
      specificChartUpdates.dimensions(chart, { dimensions })
      expect(chart.setBinParams).toHaveBeenCalledWith(transformation)
      expect(chart.expireCache).toHaveBeenCalled()
    })
  })

  describe("sortColumn", () => {
    beforeEach(() => {
      chart.expireCache = jest.fn()
      chart.group = () => chart
      chart.order = jest.fn()
      chart.ordering = jest.fn()
    })

    it("updates the chart sorting from the diff", () => {
      specificChartUpdates.sortColumn(chart, { sortColumn }, { measures })
      expect(chart.expireCache).toHaveBeenCalled()
      expect(chart.order).toHaveBeenCalledWith(sortColumn.col.name)
      expect(chart.ordering).toHaveBeenCalledWith(sortColumn.order)
    })

    it("accepts a empty object as diff", () => {
      specificChartUpdates.sortColumn(chart, {}, { measures })
      expect(chart.expireCache).toHaveBeenCalled()
      expect(chart.ordering).toHaveBeenCalledWith(undefined)
    })

    it("does not order if sortColumn is not in measures", () => {
      const removedSortColumn = Object.assign({}, sortColumn, {
        col: { name: "color" }
      })

      specificChartUpdates.sortColumn(
        chart,
        { sortColumn: removedSortColumn },
        { measures }
      )

      expect(chart.order).not.toHaveBeenLastCalledWith(sortColumn.col.name)
    })
  })

  describe("ordering", () => {
    beforeEach(() => {
      chart.ordering = jest.fn()
    })

    it("updates the chart ordering from the diff", () => {
      specificChartUpdates.ordering(chart, { sortColumn })
      expect(chart.ordering).toHaveBeenCalledWith("asc")
    })
  })

  describe("ticks", () => {
    beforeEach(() => {
      chart.xAxis = () => chart
      chart.ticks = jest.fn()
    })

    it("updates ticks on chart from diff", () => {
      specificChartUpdates.ticks(chart, { ticks: 10 })
      expect(chart.ticks).toHaveBeenCalledWith(10)
    })
  })

  describe("colorDomain", () => {
    beforeEach(() => {
      chart.colorDomain = jest.fn()
    })

    it("calls colorDomain to update colorDomain", () => {
      specificChartUpdates.colorDomain(chart, { colorDomain: ["#ff0000"] })
      expect(chart.colorDomain).toHaveBeenCalledWith(["#ff0000"])
    })

    it("calls does not call colorDomain if colorDomain no present in diff", () => {
      specificChartUpdates.colorDomain(chart, { fooo: ["#ff0000"] })
      expect(chart.colorDomain).not.toHaveBeenCalled()
    })
  })

  describe("filters", () => {
    beforeEach(() => {
      chart.filterAll = jest.fn()
    })

    it("calls filterAll when there are no filters", () => {
      specificChartUpdates.filters(chart, { filters: [] })
      expect(chart.filterAll).toHaveBeenCalled()
    })

    it("does not call filterAll when filters are present", () => {
      specificChartUpdates.filters(chart, { filters: ["bar"] })
      expect(chart.filterAll).not.toHaveBeenCalled()
    })
  })

  describe("rangeFilter", () => {
    beforeEach(() => {
      chart.filterAll = jest.fn()
      chart.rangeChart = () => chart
    })

    it("calls filterAll when there are no filters", () => {
      specificChartUpdates.rangeFilter(chart, { rangeFilter: [] })
      expect(chart.filterAll).toHaveBeenCalled()
    })

    it("does not call filterAll when filters are present", () => {
      specificChartUpdates.rangeFilter(chart, { rangeFilter: ["bar"] })
      expect(chart.filterAll).not.toHaveBeenCalled()
    })
  })
})
