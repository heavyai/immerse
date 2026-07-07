// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as rasterUtils from "../raster-utils"
// import * as rasterPopupUtils from "../raster-popup-utils"
import { call, put, select } from "redux-saga/effects"
import { CHART_RENDER_ERROR } from "constants/action-types"
import * as AppActions from "actions/app-action-creators"
import Services from "services/immerse"
import { getMeasureMinMax } from "charts/raster-chart/point/utils/get-measure-min-max"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { getCrossSectionColor } from "./utils/get-cross-section-color"
import { EndpointSelectorNames } from "./constants"
import { UNITS } from "constants/units"
import { CHART_TYPES } from "constants/chart-types"
import { convertValue } from "utils/units"
import { isCrossSectionType } from "./utils/is-cross-section-type"

const getEndpointMeasures = (measures) => {
  const startLonMeasure = measures.find(
    (m) => m.name === EndpointSelectorNames.START_LON
  )
  const startLatMeasure = measures.find(
    (m) => m.name === EndpointSelectorNames.START_LAT
  )
  const endLonMeasure = measures.find(
    (m) => m.name === EndpointSelectorNames.END_LON
  )
  const endLatMeasure = measures.find(
    (m) => m.name === EndpointSelectorNames.END_LAT
  )
  return { startLonMeasure, startLatMeasure, endLonMeasure, endLatMeasure }
}

function* makeCrossSectionLineSpec(measures, crossfilter) {
  if (hasValidEndpoints(measures)) {
    const {
      startLonMeasure,
      startLatMeasure,
      endLonMeasure,
      endLatMeasure
    } = getEndpointMeasures(measures)
    return [
      [startLonMeasure.value, startLatMeasure.value],
      [endLonMeasure.value, endLatMeasure.value]
    ]
  }

  // Default to view facing north from southern boundary of data
  const [[lonMin, lonMax], [latMin, latMax]] = yield call(
    getLatLonMinMax,
    crossfilter,
    measures
  )

  return [
    [lonMin, latMin],
    [lonMax, latMax]
  ]
}

function hasValidEndpoints(measures) {
  const {
    startLonMeasure,
    startLatMeasure,
    endLonMeasure,
    endLatMeasure
  } = getEndpointMeasures(measures)
  return [
    endLatMeasure?.value,
    endLonMeasure?.value,
    startLatMeasure?.value,
    startLonMeasure?.value
  ].every((m) => {
    if (typeof m === "number") {
      return true
    }

    if (typeof m === "string") {
      const proccessedMeasure = parseFloat(process(m, { trackUsage: false }))

      return !isNaN(proccessedMeasure)
    }

    return false
  })
}

async function getLatLonMinMax(crossfilter, measures) {
  return Promise.all([
    crossfilter.getMinMax(
      measures[0]?.value,
      {},
      {
        ignoreFilters: false,
        ignoreChartFilters: false,
        token: "lonMinMax"
      }
    ),
    crossfilter.getMinMax(
      measures[1]?.value,
      {},
      {
        ignoreFilters: false,
        ignoreChartFilters: false,
        token: "latMinMax"
      }
    )
  ])
}

/**
 *
 * Looks at the cross section and terrain layers to get their elevation measures, and return
 * the [min,max] in the destination unit specified
 *
 * @param {*} chartSpec The whole chart spec, includes all layers. NOT the layer spec
 * @param {*} chartId Chart id, self explanatory
 * @param {*} destUnit Output unit to get the min/max of layers in
 * @returns [min, max] of the crossection and terrain layers elevation measures in the destUnit
 */
function* getElevationMinMax(chartSpec, chartId, destUnit = UNITS.FEET) {
  // These can be parameterized and passed through from display settings in the future
  const { MILLIBARS, FEET } = UNITS
  const crossSectionUnit = MILLIBARS
  const terrainUnit = FEET

  // Normalize everything to this to compare in this function
  const normalUnit = FEET

  const terrainMeasureName = "terrain"
  const crossSectionMeasureName = "z"

  const cfManager = Services.get("crossfilter")

  // Get both layers (either one could not be present)
  let terrainLayer = null
  let crossSectionLayer = null
  // If we have layers and we're looking at the master layer
  if (chartSpec.layers?.length > 1 && chartSpec.currentLayer === "master") {
    // More than one layer, get each layer if it exists from layers
    crossSectionLayer = chartSpec.layers.find(
      (l) => l.type === CHART_TYPES.CROSS_SECTION
    )
    terrainLayer = chartSpec.layers.find(
      (l) => l.type === CHART_TYPES.CROSS_SECTION_TERRAIN
    )
  } else if (chartSpec.type === CHART_TYPES.CROSS_SECTION_TERRAIN) {
    // It's a single layer, if its terrain set terrain to the chart
    terrainLayer = chartSpec
  } else {
    // Otherwise assume this is the cross Section layer
    crossSectionLayer = chartSpec
  }

  // Find relevant measures
  const terrainMeasure = terrainLayer?.measures?.find(
    (l) => l.name === terrainMeasureName
  )
  const crossSectionMeasure = crossSectionLayer?.measures?.find(
    (l) => l.name === crossSectionMeasureName
  )

  // Normalize everything to feet for these arrays
  // Convert to target unit at the end.
  const allMax = []
  const allMin = []

  // Normalize cross section units
  if (crossSectionLayer) {
    const crossSectionCF = cfManager.getCrossfilter(
      crossSectionLayer.dataSource,
      chartId
    )
    const crossSectionDomain = yield call(
      crossSectionCF.getMinMax,
      crossSectionMeasure.value,
      {},
      { ignoreFilters: false, ignoreChartFilters: false }
    )

    const csMin = convertValue(
      crossSectionDomain[0],
      crossSectionUnit,
      normalUnit
    )
    const csMax = convertValue(
      crossSectionDomain[1],
      crossSectionUnit,
      normalUnit
    )

    // If we're using isobaric level as our unit, then lower is higher (min is max)
    // Convert it from isobaric level to the terrain units and flip min/max
    if (crossSectionUnit === MILLIBARS) {
      allMin.push(csMax)
      allMax.push(csMin)
    } else {
      // Add them as is, more unit conversions could happen here though
      allMin.push(csMin)
      allMax.push(csMax)
    }
  }

  if (terrainLayer) {
    const terrainCF = cfManager.getCrossfilter(terrainLayer.dataSource, chartId)
    const terrainDomain = yield call(
      terrainCF.getMinMax,
      terrainMeasure.value,
      {},
      { ignoreFilters: false, ignoreChartFilters: false }
    )
    const normalTerrainMin = convertValue(
      terrainDomain[0],
      terrainUnit,
      normalUnit
    )
    const normalTerrainMax = convertValue(
      terrainDomain[1],
      terrainUnit,
      normalUnit
    )
    allMin.push(normalTerrainMin)
    allMax.push(normalTerrainMax)
  }

  // Everything is in the normalUnit unit in this array
  const minMaxNormal = [Math.min(...allMin), Math.max(...allMax)]

  // Convert to our target unit of this function
  return minMaxNormal.map((v) => convertValue(v, normalUnit, destUnit))
}

export function* createCrossSectionLayer({
  measures,
  dataSource,
  color,
  currentLayer,
  chartId,
  width,
  height,
  smoothing,
  searchDistance,
  opacity = 1
}) {
  const dc = Services.get("dc")
  const cfManager = Services.get("crossfilter")
  const cf = yield call(cfManager.getCrossfilter, dataSource, chartId)
  const updatedMeasures = yield call(getMeasureMinMax, measures, chartId)
  const chartSpec = yield select(rasterUtils.selectChart(chartId))

  const Mesh2dLayer = yield call(dc.rasterLayer, "mesh2d")

  yield call(Mesh2dLayer.xDim, [0, 1]) // TODO this is normalized; calculate distance

  const [absoluteMin, absoluteMax] = yield call(
    getElevationMinMax,
    chartSpec,
    chartId,
    UNITS.MILLIBARS
  )

  yield call(Mesh2dLayer.yDim, [absoluteMin, absoluteMax])

  yield call(Mesh2dLayer.crossfilter, cf)

  const lineSpec = yield call(makeCrossSectionLineSpec, updatedMeasures, cf)

  yield call(Mesh2dLayer.setState, {
    transform: [
      {
        crossSection2d: {
          x: updatedMeasures[0].value, // lon
          y: updatedMeasures[1].value, // lat
          z: updatedMeasures[2].value, // vertical
          crossSectionLine: lineSpec,
          crossSectionDimensionName: "distance",
          numPointsX: Math.round(Number.parseInt(width, 10) / smoothing),
          numPointsY: Math.round(Number.parseInt(height, 10) / smoothing),
          dwithinDistance: searchDistance
        }
      }
    ],
    mark: { type: "mesh2d", opacity: Number.parseFloat(opacity) },
    encoding: {
      x: {
        field: "distance",
        label: "distance"
      },
      y: {
        field: updatedMeasures[2].label,
        label: "isobaric_level"
      },
      color: getCrossSectionColor(color, updatedMeasures[3].value)
    },
    // TODO: Hit testing not implemented; requires BE support
    // enableHitTesting flag depends not just on popupEnable toggle but also require to have a popup column
    // selection to avoid unnecessary hit testing call to rendering
    // enableHitTesting:
    //   (hoverSelectedColumns.length > 0 || groupby.length > 0) && popupEnabled,
    currentLayer
  })

  return Mesh2dLayer
}

export function* createCrossSectionTerrainLayer({
  measures,
  dataSource,
  color,
  currentLayer,
  chartId,
  width,
  smoothing,
  opacity = 1
}) {
  const dc = Services.get("dc")
  const cfManager = Services.get("crossfilter")
  const cf = yield call(cfManager.getCrossfilter, dataSource, chartId)
  const chartSpec = yield select(rasterUtils.selectChart(chartId))

  const updatedMeasures = yield call(getMeasureMinMax, measures, chartId)

  const TerrainLayer = yield call(dc.rasterLayer, "crossSectionTerrain")

  yield call(TerrainLayer.xDim, [0, 1]) // TODO this is normalized; calculate distance

  const [absoluteMin, absoluteMax] = yield call(
    getElevationMinMax,
    chartSpec,
    chartId
  )
  yield call(TerrainLayer.yDim, [absoluteMin, absoluteMax])

  yield call(TerrainLayer.crossfilter, cf)

  const lineSpec = yield call(makeCrossSectionLineSpec, updatedMeasures, cf)

  yield call(TerrainLayer.setState, {
    transform: [
      {
        cross_section1d: {
          x: updatedMeasures[0].value, // lon
          y: updatedMeasures[1].value, // lat
          z: updatedMeasures[2].value, // elevation
          crossSectionLine: lineSpec,
          numPoints: Math.round(width / smoothing)
        }
      }
    ],
    mark: {
      type: "lines",
      strokeColor: color.val[0],
      opacity: Number.parseFloat(opacity)
    },
    encoding: {
      x: {
        field: "distance",
        label: "distance"
      },
      y: {
        field: updatedMeasures[2].label,
        label: "elevation"
      }
    },
    // TODO: Hit testing not implemented; requires BE support
    // enableHitTesting flag depends not just on popupEnable toggle but also require to have a popup column
    // selection to avoid unnecessary hit testing call to rendering
    // enableHitTesting:
    //   (hoverSelectedColumns.length > 0 || groupby.length > 0) && popupEnabled,
    currentLayer
  })

  return TerrainLayer
}

export function* handleUpdateCrossSectionSettings({
  chartId,
  layerName = null,
  layerSpec
}) {
  const { dcFlag, ...chartStateSpec } = yield select(
    rasterUtils.selectChart(chartId)
  )
  const { width, height, smoothing, searchDistance } = chartStateSpec
  const chartSpec = layerSpec ? layerSpec : chartStateSpec
  const { color, measures, currentLayer, opacity = 1 } = chartSpec

  const dcChart = yield call(Services.get("dc").getChart, dcFlag)
  if (dcChart && !chartSpec.hasError) {
    const Mesh2dLayer = yield call(
      dcChart.getLayer,
      layerName || chartSpec.type
    )

    const dataSource = chartSpec.dataSource ?? chartStateSpec.dataSource
    const crossfilter = Services.get("crossfilter").getCrossfilter(
      dataSource,
      chartId
    )
    if (Mesh2dLayer) {
      const updatedMeasures = yield call(getMeasureMinMax, measures, chartId)

      const [absoluteMin, absoluteMax] = yield call(
        getElevationMinMax,
        chartStateSpec, // The whole chart spec, not the layer spec
        chartId,
        UNITS.MILLIBARS
      )
      yield call(Mesh2dLayer.yDim, [absoluteMin, absoluteMax])

      const lineSpec = yield call(
        makeCrossSectionLineSpec,
        updatedMeasures,
        crossfilter
      )

      Mesh2dLayer.setState((state) => {
        return {
          ...state,
          transform: [
            {
              ...state.transform,
              crossSection2d: {
                x: updatedMeasures[0].value, // lon
                y: updatedMeasures[1].value, // lat
                z: updatedMeasures[2].value, // vertical
                crossSectionLine: lineSpec,
                crossSectionDimensionName: "distance",
                numPointsX: Math.round(Number.parseInt(width, 10) / smoothing),
                numPointsY: Math.round(Number.parseInt(height, 10) / smoothing),
                dwithinDistance: searchDistance
              }
            }
          ],
          encoding: {
            ...state.encoding,
            x: {
              field: "distance",
              label: "distance"
            },
            y: {
              field: updatedMeasures[2].label,
              label: "isobaric_level"
            },
            color: getCrossSectionColor(color, updatedMeasures[3].value)
          },
          mark: {
            ...state.mark,
            opacity: Number.parseFloat(opacity)
          },
          currentLayer
        }
      })

      try {
        yield call(dcChart.renderAsync)
      } catch (e) {
        yield put(AppActions.setAppError(CHART_RENDER_ERROR, e))
      }
    }
  }
}

export function* handleUpdateCrossSectionTerrainSettings({
  chartId,
  layerName = null,
  layerSpec
}) {
  const { dcFlag, ...chartStateSpec } = yield select(
    rasterUtils.selectChart(chartId)
  )
  const { width, smoothing } = chartStateSpec
  const chartSpec = layerSpec ? layerSpec : chartStateSpec
  const { measures, type, currentLayer, color, opacity = 1 } = chartSpec

  const dcChart = yield call(Services.get("dc").getChart, dcFlag)
  if (dcChart && !chartSpec.hasError) {
    const TerrainLayer = yield call(dcChart.getLayer, layerName || type)

    if (TerrainLayer) {
      const updatedMeasures = yield call(getMeasureMinMax, measures, chartId)

      const [absoluteMin, absoluteMax] = yield call(
        getElevationMinMax,
        chartStateSpec, // The whole chart spec, not the layer spec
        chartId
      )
      yield call(TerrainLayer.yDim, [absoluteMin, absoluteMax])

      const cfManager = Services.get("crossfilter")
      const cf = yield call(
        cfManager.getCrossfilter,
        chartSpec.dataSource ?? chartStateSpec.dataSource,
        chartId
      )

      const lineSpec = yield call(makeCrossSectionLineSpec, updatedMeasures, cf)

      TerrainLayer.setState((state) => ({
        ...state,
        transform: [
          {
            ...state.transform,
            cross_section1d: {
              x: updatedMeasures[0].value, // lon
              y: updatedMeasures[1].value, // lat
              z: updatedMeasures[2].value, // terrain
              crossSectionLine: lineSpec,
              crossSectionDimensionName: "distance",
              numPoints: Math.round(width / smoothing)
            }
          }
        ],
        mark: {
          ...state.mark,
          strokeColor: color.val[0],
          opacity: Number.parseFloat(opacity)
        },
        encoding: {
          ...state.encoding,
          x: {
            field: "distance",
            label: "distance"
          },
          y: {
            field: updatedMeasures[2].label,
            label: "color"
          }
        },
        currentLayer
      }))

      try {
        yield call(dcChart.renderAsync)
      } catch (e) {
        yield put(AppActions.setAppError(CHART_RENDER_ERROR, e))
      }
    }
  }
}

/**
 * Unlike the other coordinate grid charts, we want cross section
 * types to update their Y bounds when filters change to fit
 * the newly filtered bounds
 */
export function* fitCrossSectionsToFilter() {
  const { charts } = yield select((state) => state)
  const byId = Object.entries(charts ?? {})
  for (const [id, chart] of byId) {
    const hasCrossSectionLayers = chart.layers?.some((l) =>
      isCrossSectionType(l.type)
    )
    if (isCrossSectionType(chart.type) || hasCrossSectionLayers) {
      yield call(handleUpdateCrossSectionFilters, id)
    }
  }
}

/**
 * Specific to cross section layer types, this will update ydims for each layer
 * in the chart when dashboard level filters are set or changed.
 *
 * @param {*} chartId - ID of cross section chart to update
 */
export function* handleUpdateCrossSectionFilters(chartId) {
  const chartSpec = yield select(rasterUtils.selectChart(chartId))
  const { dcFlag } = chartSpec
  const dcChart = yield call(Services.get("dc").getChart, dcFlag)

  // Updates ydims of each layer if dashboard filters have been set
  if (dcChart && !chartSpec.hasError) {
    // Update yDims
    const layers = dcChart.getLayers()
    for (const layer of layers) {
      if (layer.layerType() === "mesh2d") {
        const [crossSectionMin, crossSectionMax] = yield call(
          getElevationMinMax,
          chartSpec, // The whole chart spec, not the layer spec
          chartId,
          UNITS.MILLIBARS
        )
        yield call(layer.yDim, [crossSectionMin, crossSectionMax])
      } else {
        // Update yDims
        const [terrainMin, terrainMax] = yield call(
          getElevationMinMax,
          chartSpec, // The whole chart spec, not the layer spec
          chartId
        )
        yield call(layer.yDim, [terrainMin, terrainMax])
      }
    }
    try {
      yield call(dcChart.renderAsync)
    } catch (e) {
      yield put(AppActions.setAppError(CHART_RENDER_ERROR, e))
    }
  }
}
