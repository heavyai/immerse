// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as rasterUtils from "../raster-utils"
import * as rasterPopupUtils from "../raster-popup-utils"
import { call, select } from "redux-saga/effects"
import { isSelectorUsable } from "utils/selector-helpers"
import Services from "services/immerse"
import { getPointmapOrientation } from "../../utils/get-pointmap-orientation"
import { getWindbarbDirectionFromPointmapOrientation } from "./utils/get-windbarb-direction-from-pointmap-orientation"
import { getWindbarbColorFromPointmapColor } from "./utils/get-windbarb-color-from-pointmap-color"
import { getWindbarbSpeedSpec } from "./utils/get-windbarb-speed-spec"
import { getWindbarbLayerState } from "./utils/get-windbarb-layer-state"
import { getPointmapColor } from "../point/utils/get-pointmap-color"
import { getMeasureMinMax } from "../point/utils/get-measure-min-max"
import { WINDBARB_DEFAULT_SIZE } from "charts/raster-chart/windbarb/constants"

export function* createWindbarbLayer({
  dimensions,
  measures,
  dataSource,
  cap,
  color,
  type,
  opacity,
  densityAccumulatorEnabled,
  legendOpen,
  colorDomain,
  colorRamps,
  legendLocked,
  hoverSelectedColumns = [],
  mapZoomCenter,
  currentLayer,
  postFilters,
  chartId,
  rasterShowOther
}) {
  const dc = Services.get("dc")
  const cfManager = Services.get("crossfilter")
  const cf = yield call(cfManager.getCrossfilter, dataSource, chartId)
  const updatedMeasures = yield call(getMeasureMinMax, measures, chartId)
  const updatedMapZoomCenter =
    typeof mapZoomCenter !== "undefined" && mapZoomCenter !== null
      ? mapZoomCenter
      : {
          bounds: {
            lonMin: updatedMeasures[0].minMax[0],
            lonMax: updatedMeasures[0].minMax[1],
            latMin: updatedMeasures[1].minMax[0],
            latMax: updatedMeasures[1].minMax[1]
          }
        }
  const {
    bounds: { lonMin, lonMax, latMin, latMax }
  } = updatedMapZoomCenter

  const layer = yield call(dc.rasterLayer, "windbarbs")

  const xValue = rasterUtils.pointValue(updatedMeasures, 0)
  const yValue = rasterUtils.pointValue(updatedMeasures, 1)

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

  const tableSize = yield call(yDim.groupAll().valueAsync)

  const groupby = dimensions.filter(isSelectorUsable).map((d) => d.value)

  const speedSpec = getWindbarbSpeedSpec(updatedMeasures)

  // Applying new props to old charts was dispatched before dispatching createGeoHeatChart, but the state is not updated here
  // Thus, getting updated chart again to retrieve the props
  const updatedChart = yield select(rasterUtils.selectChart(chartId))

  const colorSpec = yield getWindbarbColorFromPointmapColor(
    getPointmapColor(
      color?.type === "custom" && !color.hasOwnProperty("hideOther")
        ? updatedChart.color
        : color,
      updatedMeasures.find((m) => m.name === "color"),
      densityAccumulatorEnabled,
      opacity,
      legendOpen,
      groupby.length,
      colorDomain,
      legendLocked,
      rasterShowOther === undefined
        ? updatedChart.rasterShowOther
        : rasterShowOther
    )
  )

  const directionSpec = getWindbarbDirectionFromPointmapOrientation(
    getPointmapOrientation(
      updatedMeasures.find((m) => m.name === "orientation"),
      groupby.length
    )
  )

  yield call(xDim.filter, [lonMin, lonMax])
  yield call(yDim.filter, [latMin, latMax])

  yield call(layer.crossfilter, cf)
  yield call(layer.xDim, xDim)
  yield call(layer.yDim, yDim)
  const layerState = getWindbarbLayerState({
    xValue,
    yValue,
    measures: updatedMeasures,
    tableSize,
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

  yield layer.setState(layerState)

  const [popupColumns, popupAliases] = groupby.length
    ? rasterPopupUtils.reduceAggAndAliasMapPopupColumns(
        type,
        updatedChart.hoverSelectedColumns || hoverSelectedColumns,
        updatedChart.dimensions || dimensions,
        updatedChart.measures || measures,
        groupby.length,
        chartId
      )
    : rasterPopupUtils.reduceAggAndAliasMapPopupColumns(
        type,
        hoverSelectedColumns,
        dimensions,
        measures,
        groupby.length,
        chartId
      )

  layer.popupColumns(popupColumns)
  layer.popupColumnsMapped(popupAliases)

  return layer
}
