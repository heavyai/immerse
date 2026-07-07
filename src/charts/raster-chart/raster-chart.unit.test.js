// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as actions from "charts/raster-chart/geoheat-actions"
import {
  handleUpdateRasterChartSize,
  setRasterChartSettings,
  handleUpdateRasterLayerSettings,
  handleCombineLayers
} from "charts/raster-chart/raster-chart-sagas"
import { expectSaga } from "redux-saga-test-plan"
import * as matchers from "redux-saga-test-plan/matchers"
import geoheatReducer from "./geoheat-reducer"
import Services from "services/immerse"
import * as Points from "./point/point"
import "charts/chart-definitions"

import {
  populateImportableStore as setStore,
  saveStore,
  resetStore
} from "store/importableStore"
saveStore()
setStore({ dashboard: { id: "1" } })

import { createHeatLayer } from "./heat"
import { createPolyLayer } from "./poly"

const createPointLayer = Points.createPointLayer

const dim = {
  filter: () => {},
  groupAll: () => ({ valueAsync: () => Promise.resolve(100) })
}
const cf = {
  dimension: () => dim,
  getDomain: () => Promise.resolve([0, 1]),
  getTables: () => []
}

Services.set("crossfilter", { getCrossfilter: () => cf })

describe("Raster Chart", () => {
  describe("Reducer", () => {
    it("should handle SET_GEOHEAT_MARK_TYPE action", () => {
      const reducer = geoheatReducer[actions.SET_GEOHEAT_MARK_TYPE]
      const action = actions.setMarkType("1", "hex")
      const state = { 1: { mark: "square" } }
      expect(reducer(state, action)[1].mark).toEqual("hex")
    })
    it("should handle SET_GEOHEAT_COLOR_RANGE action", () => {
      const reducer = geoheatReducer[actions.SET_GEOHEAT_COLOR_RANGE]
      const action = actions.updateGeoHeatColorRange("1", {
        color: {
          range: ["red", "blue"],
          val: []
        }
      })
      const state = { 1: { color: {} } }
      expect(reducer(state, action)[1].color).toStrictEqual({
        range: ["red", "blue"],
        val: []
      })
    })
    it("should handle SET_GEOHEAT_GAPSIZE action", () => {
      const reducer = geoheatReducer[actions.SET_GEOHEAT_PIXEL_SIZE]
      const action = actions.setPixelSize("1", 25)
      const state = { 1: { pixelSize: 1 } }
      expect(reducer(state, action)[1].pixelSize).toEqual(25)
    })
  })

  describe("Sagas", () => {
    const chart = {
      con: () => {},
      useLonLat: () => {},
      height: () => {},
      width: () => {},
      mapUpdateInterval: () => {},
      mapboxToken: () => {},
      mapStyle: () => {},
      center: () => {},
      zoom: () => {},
      renderAsync: () => {},
      init: () => {},
      pushLayer: () => {},
      on: () => {},
      map: () => ({ on: () => {} }),
      legend: () => ({ on: () => {} }),
      popupSearchRadius: () => {},
      addDrawControl: () => {},
      geocoder: () => {},
      chartGroup: () => {},
      legendOpen: () => {},

      // backendScatter
      margins: () => {},
      renderHorizontalGridLines: () => {},
      renderVerticalGridLines: () => {},
      enableInteractions: () => {},
      transitionDuration: () => {},
      xAxisLabel: () => {},
      yAxisLabel: () => {},
      getLayerNames: () => [],

      // backendChoropleth
      useGeoTypes: () => {},
      filter: () => {}
    }
    const layer = {
      crossfilter: () => {},
      popupColumns: () => {},
      popupColumnsMapped: () => {},
      xDim: () => {},
      yDim: () => {},
      viewBoxDim: () => {},
      setState: jest.fn(() => layer),
      dimension: () => {},

      // backendScatter
      on: () => {},
      filter: () => {},
      removeZIndexedLayers: () => {}
    }

    const chartState = {
      mark: "hex",
      width: 100,
      height: 100,
      color: { val: ["red", "blue"] },
      dimensions: [{ value: "foo" }],
      measures: [{ aggType: "count", value: "bar" }],
      dataSource: "flights",
      filters: [],
      popupEnabled: true
    }

    it("should handle chart update", () => {
      const cSpec = {
        width: 100,
        height: 100
      }
      const widthHeight = jest.fn()
      const renderAsync = jest.fn()
      return expectSaga(handleUpdateRasterChartSize, {
        chartId: "1",
        updates: { ...cSpec }
      })
        .withState({
          charts: { "0": null, "1": cSpec }
        })
        .provide([
          [
            matchers.call.fn(Services.get("dc").getChart),
            {
              width: widthHeight,
              height: widthHeight,
              getLayerNames: () => [],
              renderAsync
            }
          ]
        ])
        .run()
        .then(() => {
          expect(widthHeight).toHaveBeenCalledTimes(2)
          expect(renderAsync).toHaveBeenCalled()
        })
    })

    it("should handle chart settings update", () => {
      const cSpec = {
        basemap: {
          label: "Light",
          value: "mapbox://styles/mapbox/light-v9"
        }
      }
      const mapStyle = jest.fn()
      const renderAsync = jest.fn()
      const height = jest.fn()
      const width = height

      return expectSaga(setRasterChartSettings, {
        chartId: "1",
        chartSpec: cSpec
      })
        .withState({
          charts: { "0": null, "1": cSpec }
        })
        .provide([
          [
            matchers.call.fn(Services.get("dc").getChart),
            { mapStyle, width, height, renderAsync }
          ]
        ])
        .run()
        .then(() => {
          expect(width).toHaveBeenCalledTimes(2)
          expect(renderAsync).toHaveBeenCalled()
        })
    })

    it("should update heatmap layer settings", () => {
      const heatState = {
        ...chartState,
        type: "geoheat",
        dimensions: [{ value: "lon" }, { value: "lat" }],
        measures: [{ aggType: "count", value: "*", label: "#records" }]
      }
      return expectSaga(handleUpdateRasterLayerSettings, {
        chartId: "1",
        chartSpec: heatState
      })
        .withState({
          charts: { "0": null, "1": heatState },
          dc: { render: { "1": { pending: false } } }
        })
        .provide([
          [
            matchers.call.fn(Services.get("dc").getChart),
            { ...chart, getLayer: () => layer }
          ]
        ])
        .run()
        .then(() => {
          expect(layer.setState).toHaveBeenCalled()
        })
    })

    it("should update pointmap layer settings", () => {
      const pointState = {
        ...chartState,
        type: "pointmap"
      }
      return expectSaga(handleUpdateRasterLayerSettings, {
        chartId: "1",
        chartSpec: pointState
      })
        .withState({
          charts: { "0": null, "1": pointState },
          dashboard: { id: 1, selectedTabId: "1" },
          dc: { render: { "1": { pending: false } } }
        })
        .provide([
          [
            matchers.call.fn(Services.get("dc").getChart),
            { ...chart, getLayer: () => layer }
          ]
        ])
        .run()
        .then(() => {
          expect(layer.setState).toHaveBeenCalled()
        })
    })
    it("should update backendChoropleth layer settings", () => {
      const polyState = {
        ...chartState,
        type: "backendChoropleth",
        measures: [
          {
            aggType: "Avg",
            value: "geom",
            label: "geom",
            name: "geo",
            table: "zipcodes",
            categories: [0, 0, 0, 0]
          },
          { aggType: "count", value: "*", label: "#records", minMax: [0, 1] },
          {
            value: "color",
            name: "color",
            type: "quantitative",
            minMax: [0, 1],
            label: "color",
            table: "table",
            aggType: "Avg"
          }
        ],
        hoverSelectedColumns: []
      }
      return expectSaga(handleUpdateRasterLayerSettings, {
        chartId: "1",
        chartSpec: polyState
      })
        .withState({
          charts: { "0": null, "1": polyState },
          dc: { render: { "1": { pending: false } } }
        })
        .provide([
          [
            matchers.call.fn(Services.get("dc").getChart),
            { ...chart, getLayer: () => layer }
          ]
        ])
        .run()
        .then(() => {
          expect(layer.setState).toHaveBeenCalled()
        })
    })

    it("should call the correct creation function on each layer", () => {
      const geoLayer = {
        active: true,
        type: "geoheat",
        color: {},
        dimensions: [{ value: "lon" }, { value: "lat" }],
        measures: [{ aggType: "count", value: "*", label: "#records" }],
        currentLayer: 0,
        chartId: "1"
      }

      const pointLayer = {
        ...chartState,
        measures: [
          { aggType: "Avg", value: "lon" },
          { aggType: "Avg", value: "lat" },
          { aggType: "Avg", name: "color" },
          {}
        ],
        type: "pointmap",
        currentLayer: 0
      }

      const polyLayer = {
        ...chartState,
        type: "backendChoropleth",
        dimensions: [{ value: "zipcodes", table: "table" }],
        measures: [
          {
            aggType: "Avg",
            value: "geom",
            label: "geom",
            name: "geo",
            table: "zipcodes",
            categories: [0, 0, 0, 0]
          },
          { aggType: "count", value: "*", label: "#records", minMax: [0, 1] },
          { aggType: "Avg", name: "color" }
        ],
        geoJoin: {
          table: "zipcodes",
          column: "zips"
        },
        filters: ["TX"],
        geocol: "geom",
        geoTable: "zipcodes",
        currentLayer: 0
      }

      const rasterState = {
        ...chartState,
        layers: [geoLayer, polyLayer, pointLayer],
        mapZoomCenter: { bounds: {} },
        type: "pointmap",
        currentLayer: 0
      }
      return expectSaga(handleCombineLayers, { chartId: "1" })
        .withState({
          sharedSettings: { mappings: [] },
          charts: { "0": null, "1": rasterState }
        })
        .provide([
          [
            matchers.call.fn(Services.get("dc").getChart),
            {
              crossfilter: () => {},
              chartGroup: () => {},
              getLayerNames: () => [],
              popAllLayers: () => [],
              renderAsync: () => {},
              pushLayer: () => {},
              useGeoTypes: () => {}
            }
          ],
          [matchers.call.fn(Services.get("crossfilter").getCrossfilter), cf],
          [matchers.call.fn(Services.get("dc").rasterLayer), layer]
        ])
        .call(createHeatLayer, {
          ...geoLayer,
          mapZoomCenter: rasterState.mapZoomCenter,
          currentLayer: 0,
          opacity: 0.5
        })
        .call(createPolyLayer, {
          chartId: "1",
          layerIndex: 1,
          ...polyLayer,
          mapZoomCenter: rasterState.mapZoomCenter,
          currentLayer: 0,
          opacity: 0.85
        })
        .call(createPointLayer, {
          ...pointLayer,
          mapZoomCenter: rasterState.mapZoomCenter,
          currentLayer: 0,
          chartId: "1",
          opacity: 0.85
        })
        .run()
    })
  })
})

resetStore()
