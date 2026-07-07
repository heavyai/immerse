// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import reducers from "./geoheat-reducer"
import * as RasterActions from "./raster-chart-actions"
import { CHARTS_DEFAULT_COLORS, getColors } from "services/colors"
import { CHARTS } from "constants/charts"
import { getThunkActions } from "utils/helpers"
import pushid from "pushid"
import { DEFAULT_POLY_BORDER_COLOR } from "charts/raster-chart/raster-chart-consts"
import { RASTER_LAYER_ID_PREFIX } from "../../utils/raster-layer-id-utils"
import "charts/chart-definitions"

describe("Geoheat Reducers", () => {
  describe("combineRasterLayersReducer", () => {
    const reducer = reducers.COMBINE_RASTER_LAYERS
    it("should combine layers", () => {
      expect(
        reducer(
          {
            1: {
              title: "raster",
              dataSource: "tweets",
              currentLayer: 0,
              layers: [
                {
                  title: "layer",
                  dataSource: "flights",
                  type: "pointmap",
                  measures: [{ value: "lon" }, { value: "lat" }]
                },
                {
                  title: "layer2",
                  type: "geoheat"
                }
              ]
            }
          },
          RasterActions.combineRasterLayers("1")
        )
      ).toStrictEqual({
        1: {
          title: "raster",
          dataSource: "tweets",
          currentLayer: "master",
          layers: [
            {
              title: "layer",
              dataSource: "flights",
              type: "pointmap",
              measures: [{ value: "lon" }, { value: "lat" }]
            }
          ]
        }
      })
    })
  })

  describe("deleteRasterLayerReducer", () => {
    const reducer = reducers.DELETE_RASTER_LAYER
    it("should delete layer properly", () => {
      expect(
        reducer(
          {
            1: {
              title: "layer",
              dataSource: "flights",
              type: "pointmap",
              measures: [{ value: "lon" }, { value: "lat" }],
              currentLayer: "master",
              layers: [
                {
                  title: "layer",
                  dataSource: "flights",
                  type: "pointmap",
                  measures: [{ value: "lon" }, { value: "lat" }],
                  dimensions: []
                }
              ]
            }
          },
          getThunkActions(RasterActions.deleteRasterLayer("1", 0))[0]
        )
      ).toStrictEqual({
        1: {
          title: "layer",
          dataSource: "flights",
          type: "pointmap",
          measures: [{ value: "lon" }, { value: "lat" }],
          currentLayer: 0,
          layers: []
        }
      })
    })
  })

  describe("saveCurrentLayerReducer", () => {
    const reducer = reducers.SAVE_CURRENT_RASTER_LAYER
    it("should save current layer", () => {
      expect(
        reducer(
          {
            1: {
              title: "layer",
              dataSource: "flights",
              hoverSelectedColumns: [],
              type: "pointmap",
              dimensions: [],
              measures: [{ value: "lon" }, { value: "lat" }],
              currentLayer: 0,
              color: {
                val: []
              },
              opacity: 0.85,
              pixelSize: 10,
              popupEnabled: true,
              mark: "point",
              markShape: "point",
              densityAccumulatorEnabled: false,
              autoSize: false,
              sizeRange: [1, 10],
              sizeDomain: [1, 10],
              cap: 100000,
              geoJoin: {},
              legendOpen: true,
              layers: [],
              postFilters: [],
              hasBorderColorFromFill: false,
              rasterShowOther: true,
              active: true,
              fullColorHashing: true
            }
          },
          RasterActions.saveCurrentRasterLayer("1", 0)
        )
      ).toStrictEqual({
        1: {
          title: "layer",
          dataSource: "flights",
          hoverSelectedColumns: [],
          type: "pointmap",
          dimensions: [],
          measures: [{ value: "lon" }, { value: "lat" }],
          currentLayer: 0,
          color: {
            val: []
          },
          opacity: 0.85,
          pixelSize: 10,
          popupEnabled: true,
          mark: "point",
          markShape: "point",
          densityAccumulatorEnabled: false,
          autoSize: false,
          sizeRange: [1, 10],
          sizeDomain: [1, 10],
          rasterShowOther: true,
          active: true,
          cap: 100000,
          geoJoin: {},
          legendOpen: true,
          postFilters: [],
          hasBorderColorFromFill: false,
          fullColorHashing: true,
          layers: [
            {
              dataSource: "flights",
              hoverSelectedColumns: [],
              type: "pointmap",
              dimensions: [],
              measures: [{ value: "lon" }, { value: "lat" }],
              color: {
                val: []
              },
              opacity: 0.85,
              pixelSize: 10,
              popupEnabled: true,
              mark: "point",
              markShape: "point",
              densityAccumulatorEnabled: false,
              autoSize: false,
              sizeRange: [1, 10],
              sizeDomain: [1, 10],
              cap: 100000,
              geoJoin: {},
              legendOpen: true,
              borderWidth: undefined,
              borderColor: undefined,
              postFilters: [],
              hasBorderColorFromFill: false,
              rasterShowOther: true,
              active: true,
              fullColorHashing: true
            }
          ]
        }
      })
    })
  })

  describe("addRasterLayerReducer", () => {
    const reducer = reducers.ADD_NEW_RASTER_LAYER
    it("should add layer", () => {
      const testRasterLayerId = `${RASTER_LAYER_ID_PREFIX}:${pushid()}`
      expect(
        reducer(
          {
            1: {
              title: "layer",
              dataSource: "flights",
              hoverSelectedColumns: [],
              type: "pointmap",
              dimensions: [],
              measures: [{ value: "lon" }, { value: "lat" }],
              currentLayer: 0,
              color: {
                val: []
              },
              opacity: 0.85,
              pixelSize: 10,
              popupEnabled: true,
              mark: "point",
              markShape: "point",
              densityAccumulatorEnabled: false,
              autoSize: false,
              savedColors: {},
              sizeRange: [1, 10],
              sizeDomain: [1, 10],
              cap: 100000,
              geoJoin: {},
              legendOpen: true,
              rasterShowOther: true,
              active: true,
              layers: [
                {
                  dataSource: "flights",
                  hoverSelectedColumns: [],
                  type: "pointmap",
                  dimensions: [],
                  measures: [{ value: "lon" }, { value: "lat" }],
                  color: {
                    val: []
                  },
                  opacity: 0.85,
                  pixelSize: 10,
                  popupEnabled: true,
                  mark: "point",
                  markShape: "point",
                  densityAccumulatorEnabled: false,
                  autoSize: false,
                  sizeRange: [1, 10],
                  sizeDomain: [1, 10],
                  cap: 100000,
                  geoJoin: {},
                  legendOpen: true,
                  rasterShowOther: true,
                  active: true
                }
              ]
            }
          },
          RasterActions.addNewRasterLayer("1"),
          testRasterLayerId
        )
      ).toStrictEqual({
        1: {
          title: "layer",
          dataSource: "flights",
          hoverSelectedColumns: [],
          type: "pointmap",
          dimensions: [
            {
              inactive: false,
              isBinnable: false,
              isBinned: false,
              name: null
            }
          ],
          measures: [
            { inactive: false, isRequired: true, name: "x" },
            { inactive: false, isRequired: true, name: "y" },
            { inactive: false, name: "size" },
            { inactive: false, name: "color" },
            { inactive: false, name: "orientation" }
          ],
          currentLayer: 1,
          rasterLayerId: testRasterLayerId,
          color: getColors(CHARTS_DEFAULT_COLORS).defaultQuantitative,
          opacity: 0.85,
          pixelSize: 10,
          popupEnabled: true,
          mark: "hex",
          markShape: "point",
          densityAccumulatorEnabled: true,
          autoSize: false,
          savedColors: {},
          sizeRange: [1, 10],
          sizeDomain: [1, 10],
          cap: 100000,
          geoJoin: {},
          legendOpen: true,
          borderWidth: 0,
          borderColor: DEFAULT_POLY_BORDER_COLOR,
          hasBorderColorFromFill: false,
          postFilters: CHARTS.pointmap.postFilters,
          rasterShowOther: true,
          active: true,
          layers: [
            {
              dataSource: "flights",
              hoverSelectedColumns: [],
              type: "pointmap",
              dimensions: [],
              measures: [{ value: "lon" }, { value: "lat" }],
              color: {
                val: []
              },
              opacity: 0.85,
              pixelSize: 10,
              popupEnabled: true,
              mark: "point",
              markShape: "point",
              densityAccumulatorEnabled: false,
              autoSize: false,
              sizeRange: [1, 10],
              sizeDomain: [1, 10],
              cap: 100000,
              geoJoin: {},
              legendOpen: true,
              rasterShowOther: true,
              active: true
            },
            {
              rasterLayerId: testRasterLayerId
            }
          ]
        }
      })
    })
  })

  describe("swapRasterLayersReducer", () => {
    const reducer = reducers.SWAP_RASTER_LAYER
    it("should swap layers", () => {
      expect(
        reducer(
          {
            1: {
              layers: [
                {
                  title: "layer0"
                },
                {
                  title: "layer1"
                }
              ]
            }
          },
          RasterActions.swapLayers("1", 0, 1)
        )
      ).toStrictEqual({
        1: {
          layers: [
            {
              title: "layer1"
            },
            {
              title: "layer0"
            }
          ]
        }
      })
    })
  })

  describe("setLayerOpacity", () => {
    const reducer = reducers.SET_LAYER_OPACITY
    it("should set layer opacity", () => {
      expect(
        reducer(
          {
            1: {
              layers: [
                {
                  title: "layer0"
                },
                {
                  title: "layer1"
                }
              ]
            }
          },
          RasterActions.setLayerOpacity("1", 0, 0.5)
        )
      ).toStrictEqual({
        1: {
          layers: [
            {
              title: "layer0",
              opacity: 0.5
            },
            {
              title: "layer1"
            }
          ]
        }
      })
    })
  })

  describe("toggleRasterLayerReducer", () => {
    const reducer = reducers.TOGGLE_RASTER_LAYER
    it("should toggle raster layer active property", () => {
      expect(
        reducer(
          {
            1: {
              layers: [
                {
                  title: "layer0",
                  active: false
                },
                {
                  title: "layer1"
                }
              ]
            }
          },
          RasterActions.toggleRasterLayer("1", 0)
        )
      ).toStrictEqual({
        1: {
          layers: [
            {
              title: "layer0",
              active: true
            },
            {
              title: "layer1"
            }
          ]
        }
      })
    })
  })

  describe("clearFilters", () => {
    const reducer = reducers.CLEAR_RASTER_CHART_FILTERS
    it("should reset filters", () => {
      expect(
        reducer(
          {
            1: {
              filters: [0, 1, 2, 3]
            }
          },
          RasterActions.clearRasterChartFilters("1")
        )
      ).toStrictEqual({
        1: {
          filters: []
        }
      })
    })
  })
})
