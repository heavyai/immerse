// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { buildRasterExportSql } from "./raster-sql"

import Services from "services/immerse"

import store from "store/store"
import {
  pointMapChart,
  boundingBoxFilter,
  destinationFilter,
  backendScatterChart
} from "./fixtures"

describe("Raster SQL", () => {
  describe("buildRasterExportSql", () => {
    const chartKey = "2"
    const limit = 100
    const layerIndex = 0

    beforeAll(() => {
      jest.spyOn(store, "getState").mockReturnValue({
        charts: {
          [chartKey]: pointMapChart
        },
        omnifilters: []
      })
      Services.set("dc", {
        getChart: () => pointMapChart
      })
      Services.set("crossfilter", {
        getCrossfilter: () => ({
          getGlobalFilter: () => [],
          dimension: () => ({
            crossfilter: {
              getId: () => "thing_id",
              getTables: () => ["ships_ais"],
              getDataSource: () => "ships_ais"
            }
          })
        })
      })
    })

    it("should build the most basic query", () => {
      const sql = buildRasterExportSql(
        chartKey,
        pointMapChart,
        layerIndex,
        limit
      )
      expect(sql).toBe(
        `SELECT /*+ cpu_mode */ ST_SetSRID(ST_Point(Longitude, Latitude), 4326) AS location_longitude_latitude, VesselLength AS vessel_length, Destination AS destination FROM ships_ais LIMIT ${limit}`
      )
    })

    it("should build query with global filters", () => {
      store.getState.mockReturnValue({
        charts: {
          [chartKey]: pointMapChart
        },
        omnifilters: [destinationFilter]
      })
      const sql = buildRasterExportSql(
        chartKey,
        pointMapChart,
        layerIndex,
        limit
      )
      expect(sql).toBe(
        `SELECT /*+ cpu_mode */ ST_SetSRID(ST_Point(Longitude, Latitude), 4326) AS location_longitude_latitude, VesselLength AS vessel_length, Destination AS destination FROM ships_ais WHERE (Destination = 'GREEN BAY WI') LIMIT ${limit}`
      )
    })

    it("should build query with global and bounding box filters", () => {
      store.getState.mockReturnValue({
        charts: {
          [chartKey]: pointMapChart
        },
        omnifilters: [destinationFilter, boundingBoxFilter]
      })
      const sql = buildRasterExportSql(
        chartKey,
        pointMapChart,
        layerIndex,
        limit
      )
      expect(sql).toBe(
        `SELECT /*+ cpu_mode */ ST_SetSRID(ST_Point(Longitude, Latitude), 4326) AS location_longitude_latitude, VesselLength AS vessel_length, Destination AS destination FROM ships_ais WHERE ((Longitude is not null\n          AND Latitude is not null\n          AND Longitude >= -94.08246756 AND Longitude <= -77.719252451 AND Latitude >= 39.117446433 AND Latitude <= 47.913364836)) AND (Destination = 'GREEN BAY WI') LIMIT ${limit}`
      )
    })
    it("should build export sql for backend scatter chart", () => {
      store.getState.mockReturnValue({
        charts: {
          [chartKey]: backendScatterChart
        },
        omnifilters: []
      })
      Services.set("dc", {
        getChart: () => backendScatterChart
      })
      const sql = buildRasterExportSql(chartKey, backendScatterChart, 0, limit)
      expect(sql).toEqual(
        "SELECT VesselWidth AS vessel_width, VesselLength AS vessel_length, Cargo AS cargo, VesselType AS vessel_type FROM ships_ais LIMIT 100"
      )
    })
  })
})
