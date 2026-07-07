// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  redrawAll,
  redrawChart,
  renderChart,
  renderChartRedrawAllWithExcludeChart
} from "actions/dc-action-creators"
import colorChart from "./color-chart"
import { intersects } from "utils/ramda-helpers"
import { CHART_TYPES } from "../../constants/charts"

const EVENT_UPDATES = [
  "filters",
  "rangeFilter",
  "mapZoomCenter",
  "timeBinInputVal"
]

const RENDER_UPDATES = ["height", "width", "geoJson"]

export const shouldNotUpdate = (chart, changes) =>
  (changes.height === 0 && changes.width === 0) ||
  (chart.height() === changes.height && chart.width() === changes.width)

export const createUpdateArray = (changes) => {
  const isClearingRangeAndFocusChart = changes.rangeFilter && changes.filters
  return isClearingRangeAndFocusChart
    ? ["rangeFilter", "filters"]
    : Object.keys(changes)
}

export default function createUpdateFunctionForChart(
  generalUpdate,
  updateMethods
) {
  return function withDispatch(dispatch) {
    const applyRedrawOrRender = applyRedrawOrRenderWithDispatch(dispatch)
    return function updateFunctionForChart(chart, changes, nextChartSpec) {
      if (shouldNotUpdate(chart, changes)) {
        return
      } else {
        createUpdateArray(changes).forEach((updateType) => {
          const specificUpdate = updateMethods[updateType]
          const performDCUpdate = specificUpdate || generalUpdate
          const diff = { [updateType]: changes[updateType] }

          if (shouldApplyAsyncUpdate(updateType)) {
            performDCUpdate(chart, diff, nextChartSpec, () => {
              applyUpdate(
                applyRedrawOrRender,
                nextChartSpec,
                updateType,
                chart,
                diff
              )
            })
          } else {
            performDCUpdate(chart, diff, nextChartSpec)
            applyUpdate(
              applyRedrawOrRender,
              nextChartSpec,
              updateType,
              chart,
              diff
            )
          }
        })
      }
    }
  }
}

function applyUpdate(
  applyRedrawOrRender,
  nextChartSpec,
  updateType,
  chart,
  diff
) {
  if (shouldApplyColor(nextChartSpec.type, updateType)) {
    colorChart(chart, nextChartSpec, () => {
      applyRedrawOrRender(chart, diff, nextChartSpec)
    })
  } else {
    applyRedrawOrRender(chart, diff, nextChartSpec)
  }
}

function shouldApplyAsyncUpdate(updateType) {
  switch (updateType) {
    case "geoJson":
      return true
    default:
      return false
  }
}

function shouldApplyColor(chartType, updateType) {
  switch (updateType) {
    case "measures":
    case "sortColumn":
    case "showOther":
    case "color":
      return (
        chartType !== "table" &&
        chartType !== "pointmap" &&
        chartType !== "backendScatter"
      )
    default:
      return false
  }
}

function renderNeeded(updateKeys, diff) {
  return (
    intersects(
      ["measures", "savedColors", "showOther", "renderArea"],
      updateKeys
    ) ||
    (updateKeys.includes("dimensions") && diff.dimensions[0].extract)
  )
}

function applyRedrawOrRenderWithDispatch(dispatch) {
  return function applyRedrawOrRender(dcChart, diff, chartSpec) {
    const updateKeys = Object.keys(diff)
    const filterUpdate =
      updateKeys.includes("filters") || updateKeys.includes("rangeFilter")
    const isHeatChart = chartSpec.type === CHART_TYPES.HEAT
    // We have to kick this off for heat so that crossfilter updates count widget
    if (isHeatChart && filterUpdate) {
      dispatch(
        renderChartRedrawAllWithExcludeChart(
          dcChart,
          dcChart.id,
          chartSpec.dataSource
        )
      )
    } else if (
      intersects(RENDER_UPDATES, updateKeys) ||
      isHeatChart ||
      ([CHART_TYPES.LINE, CHART_TYPES.HISTOGRAM].includes(chartSpec.type) &&
        renderNeeded(updateKeys, diff))
    ) {
      dispatch(renderChart(dcChart, dcChart.id))
    } else if (filterUpdate) {
      dispatch(redrawAll(chartSpec.dataSource))
    } else if (!intersects(EVENT_UPDATES, updateKeys)) {
      dispatch(redrawChart(dcChart, dcChart.id))
    }
  }
}
