// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"

import { updateRasterChart } from "charts/raster-chart/raster-chart-actions"
import { BASEMAP_OPTIONS, DEFAULT_BASEMAP } from "constants/charts"

import {
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
} from "./chart-settings-basemap-dropdown-parent"
import ChartSettingsBasemapDropdown from "./chart-settings-basemap-dropdown"

describe("Chart settings basemap dropdown", () => {
  describe("mapStateToProps", () => {
    const state = {
      charts: {
        1: {},
        2: { basemap: BASEMAP_OPTIONS[1], type: "choropleth" }
      },
      connection: {
        user: {
          mapboxCustomStyles: []
        }
      }
    }

    it("should return default basemap", () => {
      const props = mapStateToProps(state, { chartId: "1" })
      expect(props.basemap).toStrictEqual(DEFAULT_BASEMAP)
    })

    it("should return basemap from state", () => {
      const props = mapStateToProps(state, { chartId: "2" })
      expect(props.basemap).toStrictEqual(state.charts["2"].basemap)
    })

    it("should return a list of basemaps", () => {
      const props = mapStateToProps(state, { chartId: "2" })
      expect(props.options).toStrictEqual(BASEMAP_OPTIONS)
    })
  })

  describe("mapDispatchToProps", () => {
    it("should dispatch updateRasterChart when chartType is not choropleth", () => {
      const dispatch = jest.fn()
      const props = mapDispatchToProps(dispatch, {
        chartId: "1",
        chartType: "geoheat"
      })
      const option = BASEMAP_OPTIONS[1]

      props.updateBasemap(option.value, option)

      const dispatched = dispatch.mock.calls[0][0]
      expect(dispatched).toEqual(updateRasterChart("1", { basemap: option }))
    })

    it("should dispatch updateChart when chartType is choropleth", () => {
      const dispatch = jest.fn()
      const props = mapDispatchToProps(dispatch, {
        chartId: "2",
        chartType: "choropleth"
      })
      const option = BASEMAP_OPTIONS[2]

      props.updateBasemap(option.value, option)

      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(typeof dispatch.mock.calls[0][0]).toBe("function")
    })
  })

  describe("mergeProps", () => {
    it("should return a basemap and updateBasemap function as a prop", () => {
      const updateBasemap = jest.fn()
      const props = mergeProps({ basemap: DEFAULT_BASEMAP }, { updateBasemap })
      expect(props.basemap).toStrictEqual(DEFAULT_BASEMAP)
    })
  })

  describe("Basemap Dropdown Component", () => {
    const props = {
      chartId: "1",
      options: BASEMAP_OPTIONS,
      basemap: BASEMAP_OPTIONS[2],
      preview: BASEMAP_OPTIONS[2],
      updateBasemap: jest.fn(),
      onOptionHover: jest.fn(),
      onOptionOut: jest.fn()
    }

    it("should be initialize with current basemap value", () => {
      const { getByTestId } = render(
        <ChartSettingsBasemapDropdown {...props} />
      )
      const selector = getByTestId("basemap-selector")

      expect(selector.querySelector(".basemap-dropdown")).not.toBeNull()
    })
  })
})
