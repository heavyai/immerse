// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as rasterUtils from "../raster-utils"
import * as rasterPopupUtils from "../raster-popup-utils"
import { call, put, select } from "redux-saga/effects"
import { RENDER_ALL_ERROR } from "constants/action-types"
import { DEFAULT_POINT_MARK_SHAPE } from "constants/magic-variables"
import {
  isSelectorUsable,
  toPostFilterAgg,
  toTransformAgg
} from "utils/selector-helpers"
import { CHARTS } from "constants/charts"
import { CHART_TYPES } from "constants/chart-types"
import { SCALE_TYPES } from "constants/scale-types"
import { SELECTOR_ASSIGNMENTS } from "constants/selectors"
import Services from "services/immerse"
import { getPointmapOrientation } from "../../utils/get-pointmap-orientation"
import { getPointmapColor } from "./utils/get-pointmap-color"
import { getPointmapSize } from "./utils/get-pointmap-size"
import { COLOR_MEASURE_INDEX } from "./utils/get-selector-meta-data"
import { getMeasureMinMax } from "./utils/get-measure-min-max"
import { setBackendScatterDomains } from "./utils/set-scatterplot-domain"
import { calculateLogScaleMin } from "charts/utils/coordinate-helpers"
import { immerseAutoFormatter } from "utils/auto-formatter"

const SIZE_MEASURE_INDEX = 2

export function* createPointLayer({
  dimensions,
  measures,
  dataSource,
  cap,
  color,
  type,
  opacity,
  markShape,
  densityAccumulatorEnabled,
  autoSize,
  sizeRange,
  legendOpen,
  sizeDomain,
  colorDomain,
  colorRamps,
  legendLocked,
  hoverSelectedColumns = [],
  mapZoomCenter,
  currentLayer,
  postFilters,
  chartId,
  popupEnabled,
  rasterShowOther,
  scaleType,
  fullColorHashing
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

  const PointLayer = yield call(dc.rasterLayer, "points")

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

  const sizeSpec = yield call(
    getPointmapSize,
    updatedMeasures.find((m) => m.name === "size"),
    sizeRange,
    autoSize,
    sizeDomain,
    groupby.length
  )

  // Applying new props to old charts was dispatched before dispatching createGeoHeatChart, but the state is not updated here
  // Thus, getting updated chart again to retrieve the props
  const updatedChart = yield select(rasterUtils.selectChart(chartId))
  const finalColor = yield rasterUtils.getChartColor(color)

  const colorSpec = yield call(
    getPointmapColor,
    // TODO: Re-test the bug that this PR fixed, do we need some kind of updated chart thing here still?
    // https://github.com/heavyai/immerse/pull/7507
    finalColor,
    updatedMeasures.find((m) => m.name === "color"),
    densityAccumulatorEnabled,
    opacity,
    legendOpen,
    groupby.length,
    colorDomain,
    legendLocked,
    // TODO: Re-test the bug that this PR fixed, do we need some kind of updated chart thing here still?
    rasterShowOther === undefined
      ? updatedChart.rasterShowOther
      : rasterShowOther,
    dataSource,
    fullColorHashing
  )

  const orientationSpec = yield call(
    getPointmapOrientation,
    updatedMeasures.find((m) => m.name === "orientation"),
    groupby.length
  )

  yield call(xDim.filter, [lonMin, lonMax])
  yield call(yDim.filter, [latMin, latMax])

  yield call(PointLayer.crossfilter, cf)
  yield call(PointLayer.xDim, xDim)
  yield call(PointLayer.yDim, yDim)
  yield call(PointLayer.setState, {
    transform: {
      sample: true,
      limit: cap,
      tableSize,
      ...(groupby.length ? { groupby } : {})
    },
    mark: "point",
    encoding: {
      x: {
        type: "quantitative",
        field: type === "pointmap" ? `conv_4326_900913_x(${xValue})` : xValue,
        ...(groupby.length
          ? { aggregate: toTransformAgg(updatedMeasures[0].aggType) }
          : {}),
        label: updatedMeasures[0].label
      },
      y: {
        type: "quantitative",
        field: type === "pointmap" ? `conv_4326_900913_y(${yValue})` : yValue,
        ...(groupby.length
          ? { aggregate: toTransformAgg(updatedMeasures[1].aggType) }
          : {}),
        label: updatedMeasures[1].label
      },
      size: sizeSpec,
      color: colorSpec,
      colorRamps,
      orientation: orientationSpec
    },
    config: {
      point: {
        shape: markShape || DEFAULT_POINT_MARK_SHAPE
      }
    },
    // enableHitTesting flag depends not just on popupEnable toggle but also require to have a popup column
    // selection to avoid unnecessary hit testing call to rendering
    enableHitTesting:
      (hoverSelectedColumns.length > 0 || groupby.length > 0) && popupEnabled,
    currentLayer,
    postFilters:
      postFilters && postFilters.length
        ? postFilters.map((postFilter) => {
            if (
              postFilter.aggType === "# Unique" ||
              postFilter.aggType === "Median"
            ) {
              return {
                ...postFilter,
                aggType: toPostFilterAgg(postFilter.aggType)
              }
            } else {
              return postFilter
            }
          })
        : CHARTS[type].postFilters
  })

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

  PointLayer.popupColumns(popupColumns)
  PointLayer.popupColumnsMapped(popupAliases)

  const dcChart = yield call(Services.get("dc").getChart, updatedChart.dcFlag)
  if (dcChart && type === CHART_TYPES.BACKEND_SCATTER) {
    // need to provide domain values used in charting when axes are locked
    yield call(setBackendScatterDomains, dcChart, type, updatedMeasures)

    // if we have a log scale, need to modify domain and bounds to ensure min > 0
    if (scaleType === SCALE_TYPES.LOG) {
      yield call(PointLayer.yDim().filter, [
        calculateLogScaleMin(latMin, latMax),
        latMax
      ])
      yield call(dcChart.y().domain, [
        calculateLogScaleMin(latMin, latMax),
        latMax
      ])
      // since d3 uses scienfitic notation as default for log scales, force standard notation
      // by formatting axis used for log scale if formatting has not already been applied
      const yMeasureFormat = measures
        .filter((m) => m.name === SELECTOR_ASSIGNMENTS.Y)
        .map((m) => ({
          key: m.label,
          format:
            hoverSelectedColumns.find((h) => h.value === m.value)?.format ??
            ".2s"
        }))
      dcChart.valueFormatter(immerseAutoFormatter(yMeasureFormat))
    }
    yield call(dcChart.yScaleType, scaleType)
  }

  return PointLayer
}

export function* handleUpdatePointmapSettings({
  chartId,
  layerName = null,
  layerSpec
}): Generator {
  const { dcFlag, ...chartStateSpec } = yield select(
    rasterUtils.selectChart(chartId)
  )

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
    sizeRange,
    autoSize,
    hoverSelectedColumns = [],
    sizeDomain,
    markShape,
    colorRamps,
    type,
    currentLayer,
    popupEnabled,
    rasterShowOther,
    dataSource,
    scaleType,
    fullColorHashing
  } = chartSpec

  const finalColor = yield rasterUtils.getChartColor(color)

  if (dcChart && !chartSpec.hasError) {
    const groupby = dimensions.filter(isSelectorUsable).map((d) => d.value)

    const xValue = rasterUtils.pointValue(measures, 0)
    const yValue = rasterUtils.pointValue(measures, 1)
    let PointLayer = yield call(dcChart.getLayer, layerName || chartSpec.type)

    const updatedMeasures = yield call(getMeasureMinMax, measures, chartId)
    // need to provide domain values used in charting when axes are locked
    yield call(setBackendScatterDomains, dcChart, type, updatedMeasures)
    const yBounds = {
      min: updatedMeasures?.[1]?.minMax?.[0],
      max: updatedMeasures?.[1]?.minMax?.[1]
    }

    if (type === "pointmap" && !PointLayer) {
      PointLayer = yield call(dcChart.getLayerAt, 0) // can use first index layer from z-indexed layers
    }

    const orientationSpec = yield call(
      getPointmapOrientation,
      measures.find((m) => m.name === "orientation"),
      groupby.length
    )

    if (PointLayer) {
      if (
        type === CHART_TYPES.BACKEND_SCATTER &&
        yBounds.min !== undefined &&
        yBounds.max !== undefined
      ) {
        if (scaleType === SCALE_TYPES.LOG) {
          // if we have a log scale, need to modify domain and bounds to ensure min > 0
          yield call(PointLayer.yDim().filter, [
            calculateLogScaleMin(yBounds.min, yBounds.max),
            yBounds.max
          ])
          yield call(dcChart.y().domain, [
            calculateLogScaleMin(yBounds.min, yBounds.max),
            yBounds.max
          ])
          // since d3 uses scienfitic notation as default for log scales, force standard notation
          // by formatting axis used for log scale if formatting has not already been applied
          const yMeasureFormat = measures
            .filter((m) => m.name === SELECTOR_ASSIGNMENTS.Y)
            .map((m) => ({
              key: m.label,
              format:
                hoverSelectedColumns.find((h) => h.value === m.value)?.format ??
                ".2s"
            }))
          dcChart.valueFormatter(immerseAutoFormatter(yMeasureFormat))
        } else {
          yield call(PointLayer.yDim().filter, [yBounds.min, yBounds.max])
        }

        yield call(dcChart.yScaleType, scaleType)
      }

      PointLayer.setState((state) => ({
        ...state,
        transform: {
          ...state.transform,
          limit: cap,
          groupby
        },
        encoding: {
          ...state.encoding,
          x: {
            type: "quantitative",
            field:
              type === "pointmap" ? `conv_4326_900913_x(${xValue})` : xValue,
            ...(groupby.length
              ? { aggregate: toTransformAgg(measures[0].aggType) }
              : {}),
            label: measures[0].label
          },
          y: {
            type: "quantitative",
            field:
              type === "pointmap" ? `conv_4326_900913_y(${yValue})` : yValue,
            ...(groupby.length
              ? { aggregate: toTransformAgg(measures[1].aggType) }
              : {}),
            label: measures[1].label
          },
          color: getPointmapColor(
            finalColor,
            measures[COLOR_MEASURE_INDEX],
            densityAccumulatorEnabled,
            chartSpec.opacity,
            chartSpec.legendOpen,
            groupby.length,
            rasterUtils.rasterLegendConfig(chartSpec, "colorDomain"),
            rasterUtils.rasterLegendConfig(chartSpec, "legendLocked") || false,
            rasterShowOther,
            dataSource,
            fullColorHashing
          ),
          size: getPointmapSize(
            measures[SIZE_MEASURE_INDEX],
            sizeRange,
            autoSize,
            sizeDomain,
            groupby.length
          ),
          colorRamps,
          orientation: orientationSpec
        },
        config: {
          point: {
            shape: markShape || DEFAULT_POINT_MARK_SHAPE
          }
        },
        enableHitTesting:
          (hoverSelectedColumns.length > 0 || groupby.length > 0) &&
          popupEnabled,
        currentLayer,
        postFilters: postFilters.map((postFilter) => {
          if (
            postFilter.aggType === "# Unique" ||
            postFilter.aggType === "Median"
          ) {
            return {
              ...postFilter,
              aggType: toPostFilterAgg(postFilter.aggType)
            }
          } else {
            return postFilter
          }
        })
      }))

      const [
        popupColumns,
        popupAliases
      ] = rasterPopupUtils.reduceAggAndAliasMapPopupColumns(
        type,
        hoverSelectedColumns,
        dimensions,
        measures,
        groupby.length,
        chartId
      )

      PointLayer.popupColumns(popupColumns)
      PointLayer.popupColumnsMapped(popupAliases)
    }

    if (type === CHART_TYPES.POINTMAP && PointLayer) {
      if (finalColor?.prioritizedColor?.length > 0) {
        PointLayer.setZIndexedLayers(dcChart, finalColor.prioritizedColor)
      } else {
        const currentLayerNames = dcChart.getLayerNames(dcChart) || []
        if (currentLayerNames.every((name) => name.includes("_z"))) {
          PointLayer.removeZIndexedLayers(dcChart)
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
