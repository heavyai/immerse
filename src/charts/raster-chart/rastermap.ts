// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { call, put, select } from "redux-saga/effects"
import * as ActionTypes from "charts/raster-chart/raster-chart-actions"
import * as AppActions from "actions/app-action-creators"
import * as ChartActions from "actions/charts-action-creators"
import * as rasterUtils from "./raster-utils"
import Services from "services/immerse"
import { mergeR } from "utils/ramda-helpers"
import { updateChart } from "actions/update-chart-action-creator"
import { layerDefaultOpacity } from "constants/magic-variables"
import { getDisplayOrParameterName } from "utils/get-display-or-parameter-name"
import { findIndex } from "ramda"
import { getSelectorMetaData } from "./point/utils/get-selector-meta-data"

export const RASTERMAP_LAYER_NAME = "rastermap"

/**
 * The raster_mesh2d backend data format expects the source query to return a
 * dense W x H grid of rows: each row is a grid cell and the row order defines
 * the cell's position in the raster. A crossfilter WHERE clause would drop
 * rows, desynchronize the grid and corrupt the rendered image, so the mesh
 * query must never receive filter SQL.
 *
 * Immerse's FakeCrossFilter injects a bounding-box filter into
 * getFilterString() for all backend-rendered charts
 * (see services/ImmerseCrossFilter/index.js), and the charting mesh2d layer
 * mixin unconditionally appends both getFilterString() and
 * getGlobalFilterString() to the SQL it generates. To guarantee that no WHERE
 * clause reaches the mesh query, the layer is handed a minimal
 * crossfilter-shaped stub instead of the real crossfilter.
 *
 * TODO(rastermap): To let this chart consume filters applied by other charts,
 * keep the dense-grid query unfiltered but translate the filter predicate into
 * the mark's fillOpacity channel (e.g. an alpha scale that is 0 for filtered-out
 * cells) rather than a WHERE clause.
 */
function createUnfilteredCrossfilterStub(cf) {
  return {
    getDataSource: () => cf.getDataSource(),
    getId: () => cf.getId(),
    getFilterString: () => "",
    getGlobalFilterString: () => "",
    groupAll: () => cf.groupAll()
  }
}

const getRastermapLayerState = (layerSpec) => {
  const colorScale =
    layerSpec.color?.val && layerSpec.color?.reverse
      ? [...layerSpec.color.val].reverse()
      : layerSpec.color?.val

  const [xMeasure, yMeasure, colorMeasure] = layerSpec.measures

  const fillOpacity =
    typeof layerSpec.opacity === "undefined"
      ? layerDefaultOpacity(layerSpec.type)
      : layerSpec.opacity

  return {
    // rasterMesh2d tells the backend to interpret the result rows as a dense
    // raster grid rather than discrete marks
    transform: [{ rasterMesh2d: {} }],
    mark: { type: "mesh2d", fillOpacity },
    encoding: {
      longitude: {
        field: rasterUtils.pointValue(layerSpec.measures, 0),
        label: xMeasure?.label || "longitude"
      },
      latitude: {
        field: rasterUtils.pointValue(layerSpec.measures, 1),
        label: yMeasure?.label || "latitude"
      },
      color: {
        field: colorMeasure?.value,
        type: "quantitative",
        scale: {
          domain: layerSpec.colorDomain || "auto",
          range: colorScale || ["#CCCCCC", "#999999"],
          clamp: true
        },
        legend: {
          title: `${colorMeasure?.label} [${getDisplayOrParameterName(
            layerSpec.dataSource
          )}]`,
          open: layerSpec.legendOpen,
          locked: layerSpec.legendLocked
        }
      }
    },
    enableHitTesting: false
  }
}

export function* createRastermapLayer(layerSpec) {
  const dc = Services.get("dc")
  const cfManager = Services.get("crossfilter")
  const cf = yield call(
    cfManager.getCrossfilter,
    layerSpec.dataSource,
    layerSpec.chartId
  )

  const RastermapLayer = yield call(dc.rasterLayer, "mesh2d")

  // The mesh2d mixin only uses xDim/yDim for its (unused here) filter machinery
  // and _destroyLayer cleanup. raster-chart.js's checkMultiYScaleLayers calls
  // yDim().getFilter() when a crossSectionTerrain layer is present, so hand the
  // layer plain [min, max] ranges; the mixin wraps them into
  // crossfilter_dimension_proxy objects that don't touch the real crossfilter.
  const xRange = layerSpec.measures[0]?.minMax
  if (xRange) {
    yield call(RastermapLayer.xDim, [...xRange])
  }
  const yRange = layerSpec.measures[1]?.minMax
  if (yRange) {
    yield call(RastermapLayer.yDim, [...yRange])
  }

  yield call(RastermapLayer.crossfilter, createUnfilteredCrossfilterStub(cf))
  yield call(RastermapLayer.setState, getRastermapLayerState(layerSpec))

  return RastermapLayer
}

export function* handleUpdateRastermapSettings({
  chartId,
  layerName,
  layerSpec
}): Generator {
  const { dcFlag, ...chartStateSpec } = yield select(
    rasterUtils.selectChart(chartId)
  )
  const chartSpec = layerSpec ? layerSpec : chartStateSpec

  // Rebuilding the layer state reads raw field values, so bail out while the
  // spec is incomplete (e.g. a measure was just removed)
  if (!rasterUtils.isLayerValid(chartSpec)) {
    return
  }

  const dcChart = yield call(Services.get("dc").getChart, dcFlag)
  if (dcChart) {
    const rastermapLayer = dcChart.getLayer(layerName || RASTERMAP_LAYER_NAME)
    if (rastermapLayer) {
      yield call(rastermapLayer.setState, getRastermapLayerState(chartSpec))
    }

    yield call(dcChart.renderAsync)
  }
}

export function* setRastermapMeasure(action) {
  try {
    yield put(ActionTypes.addMeasure(action))
    yield* getSelectorMetaData(action)

    if (action.selector.type === "POINT") {
      // A POINT column supplies both x and y, so fill both measures at once
      // (same behavior as pointmap)
      const { measures } = yield select(rasterUtils.selectChart(action.chartId))
      const xMeasureIndex = findIndex(
        (measure) => measure.name === "x",
        measures
      )
      const yMeasureIndex = findIndex(
        (measure) => measure.name === "y",
        measures
      )

      if (action.index === xMeasureIndex) {
        const yMeasureAction = { ...action, index: yMeasureIndex }
        yield put(ActionTypes.addMeasure(yMeasureAction))
        yield* getSelectorMetaData(yMeasureAction)
      } else if (action.index === yMeasureIndex) {
        const xMeasureAction = { ...action, index: xMeasureIndex }
        yield put(ActionTypes.addMeasure(xMeasureAction))
        yield* getSelectorMetaData(xMeasureAction)
      }
    }

    yield* handleUpdateRastermapSettings({ chartId: action.chartId })
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

export function* updateRastermapMeasure({ chartId, index }) {
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
    yield* handleUpdateRastermapSettings({
      chartId
    })
  }
}
