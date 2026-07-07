// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  setDefaultValue,
  createSortByOptions,
  mapStateToProps,
  geoJsonDataSourceFilterFcn
} from "./chart-settings-geojson-dropdown-parent"

describe("Chart Settings GeoJson Dropdown Parent", () => {
  const geoJsonConfig = {
    "countries.json": {
      label: "Countries",
      isTopo: true,
      topoKey: "countries",
      keys: ["name", "iso_a2", "iso_a3"]
    },
    "us-states.json": {
      label: "US State",
      isTopo: false,
      topoKey: "",
      keys: ["name", "abbr"]
    },
    "us-counties.json": {
      label: "US Counties",
      isTopo: true,
      topoKey: "counties",
      keys: ["name", "state", "county", "fips"]
    }
  }

  describe("createSortByOptions", () => {
    it("should create dropdown options based geo Json Config file", () => {
      expect(createSortByOptions(geoJsonConfig)).toStrictEqual([
        {
          label: "Countries",
          value: "countries.json"
        },
        {
          label: "US State",
          value: "us-states.json"
        },
        {
          label: "US Counties",
          value: "us-counties.json"
        }
      ])
    })
  })

  describe("setDefaultValue", () => {
    it("should return one option based on currentGeoJsonValue", () => {
      expect(setDefaultValue(geoJsonConfig, "countries.json")).toStrictEqual({
        label: "Countries",
        value: "countries.json"
      })
    })
    it("should return undefined if no currentGeoJsonValue is null", () => {
      expect(setDefaultValue(geoJsonConfig, null)).toStrictEqual(undefined)
    })
  })

  describe("mapStateToProps", () => {
    it("should get correct options and defaultValue when isPolyRasterEnabled is true and chart is backendChoropleth type", () => {
      expect(
        mapStateToProps(
          {
            dashboard: {
              joinTable: { columnMetadata: [] }
            },
            connection: {
              isPolyRasterEnabled: true
            },
            charts: {
              1: { geoJoin: { column: "test" }, type: "backendChoropleth" }
            },
            joinDataSources: []
          },
          { chartId: "1" }
        )
      ).toEqual(
        expect.objectContaining({
          chartType: "backendChoropleth",
          dataSourceFilterFunc: geoJsonDataSourceFilterFcn,
          isPolyRasterEnabled: true,
          defaultValue: { value: "test", label: "test" },
          options: [],
          geoJoin: { column: "test" }
        })
      )
    })
    it("should get correct options and defaultValue when isPolyRasterEnabled is false and chart is backendChoropleth type", () => {
      expect(
        mapStateToProps(
          {
            dashboard: { joinTable: { columnMetadata: [] } },
            connection: {
              geoJsonConfig: {},
              isPolyRasterEnabled: false
            },
            charts: { 1: { type: "backendChoropleth" } },
            joinDataSources: []
          },
          { chartId: "1" }
        )
      ).toEqual(
        expect.objectContaining({
          chartType: "backendChoropleth",
          dataSourceFilterFunc: null,
          isPolyRasterEnabled: false,
          defaultValue: undefined,
          options: [],
          geoJoin: {}
        })
      )
    })
  })
})
