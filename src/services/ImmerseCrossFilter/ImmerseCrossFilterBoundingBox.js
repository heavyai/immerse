// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getStore, getLayerIdFromName } from "./utils"
import { buildBoundingBoxFilter } from "vega/actions/filter-action-creators-crossfilter-interop"
import { isBERendered } from "charts/raster-chart/raster-utils"
import {
  buildFilterSql,
  betweenFilter,
  andFilter
} from "vega/constants/filter-types"
import { CHART_TYPES } from "constants/charts"
import { CHART_TYPE_WINDBARB } from "charts/raster-chart/windbarb/constants"

export function boundingBoxEnabledFilterString({
  newFilterString,
  chartId,
  newCrossFilter,
  layerName,
  layerId
}) {
  const chart = getStore().getState().charts[newCrossFilter.chartId]
  const table = newCrossFilter.getDataSource()
  return boundingBoxEnabledFilterStringInternal({
    newFilterString,
    chartId,
    table,
    layerName,
    layerId,
    chart
  })
}

export function boundingBoxEnabledFilterStringInternal({
  newFilterString,
  chartId,
  table,
  layerName,
  layerId,
  chart
}) {
  // the easy case. We have a filter string. Return it.
  // no chart id? Also fail out.
  if (newFilterString !== "" || !chartId) {
    return newFilterString
  }
  // otherwise, we do NOT have a filter string. Check the chart/layer type.
  else {
    // even now, we'll assume that we do NOT need a bounding box.
    let needsBoundingBox = false

    // did we some how get here w/o a valid chartid? Just return an empty string.
    if (!chart) {
      return newFilterString
    }

    if (layerId === undefined) {
      // pull out the layer id from the layer name
      layerId = getLayerIdFromName(layerName, chart)
    }

    // if we have layers, look for one that has our table
    if (chart.layers) {
      const layer = chart.layers[layerId]
      if (layer) {
        needsBoundingBox =
          // this data is ridiculously inconsistent.
          // if the layer's dataSource is our table, it's a match!
          // but if it's the initial render, it may not be populated yet. So instead check to see if the layer doesn't
          // have a dataSource and our table match's the chart's instead. Fun!
          (layer.dataSource === table ||
            (layer.dataSource === undefined && chart.dataSource === table)) &&
          isBERendered(layer.type)
      }
    }
    // if not, check the chart's type, unless it's cross-section, or windbarb, which doesn't need one
    else {
      needsBoundingBox = [
        CHART_TYPES.CROSS_SECTION,
        CHART_TYPES.CROSS_SECTION_TERRAIN,
        CHART_TYPE_WINDBARB
      ].includes(chart.type)
        ? false
        : isBERendered(chart.type)
    }

    // if we don't need a bounding box, then bail out early.
    if (!needsBoundingBox) {
      return newFilterString
    }

    // pointmap, linemap, geoheat all have mapZoomCenter params. We can use those to build a bounding box.
    if (chart.type !== "backendScatter") {
      // Now, construct a bounding box filter
      let mapZoomCenter = chart.mapZoomCenter
      // OMFG. On initial render, we haven't created a mapZoomCenter yet. So we need to look to see if
      // we have an xMeasure, and also a minMax on the layer. If not, we look to the chart. That gives us the longs
      // repeat for the yMeasure to get the lats.
      // then use it to build a fake bounding box.
      if (mapZoomCenter === undefined) {
        const xMeasure =
          chart.layers[layerId].measures.find(
            (m) => m.name === "x" && m.minMax && m.minMax.length === 2
          ) ||
          chart.measures.find(
            (m) => m.name === "x" && m.minMax && m.minMax.length === 2
          )
        const yMeasure =
          chart.layers[layerId].measures.find(
            (m) => m.name === "y" && m.minMax && m.minMax.length === 2
          ) ||
          chart.measures.find(
            (m) => m.name === "y" && m.minMax && m.minMax.length === 2
          )

        const geoMeasure =
          chart.layers[layerId].measures.find(
            (m) => m.name === "geo" && m.categories && m.categories.length === 4
          ) ||
          chart.measures.find(
            (m) => m.name === "geo" && m.categories && m.categories.length === 4
          )
        // const dcChart = dc.getChart(chart.dcFlag)
        // const bounds = dcChart.getDataRenderBounds()
        // bounds are NW, NE, SE, SW. We need NW and SE values.
        if (xMeasure && yMeasure) {
          mapZoomCenter = {
            bounds: {
              lonMin: xMeasure.minMax[0],
              latMin: yMeasure.minMax[0],
              lonMax: xMeasure.minMax[1],
              latMax: yMeasure.minMax[1]
            }
          }
        } else if (geoMeasure) {
          mapZoomCenter = {
            bounds: {
              lonMin: geoMeasure.categories[0],
              lonMax: geoMeasure.categories[1],
              latMin: geoMeasure.categories[2],
              latMax: geoMeasure.categories[3]
            }
          }
        }
      }
      const boundingBox = buildBoundingBoxFilter({
        chart,
        chartDimensions: chart.dimensions,
        // old pointmaps might not have a layers array. If we have one and an ID, use it - if not, it's undef.
        layer:
          chart.layers && layerId !== undefined
            ? chart.layers[layerId]
            : undefined,
        mapZoomCenter
      })

      const boundingBoxSql = buildFilterSql([boundingBox])[0]
      return boundingBoxSql
    }
    // the only other option should be backendScatter, but be extra careful
    else if (chart.type === "backendScatter") {
      const xMeasure = chart.measures.find((m) => m.name === "x")
      const yMeasure = chart.measures.find((m) => m.name === "y")
      if (xMeasure && xMeasure.minMax && yMeasure && yMeasure.minMax) {
        const boundingBox = andFilter([
          betweenFilter(
            xMeasure.table,
            chart.dataSource,
            xMeasure.value,
            xMeasure.type,
            xMeasure.minMax[0],
            xMeasure.minMax[1]
          ),
          betweenFilter(
            yMeasure.table,
            chart.dataSource,
            yMeasure.value,
            yMeasure.type,
            yMeasure.minMax[0],
            yMeasure.minMax[1]
          )
        ])
        const boundingBoxSql = buildFilterSql([boundingBox])[0]
        return boundingBoxSql
      }
    }

    // you should never get here. But be super extra careful.
    return newFilterString
  }
}
