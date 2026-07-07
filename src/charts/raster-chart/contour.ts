// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { call, put, select } from "redux-saga/effects"
import { CHART_RENDER_ERROR } from "constants/action-types"
import * as ActionTypes from "charts/raster-chart/raster-chart-actions"
import * as AppActions from "actions/app-action-creators"
import * as ChartActions from "actions/charts-action-creators"
import * as rasterUtils from "./raster-utils"
import Services from "services/immerse"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { mergeR } from "utils/ramda-helpers"
import { updateChart } from "actions/update-chart-action-creator"
import { isPolyGeo } from "../../constants/data-types"
import {
  calculateValidMinorSubdivisions,
  getValueMeasure
} from "./contour/utils"

export const CONTOUR_LINE_LAYER_NAME = "contourLines"
export const CONTOUR_POLYGON_LAYER_NAME = "contourPolygons"

function getContourDataBlock(layerSpec) {
  const majorInterval = layerSpec?.majorContourSettings?.intervalSize
  const minorInterval =
    majorInterval /
      (layerSpec?.minorContourSettings?.intervalSubdivisions + 1) ||
    majorInterval

  const [lonDimension, latDimension] = layerSpec.dimensions
  const [valueMeasure] = layerSpec.measures

  return [
    {
      type: "contour",
      table: process(layerSpec.dataSource),
      source: layerSpec.dataSource,
      contour_value_field: valueMeasure?.value,
      lat_field: latDimension.value,
      lon_field: lonDimension.value,
      is_geo_point_type: lonDimension.type === "POINT",
      agg_type: valueMeasure?.aggType ?? "AVG",
      fill_agg_type: "AVG",
      bin_dim_meters: layerSpec?.griddingCell?.size ?? 180,
      neighborhood_fill_radius: layerSpec?.neighborhoodFillRadius ?? 1,
      fill_only_nulls: false,
      flip_latitude: false,
      contour_offset: 0,
      intervals: {
        isMajorFieldName: "is_major",
        minor: minorInterval,
        major: majorInterval
      }
    }
  ]
}

const getContourPolygonState = (layerSpec) => {
  const colorScale =
    layerSpec.color?.val && layerSpec.color?.reverse
      ? [...layerSpec.color.val].reverse()
      : layerSpec.color?.val

  return {
    data: getContourDataBlock(layerSpec),
    mark: {
      type: "poly",
      strokeColor: "white",
      strokeWidth: 0,
      fillColor: "",
      lineJoin: "miter",
      miterLimit: 10
    },
    encoding: {
      geocol: "contour_polygons",
      color: {
        type: "quantize",
        domain: "auto-contour",
        range: colorScale ?? ["#CCCCCC", "#999999"],
        opacity: layerSpec?.fillOpacity ?? 1,
        clamp: true
      }
    },
    enableHitTesting: false
  }
}

const getContourLineState = (layerSpec) => {
  const { majorContourSettings, minorContourSettings } = layerSpec
  const majorMinorContourField = "is_major"
  // TODO: Get rid of defaulting here, try to show error in display settings instead
  const minorContourColor = minorContourSettings?.borderColor ?? "#999999"
  const majorContourColor = majorContourSettings?.borderColor ?? "#888888"

  const minorContourWidth = minorContourSettings?.borderWidth ?? 1
  const majorContourWidth = majorContourSettings?.borderWidth ?? 2

  const minorContourOpacity = minorContourSettings?.borderOpacity
    ? parseFloat(minorContourSettings.borderOpacity)
    : 0.75
  const majorContourOpacity = majorContourSettings?.borderOpacity
    ? parseFloat(majorContourSettings.borderOpacity)
    : 0.8
  return {
    data: getContourDataBlock(layerSpec),
    mark: {
      type: "lines",
      lineJoin: "bevel"
    },
    encoding: {
      geocol: "contour_lines",
      color: {
        field: majorMinorContourField,
        type: "nominal",
        scale: {
          domain: [false, true],
          range: [minorContourColor, majorContourColor]
        }
      },
      strokeWidth: {
        field: majorMinorContourField,
        type: "nominal",
        scale: {
          domain: [false, true],
          range: [minorContourWidth, majorContourWidth]
        }
      },
      opacity: {
        field: majorMinorContourField,
        scale: {
          domain: [false, true],
          range: [minorContourOpacity, majorContourOpacity]
        }
      }
    },
    enableHitTesting: true
  }
}

export function* createContourLayer(
  chartId: string,
  layerIdx: number | null | undefined
) {
  const dc = Services.get("dc")
  const cfManager = Services.get("crossfilter")
  const { dcFlag, ...masterLayerSpec } = yield select(
    rasterUtils.selectChart(chartId)
  )

  // If layer idx is passed in, we should grab the chart spec from layers
  // Otherwise we're currently viewing the chart, and selectChart should grab
  // the right stuff
  const shouldUseLayer = layerIdx !== null && layerIdx !== undefined
  const layerSpec = shouldUseLayer
    ? masterLayerSpec.layers[layerIdx]
    : masterLayerSpec

  const cf = yield call(cfManager.getCrossfilter, layerSpec.dataSource, chartId)

  const { dataSource } = layerSpec

  const LineLayer = yield call(dc.rasterLayer, "lines")

  const xValue = rasterUtils.pointValue(layerSpec.dimensions, 0)
  const yValue = rasterUtils.pointValue(layerSpec.dimensions, 1)

  const xDim = rasterUtils.getLayerCrossfilterDimension(
    chartId,
    dataSource,
    xValue,
    cf
  )

  const yDim = rasterUtils.getLayerCrossfilterDimension(
    chartId,
    dataSource,
    yValue,
    cf
  )
  yield call(LineLayer.initializeXYDims)
  yield call(LineLayer.xDim, xDim)
  yield call(LineLayer.yDim, yDim)

  if (layerSpec.mapZoomCenter) {
    const {
      bounds: { lonMin, lonMax, latMin, latMax }
    } = layerSpec.mapZoomCenter
    xDim.filter([lonMin, lonMax])
    yDim.filter([latMin, latMax])
  }

  yield call(LineLayer.crossfilter, cf)

  yield call(LineLayer.setState, getContourLineState(layerSpec))
  yield call(LineLayer.popupColumns, ["contour_values"])
  yield call(LineLayer.popupColumnsMapped, { contour_values: "Contour Value" })

  return LineLayer
}

export function* createContourPolygonLayer(
  chartId: string,
  layerIdx: number | null | undefined
) {
  const dc = Services.get("dc")
  const cfManager = Services.get("crossfilter")
  const { dcFlag, ...masterLayerSpec } = yield select(
    rasterUtils.selectChart(chartId)
  )

  // If layer idx is passed in, we should grab the chart spec from layers
  // Otherwise we're currently viewing the chart, and selectChart should grab
  // the right stuff
  const shouldUseLayer = layerIdx !== null && layerIdx !== undefined
  const layerSpec = shouldUseLayer
    ? masterLayerSpec.layers[layerIdx]
    : masterLayerSpec

  const cf = yield call(cfManager.getCrossfilter, layerSpec.dataSource, chartId)

  const { dataSource } = layerSpec

  const contourPolygonLayer = yield call(dc.rasterLayer, "polys")

  const xValue = rasterUtils.pointValue(layerSpec.dimensions, 0)
  const yValue = rasterUtils.pointValue(layerSpec.dimensions, 1)

  const xDim = rasterUtils.getLayerCrossfilterDimension(
    chartId,
    dataSource,
    xValue,
    cf
  )

  const yDim = rasterUtils.getLayerCrossfilterDimension(
    chartId,
    dataSource,
    yValue,
    cf
  )

  yield call(contourPolygonLayer.xDim, xDim)
  yield call(contourPolygonLayer.yDim, yDim)

  if (layerSpec.mapZoomCenter) {
    const {
      bounds: { lonMin, lonMax, latMin, latMax }
    } = layerSpec.mapZoomCenter
    xDim.filter([lonMin, lonMax])
    yDim.filter([latMin, latMax])
  }

  yield call(contourPolygonLayer.setOnClickFiltering, false)

  yield call(contourPolygonLayer.crossfilter, cf)
  yield call(contourPolygonLayer.setState, getContourPolygonState(layerSpec))

  return contourPolygonLayer
}

export function* handleUpdateContourSettings({
  chartId,
  layerId = null
}: {
  chartId: string
  layerId: number | null | undefined
}): Generator {
  const { dcFlag, ...masterChartSpec } = yield select(
    rasterUtils.selectChart(chartId)
  )
  // If we're looking at the master layer, we should use the multilayer name
  // otherwise we're looking at a single chart layer, use the single chart name
  const useMultiLayerId = masterChartSpec?.currentLayer === "master"

  const hasLayerId = layerId !== null && layerId !== undefined
  const chartSpec = hasLayerId
    ? masterChartSpec.layers[layerId]
    : masterChartSpec

  // Only do this if the chart is valid
  if (!rasterUtils.isLayerValid(chartSpec)) {
    return
  }

  const polygonLayerName = useMultiLayerId
    ? rasterUtils.getMultiLayerName(CONTOUR_POLYGON_LAYER_NAME, layerId)
    : CONTOUR_POLYGON_LAYER_NAME
  const lineLayerName = useMultiLayerId
    ? rasterUtils.getMultiLayerName(CONTOUR_LINE_LAYER_NAME, layerId)
    : CONTOUR_LINE_LAYER_NAME

  const dcChart = yield call(Services.get("dc").getChart, dcFlag)
  if (dcChart) {
    try {
      const contourPolygonLayer = yield call(dcChart.getLayer, polygonLayerName)

      const contourLineLayer = yield call(dcChart.getLayer, lineLayerName)
      if (chartSpec.fillEnabled) {
        if (contourPolygonLayer) {
          // Already exists, set state
          contourPolygonLayer.setState(getContourPolygonState(chartSpec))
        } else {
          // Create the layer and add it to the chart
          const newPolyLayer = yield* createContourPolygonLayer(chartId)
          newPolyLayer.setState(getContourPolygonState(chartSpec))
          // Order of layers matters, so
          yield call(dcChart.unshiftLayer, polygonLayerName, newPolyLayer)
        }
      } else if (contourPolygonLayer) {
        // Fill option is off, remove polygon layer if it exists
        yield call(dcChart.removeLayer, polygonLayerName)
      }

      contourLineLayer.setState(getContourLineState(chartSpec))

      yield call(dcChart.renderAsync)
    } catch (e) {
      yield put(AppActions.setAppError(CHART_RENDER_ERROR, e))
    }
  }
}

function* getSelectorMetaData(action) {
  // TODO: most of this is irrelevant for now, only hits last condition, but keeping
  // to reference should we need to implement something for crossfilter with contour
  if (isPolyGeo(action.selector.type)) {
    try {
      const cf = Services.get("crossfilter").getCrossfilter(
        action.selector.table,
        action.chartId
      )
      const domain = yield call(cf.getPolyGeoDomain, action.selector)
      yield put(
        ActionTypes.updateMeasure({
          ...action,
          domain,
          type: action.selector.type
        })
      )
    } catch (e) {
      yield put(AppActions.setAppError(CHART_RENDER_ERROR, e))
    }
  } else {
    const { dataSource } = yield select(rasterUtils.selectChart(action.chartId))
    const domain = yield call(
      Services.get("crossfilter").getCrossfilter(dataSource, action.chartId)
        .getDomain,
      action.selector
    )
    const { type, ...rest } = action
    const result = { ...rest, domain }

    result.initMinMax = result.domain
    yield put(ActionTypes.updateMeasure(result))
  }
}

function* getDimensionSelectorMetaData(action) {
  const { dimensions, dataSource } = yield select(
    rasterUtils.selectChart(action.chartId)
  )
  const dimValue = process(rasterUtils.pointValue(dimensions, action.index), {
    trackUsage: false
  })
  const dimension = dimensions[action.index]
  const domain = yield call(
    Services.get("crossfilter").getCrossfilter(dataSource).getDomain,
    { type: dimension.type, value: dimValue }
  )
  const { type, ...rest } = action
  yield put(ActionTypes.updateGeoHeatDimension({ ...rest, dimension, domain }))
}

export function* setContourDimension(action) {
  try {
    yield* getDimensionSelectorMetaData(action)
    yield* handleUpdateContourSettings({ chartId: action.chartId })
  } catch (e) {
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
    yield put(
      ChartActions.updateSelector(
        action.chartId,
        "dimensions",
        action.index,
        mergeR({ loading: false, isError: true })
      )
    )
    yield put(updateChart(action.chartId, { loading: false }))
  }
}

export function* setContourMeasure(action) {
  try {
    yield put(ActionTypes.addMeasure(action))
    yield* getSelectorMetaData(action)

    const { measures } = yield select(rasterUtils.selectChart(action.chartId))

    const valueMeasure = getValueMeasure(measures)
    const hasValueMeasure = Boolean(valueMeasure?.value)
    // If we have a measure, figure out the defaults for contour chart settings and set them
    if (hasValueMeasure) {
      const [minContourValue, maxContourValue] = valueMeasure?.minMax

      // Absolute value accounts for largely negative measure value
      const maxContourInterval = Math.abs(
        Math.round(maxContourValue - minContourValue)
      )
      const defaultIntervalSize = Math.round(maxContourInterval / 15)
      const recalculatedSubdivisions = calculateValidMinorSubdivisions(
        defaultIntervalSize
      )
      yield put(
        ActionTypes.setContourIntervals(
          action.chartId,
          defaultIntervalSize,
          recalculatedSubdivisions[0]?.value ?? 0
        )
      )
    }

    yield* handleUpdateContourSettings({ chartId: action.chartId })
  } catch (e) {
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
    yield put(
      ChartActions.updateSelector(
        action.chartId,
        "measures",
        action.index,
        mergeR({ loading: false, isError: true })
      )
    )
    yield put(updateChart(action.chartId, { loading: false }))
  }
}

export function* updateContourMeasure({ chartId, index }) {
  const { measures } = yield select(rasterUtils.selectChart(chartId))

  yield* getSelectorMetaData({
    chartId,
    index,
    selector: measures[index]
  })

  const { dcFlag } = yield select(rasterUtils.selectChart(chartId))
  const dcChart =
    typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null

  if (dcChart) {
    yield* handleUpdateContourSettings({
      chartId
    })
  }
}
