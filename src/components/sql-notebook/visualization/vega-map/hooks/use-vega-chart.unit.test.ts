// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable init-declarations */
import { renderHook } from "@testing-library/react-hooks/dom"
import { useVegaChart } from "./use-vega-chart"
import { MapSettings } from "../types"
import { ViewState } from "react-map-gl"
import { ChartTypes, VegaTypeMap } from "components/sql-notebook/types"
import Services from "services/immerse"
import { waitFor } from "@testing-library/react"
import { LAYER_TYPE } from "../constants"
import { POINT_RENDER_LIMIT } from "components/sql-notebook/constants"

describe("useVegaChart", () => {
  let viewState: ViewState
  let mapSettings: MapSettings
  const dbCon = Services.get("DbCon")
  let queryAsyncSpy: jest.SpyInstance
  const rasterQueryLimitExpression = (limit = POINT_RENDER_LIMIT) =>
    new RegExp(String.raw`.*LIMIT ${limit}.*`)

  describe("Point Map", () => {
    const query = `
      SELECT
      lat,
      lon,
      state_abbr,
      join_time,
      lang,
      tweet_count,
      followers,
      followees,
      county_state,
      admin1
    FROM
      tweets_nov_feb
    `

    beforeEach(() => {
      queryAsyncSpy = jest.spyOn(dbCon, "queryAsync")
      mapSettings = {
        type: ChartTypes.POINT_MAP,
        query,
        latField: {
          field: "lat",
          type: VegaTypeMap.LATITUDE,
          required: true,
          active: true
        },
        lonField: {
          field: "lon",
          type: VegaTypeMap.LONGITUDE,
          required: true,
          active: true
        },
        colorField: {
          field: "",
          type: VegaTypeMap.NUMBER,
          active: false,
          required: false
        },
        sizeField: {
          field: "",
          type: VegaTypeMap.NUMBER,
          active: false,
          required: false
        },
        settings: {
          pointSize: 3,
          dotDensity: false
        }
      }
      viewState = {
        latitude: 80,
        longitude: 120,
        zoom: 10,
        height: 500,
        width: 500
      }
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it("should create spec with no color or size measure", () => {
      const { result } = renderHook(() =>
        useVegaChart(LAYER_TYPE.POINT, mapSettings, viewState)
      )

      expect(result.current.error).toBeNull()
      const spec = result.current.vegaSpec
      // Should limit original query
      expect(spec.data[0].sql).toMatch(rasterQueryLimitExpression())
      expect(spec.marks.length).toBe(1)
      // No extra data blocks for color/size
      expect(spec.data.length).toBe(1)
      const mark = spec.marks[0]
      expect(mark.properties.height).toBe(3) // No size measure
      expect(mark.properties.fillColor).toBe("#27aeef")

      expect(mark.properties.xc.field).toBe("lon")
      expect(mark.properties.yc.field).toBe("lat")
    })

    it("should create spec with numeric color measure", async () => {
      queryAsyncSpy.mockResolvedValue([0, 100])
      mapSettings.colorField = {
        field: "tweet_count",
        type: VegaTypeMap.NUMBER,
        active: true,
        required: false
      }
      const { result } = renderHook(() =>
        useVegaChart(LAYER_TYPE.POINT, mapSettings, viewState)
      )

      // Waits for a result, gets domains/etc asynchronously
      await waitFor(() => {
        expect(result.current.vegaSpec.data.length).toBe(2)
        expect(queryAsyncSpy).toHaveBeenCalledTimes(1)
      })

      expect(result.current.error).toBeNull()
      const spec = result.current.vegaSpec
      expect(spec.marks.length).toBe(1)
      const mark = spec.marks[0]
      expect(mark.properties.height).toBe(3) // No size measure
      expect(mark.properties.fillColor).toEqual({
        field: "tweet_count",
        scale: `${LAYER_TYPE.POINT}_fillColor`
      })
      expect(spec.scales.length).toBe(1)
      const colorScale = spec.scales[0]
      // Marks properly reference color scale
      expect(colorScale.name).toBe(mark.properties.fillColor.scale)
      // Domain === range length for color scale
      expect(colorScale.domain.fields.length).toBe(colorScale.range.length)

      // Color data should exist
      expect(spec.data.find((d) => d.name === "points_stats"))
    })

    it("should create a spec with string color measure", async () => {
      queryAsyncSpy.mockResolvedValue(["A", "B", "C", "D"])
      const field = "state_abbr"
      mapSettings.colorField = {
        field,
        type: VegaTypeMap.STRING,
        active: true,
        required: false
      }
      const { result } = renderHook(() =>
        useVegaChart(LAYER_TYPE.POINT, mapSettings, viewState)
      )
      await waitFor(() => {
        expect(queryAsyncSpy).toHaveBeenCalled()
        expect(result.current.vegaSpec).not.toBeNull()
      })

      expect(result.current.error).toBeNull()
      const spec = result.current.vegaSpec
      expect(spec.marks.length).toBe(1)
      const mark = spec.marks[0]
      expect(mark.properties.height).toBe(3) // No size measure
      expect(mark.properties.fillColor).toEqual({
        field,
        scale: `${LAYER_TYPE.POINT}_fillColor`
      })

      // Color data should exist
      expect(spec.scales.length).toBe(1)
      const colorScale = spec.scales.find(
        (d) => d.name === `${LAYER_TYPE.POINT}_fillColor`
      )
      // Marks properly reference color scale
      expect(colorScale.name).toBe(mark.properties.fillColor.scale)
      // Domain === range length for color scale
      expect(colorScale.domain.length).toBe(colorScale.range.length)
    })

    it("should create spec with numeric color and size scales", async () => {
      queryAsyncSpy.mockResolvedValue(["A", "B", "C", "D"])
      mapSettings.colorField = {
        field: "tweet_count",
        type: VegaTypeMap.NUMBER,
        active: true,
        required: false
      }
      mapSettings.sizeField = {
        field: "followers",
        type: VegaTypeMap.NUMBER,
        active: true,
        required: false
      }
      const { result } = renderHook(() =>
        useVegaChart(LAYER_TYPE.POINT, mapSettings, viewState)
      )
      await waitFor(() => {
        expect(queryAsyncSpy).toHaveBeenCalled()
        expect(result.current.vegaSpec).not.toBeNull()
      })

      expect(result.current.error).toBeNull()
      const spec = result.current.vegaSpec
      // Query, color data, size data
      expect(spec.data.length).toBe(3)
      expect(spec.marks.length).toBe(1)
      const mark = spec.marks[0]
      expect(mark.properties.fillColor.field).toEqual("tweet_count")

      expect(spec.scales.length).toBe(2)
      const colorScale = spec.scales.find(
        (s) => s.name === `${LAYER_TYPE.POINT}_fillColor`
      )
      const sizeScale = spec.scales.find(
        (s) => s.name === `${LAYER_TYPE.POINT}_size`
      )
      expect(sizeScale).toBeDefined()
      expect(mark.properties.height.scale).toEqual(sizeScale.name)
      expect(mark.properties.width.scale).toEqual(sizeScale.name)

      // Marks properly reference color scale
      expect(colorScale.name).toBe(mark.properties.fillColor.scale)
      expect(colorScale.domain.fields.length).toBe(colorScale.range.length)
    })

    it("should create a spec with string color + numeric size measure", async () => {
      queryAsyncSpy.mockResolvedValue(["A", "B", "C", "D"])
      mapSettings.colorField = {
        field: "state_abbr",
        type: VegaTypeMap.STRING,
        active: true,
        required: false
      }
      mapSettings.sizeField = {
        field: "followers",
        type: VegaTypeMap.NUMBER,
        active: true,
        required: false
      }
      const { result } = renderHook(() =>
        useVegaChart(LAYER_TYPE.POINT, mapSettings, viewState)
      )
      await waitFor(() => {
        expect(queryAsyncSpy).toHaveBeenCalled()
        expect(result.current.vegaSpec).not.toBeNull()
        expect(result.current.vegaSpec.data.length).toBe(2)
      })

      expect(result.current.error).toBeNull()
      const spec = result.current.vegaSpec

      // Data + size stats, no color data tho
      expect(spec.data.length).toBe(2)
      // Color and size scales still present
      expect(spec.scales.length).toBe(2)

      // Marks should use size scale, not defaulted to value
      const mark = spec.marks[0]
      const sizeScale = spec.scales.find(
        (s) => s.name === `${LAYER_TYPE.POINT}_size`
      )
      const colorScale = spec.scales.find(
        (s) => s.name === `${LAYER_TYPE.POINT}_fillColor`
      )
      expect(sizeScale).toBeDefined()
      expect(mark.properties.height.scale).toEqual(sizeScale.name)
      expect(mark.properties.width.scale).toEqual(sizeScale.name)

      // Marks properly reference color scale
      expect(colorScale.name).toBe(mark.properties.fillColor.scale)
      // Domain === range length for color scale
      expect(colorScale.domain.length).toBe(colorScale.range.length)
    })

    it("should update spec when color measure is activated", async () => {
      const { result, rerender } = renderHook(
        ({ key, ms, vs }: { key: string; ms: MapSettings; vs: ViewState }) =>
          useVegaChart(key, ms, vs),
        {
          initialProps: {
            key: LAYER_TYPE.POINT,
            ms: mapSettings,
            vs: viewState
          }
        }
      )

      expect(result.current.error).toBeNull()
      let spec = result.current.vegaSpec
      // Should limit original query
      expect(spec.data[0].sql).toMatch(rasterQueryLimitExpression())
      expect(spec.marks.length).toBe(1)
      // No extra data blocks for color/size
      expect(spec.data.length).toBe(1)
      const mark = spec.marks[0]
      expect(mark.properties.height).toBe(3) // No size measure
      expect(mark.properties.fillColor).toBe("#27aeef")

      expect(mark.properties.xc.field).toBe("lon")
      expect(mark.properties.yc.field).toBe("lat")

      queryAsyncSpy.mockResolvedValue([0, 100])

      mapSettings = {
        ...mapSettings,
        colorField: {
          field: "tweet_count",
          type: VegaTypeMap.NUMBER,
          active: true,
          required: false
        }
      }

      rerender({
        key: LAYER_TYPE.POINT,
        ms: mapSettings,
        vs: viewState
      })
      await waitFor(() => {
        expect(queryAsyncSpy).toHaveBeenCalled()
        expect(result.current.vegaSpec.data.length).toBe(2)
      })

      spec = result.current.vegaSpec
      const newMark = spec.marks[0]
      expect(newMark.properties.height).toBe(3) // No size measure
      // Color data should exist
      expect(spec.scales.length).toBe(1)
      expect(
        spec.data.find((d) => d.name === `${LAYER_TYPE.POINT}_stats`)
      ).toBeDefined()

      const colorScale = spec.scales.find(
        (s) => s.name === `${LAYER_TYPE.POINT}_fillColor`
      )
      // Marks properly reference color scale
      expect(colorScale.name).toBe(newMark.properties.fillColor.scale)
      // Domain === range length for color scale
      expect(colorScale.domain.fields.length).toBe(colorScale.range.length)
    })

    it("should strip order by clause out of vega render query", () => {
      mapSettings.query = `SELECT lat, lon, join_time FROM tweets_nov_feb ORDER BY join_time`
      const { result } = renderHook(() =>
        useVegaChart(LAYER_TYPE.POINT, mapSettings, viewState)
      )

      expect(result.current.error).toBeNull()
      const spec = result.current.vegaSpec
      // Should limit original query
      expect(spec.data[0].sql).toMatch(rasterQueryLimitExpression())
      // Order is stripped out
      expect(spec.data[0].sql).not.toMatch(/.*ORDER BY join_time.*/)
    })
  })

  describe("Polygon Map Spec", () => {
    const query = `
      SELECT
        geom,
        numField1,
        stringField1
      from
        us_counties
    `

    beforeEach(() => {
      queryAsyncSpy = jest.spyOn(dbCon, "queryAsync")
      mapSettings = {
        type: ChartTypes.POLYGON_MAP,
        query,
        geomField: {
          field: "geom",
          type: VegaTypeMap.POLYGON,
          required: true,
          active: true
        },
        settings: {
          border: true
        }
      }
      viewState = {
        latitude: 80,
        longitude: 120,
        zoom: 10,
        height: 500,
        width: 500
      }
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it("should have format polys in data block", async () => {
      queryAsyncSpy.mockResolvedValue([1, 100])
      const { result } = renderHook(
        ({ key, ms, vs }: { key: string; ms: MapSettings; vs: ViewState }) =>
          useVegaChart(key, ms, vs),
        {
          initialProps: {
            key: LAYER_TYPE.POLYGON,
            ms: mapSettings,
            vs: viewState
          }
        }
      )

      expect(result.current.error).toBeNull()
      const spec = result.current.vegaSpec
      // For polygon layer these should be polys
      expect(spec.data[0].format).toBe("polys")
      expect(spec.marks[0].type).toBe("polys")
    })

    it("should set stroke according to border setting", async () => {
      queryAsyncSpy.mockResolvedValue([1, 100])
      const { result, rerender } = renderHook(
        ({ key, ms, vs }: { key: string; ms: MapSettings; vs: ViewState }) =>
          useVegaChart(key, ms, vs),
        {
          initialProps: {
            key: LAYER_TYPE.POLYGON,
            ms: mapSettings,
            vs: viewState
          }
        }
      )
      expect(result.current.error).toBeNull()
      let spec = result.current.vegaSpec
      expect(spec.marks[0].properties.strokeColor).toBe("#FFFFFF")
      expect(spec.marks[0].properties.strokeWidth).toBe(1)

      rerender({
        key: LAYER_TYPE.POLYGON,
        ms: {
          ...mapSettings,
          settings: {
            border: false
          }
        },
        vs: viewState
      })
      expect(result.current.error).toBeNull()
      spec = result.current.vegaSpec
      expect(spec.marks[0].properties.strokeWidth).toBe(0)
    })
  })
})
