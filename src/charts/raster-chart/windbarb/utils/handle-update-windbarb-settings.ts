// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { call, put, select } from "redux-saga/effects"
import { getPointmapOrientation } from "charts/utils/get-pointmap-orientation"
import Services from "services/immerse"
import { mergeNewWindbarbTransformState } from "charts/raster-chart/windbarb/utils/merge-new-windbarb-transform-state"
import { getWindbarbLayerState } from "charts/raster-chart/windbarb/utils/get-windbarb-layer-state"
import { getWindbarbSpeedSpec } from "charts/raster-chart/windbarb/utils/get-windbarb-speed-spec"
import { getPointmapColor } from "charts/raster-chart/point/utils/get-pointmap-color"
import {
  CHART_TYPE_WINDBARB,
  WINDBARB_DEFAULT_SIZE
} from "charts/raster-chart/windbarb/constants"
import { getWindbarbDirectionFromPointmapOrientation } from "charts/raster-chart/windbarb/utils/get-windbarb-direction-from-pointmap-orientation"
import { isSelectorUsable } from "utils/selector-helpers"
import { getWindbarbColorFromPointmapColor } from "charts/raster-chart/windbarb/utils/get-windbarb-color-from-pointmap-color"
import { RENDER_ALL_ERROR } from "constants/action-types"
import {
  selectChart,
  pointValue,
  rasterLegendConfig
} from "charts/raster-chart/raster-utils"

export function* handleUpdateWindbarbSettings({
  chartId,
  layerName = null,
  layerSpec
}): Generator {
  const { dcFlag, ...chartStateSpec } = yield select(selectChart(chartId))

  const { id: dashboardId, selectedTabId: tabId } = yield select(
    (state) => state.dashboard
  )

  const chartSpec = layerSpec ? layerSpec : chartStateSpec
  const dcChart = yield call(Services.get("dc").getChart, dcFlag)
  const {
    cap,
    color,
    measures,
    postFilters,
    dimensions,
    densityAccumulatorEnabled,
    colorRamps,
    type,
    currentLayer,
    rasterShowOther
  } = chartSpec

  if (dcChart && !chartSpec.hasError) {
    const groupby = dimensions.filter(isSelectorUsable).map((d) => d.value)

    const xValue = pointValue(measures, 0)
    const yValue = pointValue(measures, 1)
    let layer = yield call(dcChart.getLayer, layerName || chartSpec.type)

    if (type === CHART_TYPE_WINDBARB && !layer) {
      layer = yield call(dcChart.getLayerAt, 0) // can use first index layer from z-indexed layers
    }

    const colorSpec = yield getWindbarbColorFromPointmapColor(
      getPointmapColor(
        color,
        measures.find((m) => m.name === "color"),
        densityAccumulatorEnabled,
        chartSpec.opacity,
        chartSpec.legendOpen,
        groupby.length,
        rasterLegendConfig(chartSpec, "colorDomain"),
        rasterLegendConfig(chartSpec, "legendLocked") || false,
        rasterShowOther,
        chartSpec.dataSource
      )
    )

    const speedSpec = getWindbarbSpeedSpec(measures)

    const directionSpec = getWindbarbDirectionFromPointmapOrientation(
      getPointmapOrientation(
        measures.find((m) => m.name === "orientation"),
        groupby.length
      )
    )

    if (layer) {
      layer.setState((state) => {
        const newState = getWindbarbLayerState({
          xValue,
          yValue,
          measures,
          tableSize: state.tableSize,
          cap,
          groupby,
          sizeSpec: { value: WINDBARB_DEFAULT_SIZE },
          colorSpec,
          colorRamps,
          speedSpec,
          directionSpec,
          currentLayer,
          postFilters
        })
        const mergedStates = {
          ...state,
          ...newState,
          transform: mergeNewWindbarbTransformState(
            state.transform,
            newState.transform
          ),
          encoding: {
            ...state.encoding,
            ...newState.encoding
          }
        }
        return mergedStates
      })
    }

    if (layer) {
      if (color?.prioritizedColor?.length > 0) {
        layer.setZIndexedLayers(dcChart, color.prioritizedColor)
      } else {
        const currentLayerNames = dcChart.getLayerNames(dcChart) || []
        if (currentLayerNames.every((name) => name.includes("_z"))) {
          layer.removeZIndexedLayers(dcChart)
        }
      }
    }

    try {
      yield call(dcChart.renderAsync)
    } catch (error) {
      yield put({ type: RENDER_ALL_ERROR, error, dashboardId, tabId })
    }
  }
}
