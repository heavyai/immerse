// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ActionTypes from "charts/raster-chart/raster-chart-actions"
import * as AppActions from "actions/app-action-creators"
import * as ChartActions from "actions/charts-action-creators"
import * as rasterUtils from "./raster-utils"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { call, put, select } from "redux-saga/effects"
import { mergeR } from "utils/ramda-helpers"
import {
  DEFAULT_GEOHEAT_MARK,
  DEFAULT_GEOHEAT_PIXEL_SIZE,
  layerDefaultOpacity
} from "constants/magic-variables"
import Services from "services/immerse"
import { updateChart } from "actions/update-chart-action-creator"
import { getDisplayOrParameterName } from "utils/get-display-or-parameter-name"

const colorDomainSetter = (domain) => (state) => ({
  ...state,
  encoding: {
    ...state.encoding,
    color: {
      ...state.encoding.color,
      scale: {
        ...state.encoding.color.scale,
        domain
      }
    }
  }
})

export function* createHeatLayer(layerSpec) {
  const dc = Services.get("dc")
  const cfManager = Services.get("crossfilter")
  const cf = yield call(
    cfManager.getCrossfilter,
    layerSpec.dataSource,
    layerSpec.chartId
  )
  const HeatLayer = yield call(dc.rasterLayer, "heat")
  const { chartId, dataSource } = layerSpec

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

  if (layerSpec.mapZoomCenter) {
    const {
      bounds: { lonMin, lonMax, latMin, latMax }
    } = layerSpec.mapZoomCenter
    xDim.filter([lonMin, lonMax])
    yDim.filter([latMin, latMax])
  }

  yield call(HeatLayer.crossfilter, cf)
  yield call(HeatLayer.xDim, xDim)
  yield call(HeatLayer.yDim, yDim)
  yield call(HeatLayer.setState, {
    mark: layerSpec.mark || DEFAULT_GEOHEAT_MARK,
    encoding: {
      x: {
        type: "quantitative",
        field: xValue,
        size: layerSpec.width
      },
      y: {
        type: "quantitative",
        field: yValue,
        size: layerSpec.height
      },
      color: {
        type: "quantize",
        aggregate: rasterUtils.toAggExpression(
          layerSpec.measures[0].aggType,
          layerSpec.measures[0].value
        ),
        legend: {
          title: `${
            layerSpec.measures[0].label
              ? process(layerSpec.measures[0].label, { useDisplayName: true })
              : layerSpec.measures[0].label
          } [${getDisplayOrParameterName(dataSource)}]`,
          open: layerSpec.legendOpen,
          locked: layerSpec.legendLocked
        },
        scale: {
          domain: layerSpec.colorDomain || "auto",
          range: layerSpec.color.val,
          opacity:
            typeof layerSpec.opacity === "undefined"
              ? layerDefaultOpacity(layerSpec.type)
              : layerSpec.opacity,
          default: "#0d0887",
          nullValue: "#999999"
        }
      },
      size: {
        type: "manual",
        value: layerSpec.pixelSize || DEFAULT_GEOHEAT_PIXEL_SIZE
      }
    },
    currentLayer: layerSpec.currentLayer
  })

  return HeatLayer
}

export function* handleUpdateGeoHeatSettings({
  chartId,
  layerName,
  type,
  layerSpec
}): Generator {
  const { dcFlag, ...chartStateSpec } = yield select(
    rasterUtils.selectChart(chartId)
  )
  const chartSpec = layerSpec ? layerSpec : chartStateSpec
  const dcChart = yield call(Services.get("dc").getChart, dcFlag)

  if (dcChart) {
    const GeoHeatLayer = dcChart.getLayer(layerName || "geoheat")
    if (GeoHeatLayer) {
      GeoHeatLayer.setState((state) => ({
        mark: chartSpec.mark || DEFAULT_GEOHEAT_MARK,
        encoding: {
          ...state.encoding,
          color: {
            ...state.encoding.color,
            aggregate: rasterUtils.toAggExpression(
              chartSpec.measures[0].aggType,
              chartSpec.measures[0].value
            ),
            legend: {
              title: `${
                chartSpec.measures[0].label
              } [${getDisplayOrParameterName(chartSpec.dataSource)}]`,
              open: chartSpec.legendOpen,
              locked: rasterUtils.rasterLegendConfig(chartSpec, "legendLocked")
            },
            scale: {
              ...state.encoding.color.scale,
              range: chartSpec.color.val,
              opacity:
                typeof chartSpec.opacity === "undefined"
                  ? layerDefaultOpacity(chartSpec.type)
                  : chartSpec.opacity
            }
          },
          size: {
            type: "manual",
            value: chartSpec.pixelSize || DEFAULT_GEOHEAT_PIXEL_SIZE
          }
        },
        currentLayer: chartSpec.currentLayer
      }))

      if (type === "SET_GEOHEAT_MEASURE") {
        GeoHeatLayer.setState(colorDomainSetter("auto"))
      }
    }

    yield call(dcChart.renderAsync)
  }
}

function* getSelectorMetaData(action) {
  // We're going to get the min/max of the geo dimensions here to auto zoom.
  // To force autozoom, a minMax property is set on each of the dimensions.
  // Later on, the fitData raster-chart-saga will be called to auto-zoom to these min/max.
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

export function* setGeoHeatDimension(action) {
  try {
    yield* getSelectorMetaData(action)
    yield* handleUpdateGeoHeatSettings({ chartId: action.chartId })
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
