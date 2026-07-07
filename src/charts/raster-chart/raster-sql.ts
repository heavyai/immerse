// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createParser } from "@heavyai/data-layer"
import { lastFilteredSize } from "@heavyai/charting/src/core/core-async"
import { path } from "ramda"
import Services from "services/immerse"
import buildFilterString from "services/ImmerseCrossFilter/build-filter-string"
import { boundingBoxEnabledFilterString } from "services/ImmerseCrossFilter/ImmerseCrossFilterBoundingBox"
import { isSelectorUsable, toTransformAgg } from "../../utils/selector-helpers"
import {
  doJoin,
  getColorBlock,
  getLayerCrossfilterDimension,
  getPointOrLineSize,
  isGeoTypeSupportedRasterChart,
  isLayerHidden,
  pointValue,
  rasterLegendConfig
} from "./raster-utils"
import {
  SIZE_RANGE_DEFAULTS,
  STROKE_WIDTH_RANGE_DEFAULTS
} from "../../constants/magic-variables"
import { CHART_TYPES } from "constants/chart-types"

function isValidPostFilter(postFilter) {
  const { operator, min, max, aggType, value, custom } = postFilter

  if (value && (aggType || custom)) {
    if (
      (operator === "not between" || operator === "between") &&
      typeof min === "number" &&
      !isNaN(min) &&
      typeof max === "number" &&
      !isNaN(max)
    ) {
      return true
    } else if (
      (operator === "equals" ||
        operator === "not equals" ||
        operator === "greater than or equals") &&
      typeof min === "number" &&
      !isNaN(min)
    ) {
      return true
    } else if (
      operator === "less than or equals" &&
      typeof max === "number" &&
      !isNaN(max)
    ) {
      return true
    } else if (operator === "null" || operator === "not null") {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

function getLineDataBlock(layerSpec) {
  const geocol = layerSpec.measures.find((d) => d.name === "geo")

  if (doJoin(layerSpec)) {
    const customDim = layerSpec.dimensions.find((d) => d.custom === true)
    const factTable = customDim
      ? layerSpec.dataSource
      : path(["dimensions", "0", "table"], layerSpec)

    return [
      {
        table: factTable,
        attr: path(["dimensions", "0", "value"], layerSpec)
      },
      {
        table: layerSpec.geoJoin.table,
        attr: layerSpec.geoJoin.column
      }
    ]
  } else {
    return [
      {
        table: geocol.table,
        attr: "rowid"
      }
    ]
  }
}

function getPolyDataBlock(layerSpec) {
  const geoCol = layerSpec.measures[0]

  if (doJoin(layerSpec)) {
    return [
      {
        table: layerSpec.dimensions[0].table,
        attr: layerSpec.dimensions[0].value
      },
      {
        table: layerSpec.geoJoin.table,
        attr: layerSpec.geoJoin.column
      }
    ]
  } else {
    return [
      {
        table: geoCol.table,
        attr: "rowid"
      }
    ]
  }
}

function currentLayer(dcFlag: string, layerId: string) {
  const dcChart = Services.get("dc").getChart(dcFlag)
  return dcChart.getLayerAt(layerId)
}

export function getTransforms(
  layerSpec,
  filter,
  globalFilter,
  transform,
  encoding,
  filteredSize,
  dcFlag,
  layerId,
  mapZoomCenter
) {
  const { dataSource, postFilters, type, filters } = layerSpec

  let state = {
    transform,
    encoding,
    ...(postFilters && isValidPostFilter(postFilters[0]) ? { postFilters } : {})
  }

  if ([CHART_TYPES.BACKEND_CHOROPLETH, CHART_TYPES.CONTOUR].includes(type)) {
    state = { ...state, ...{ data: getPolyDataBlock(layerSpec) } }

    // the same way we include bbox for BE Choropleth in heavyai-charting.
    // Choropleth has poly selection filter, so if we have both the selection filter and bbox in omnifilters,
    // we will get the two filters connected with AND in WHERE clause which we should avoid in order to receive grayed out polygon
    const bboxFilter = `ST_XMax(${encoding.geocol}) >= ${mapZoomCenter.bounds.lonMin} AND ST_XMin(${encoding.geocol}) <= ${mapZoomCenter.bounds.lonMax} AND ST_YMax(${encoding.geocol}) >= ${mapZoomCenter.bounds.latMin} AND ST_YMin(${encoding.geocol}) <= ${mapZoomCenter.bounds.latMax}`

    return currentLayer(dcFlag, layerId).getTransforms({
      bboxFilter,
      filter,
      globalFilter,
      layerFilter: filters || [],
      filtersInverse: currentLayer(dcFlag, layerId).filtersInverse(),
      state,
      lastFilteredSize: currentLayer(dcFlag, layerId).getState().bboxCount,
      isDataExport: true
    })
  } else if (
    [
      CHART_TYPES.POINTMAP,
      CHART_TYPES.BACKEND_SCATTER,
      CHART_TYPES.LINEMAP
    ].includes(type)
  ) {
    if (type === CHART_TYPES.LINEMAP) {
      state = { ...state, ...{ data: getLineDataBlock(layerSpec) } }
    }
    // All the other raster charts are geospatial in nature
    const isGeo = type !== CHART_TYPES.BACKEND_SCATTER

    return currentLayer(dcFlag, layerId).getTransforms(
      dataSource,
      filter,
      globalFilter,
      state,
      filteredSize,
      true,
      isGeo
    )
  }
  return null
}

/**
 * Returns the layer index for a chart in an array of only visible layers, or -1 if the given layer is hidden.
 * This is useful for accessing the target layer in charting, as charting does not currently hold hidden layers in state.
 * @param chart Redux chartspec
 * @param layerIndex Index for the layer in redux store
 */
function getVisibleLayerIndex(chart, layerIndex: number) {
  if (chart.layers && isLayerHidden(chart.layers[layerIndex])) {
    return -1
  }

  if (chart.layers?.length) {
    const numLayersHiddenBeforeLayer = chart.layers
      .slice(0, layerIndex)
      .reduce(
        (sum: number, currLayer) => (isLayerHidden(currLayer) ? sum + 1 : sum),
        0
      )
    return layerIndex - numLayersHiddenBeforeLayer
  }
  return 0
}

export function buildRasterExportSql(chartId, chart, layerIndex, maxLimit) {
  const visibleLayerIndex = getVisibleLayerIndex(chart, layerIndex)

  if (visibleLayerIndex < 0) {
    // SQL building depends on charting methods that cannot be used on hidden layers as-is
    return ""
  }

  const parser = createParser()
  const layer = chart.layers?.length ? chart.layers[layerIndex] : chart
  const cfManager = Services.get("crossfilter")
  const cf = cfManager.getCrossfilter(layer.dataSource, chartId)

  const geoMeasure = layer.measures.find((d) => d.name === "geo")

  const cfCol = [CHART_TYPES.POINTMAP, CHART_TYPES.BACKEND_SCATTER].includes(
    layer.type
  )
    ? pointValue(layer.measures, 1)
    : doJoin(layer)
    ? layer.dimensions[0].value
    : geoMeasure.value

  const cfDim = getLayerCrossfilterDimension(
    chartId,
    layer.dataSource,
    cfCol,
    cf
  )

  const filteredSize = lastFilteredSize(cfDim.crossfilter.getId())

  const groupby = layer.dimensions.filter(isSelectorUsable).map((d) => d.value)

  let limit =
    layer.type === "backendChoropleth" || layer.type === CHART_TYPES.CONTOUR
      ? layer.polyCap
      : layer.cap
  if (maxLimit) {
    limit = Math.min(limit, maxLimit)
  }

  const transform = {
    sample: true,
    limit,
    tableSize: filteredSize,
    ...(groupby.length ? { groupby } : {})
  }

  let sizeRangeDefaults = null
  if (
    [CHART_TYPES.POINTMAP, CHART_TYPES.BACKEND_SCATTER].includes(layer.type)
  ) {
    sizeRangeDefaults = SIZE_RANGE_DEFAULTS
  } else if (layer.type === "linemap") {
    sizeRangeDefaults = STROKE_WIDTH_RANGE_DEFAULTS
  }

  let size = null
  if (
    [
      CHART_TYPES.POINTMAP,
      CHART_TYPES.BACKEND_SCATTER,
      CHART_TYPES.LINEMAP
    ].includes(layer.type)
  ) {
    size = getPointOrLineSize(
      layer.measures.find((m) => m.name === "size"),
      layer.sizeRange,
      layer.autoSize,
      layer.sizeDomain || chart.sizeDomain,
      groupby.length,
      sizeRangeDefaults
    )
  }

  const color = getColorBlock(
    layer.color,
    layer.measures.find((m) => m.name === "color"),
    layer.densityAccumulatorEnabled,
    layer.opacity || chart.opacity,
    layer.legendOpen || chart.legendOpen,
    groupby.length,
    rasterLegendConfig(chart, "colorDomain"),
    rasterLegendConfig(layer, "legendLocked") || false,
    layer.type,
    layer.showOther || chart.showOther,
    layer.dataSource
  )

  const hasXYEncoding = [
    CHART_TYPES.POINTMAP,
    CHART_TYPES.BACKEND_SCATTER
  ].includes(layer.type)
  const encoding = {
    ...(hasXYEncoding
      ? {
          x: {
            type: "quantitative",
            field: ["pointmap"].includes(layer.type)
              ? pointValue(layer.measures, 0)
              : layer.measures[0].value,
            ...(groupby.length
              ? { aggregate: toTransformAgg(layer.measures[0].aggType) }
              : {})
          }
        }
      : {}),
    ...(hasXYEncoding
      ? {
          y: {
            type: "quantitative",
            field:
              layer.type === "pointmap"
                ? pointValue(layer.measures, 1)
                : layer.measures[1].value,
            ...(groupby.length
              ? { aggregate: toTransformAgg(layer.measures[1].aggType) }
              : {})
          }
        }
      : {}),
    ...(isGeoTypeSupportedRasterChart(layer.type)
      ? { geocol: geoMeasure.value }
      : {}),
    ...(isGeoTypeSupportedRasterChart(layer.type)
      ? { geoTable: geoMeasure.table }
      : {}),
    ...(size ? { size } : {}),
    color
  }

  const filter = boundingBoxEnabledFilterString({
    newFilterString: buildFilterString(chartId, {
      includeGlobal: false,
      includeCharts: true,
      tables: cfDim.crossfilter.getTables(),
      dataSource: cfDim.crossfilter.getDataSource(),
      LayerId: layerIndex
    }),
    chartId,
    newCrossFilter: cfDim.crossfilter,
    layerId: layerIndex
  })

  const globalFilter = buildFilterString(chartId, {
    includeGlobal: true,
    includeCharts: false,
    tables: cfDim.crossfilter.getTables(),
    dataSource: cfDim.crossfilter.getDataSource()
  })

  let dataSource = layer.dataSource
  if (doJoin(layer) && layer.type === "backendChoropleth") {
    dataSource = `${layer.geoJoin.table}, colors`
  } else if (layer.type === "linemap") {
    const data = getLineDataBlock(layer)
    dataSource = [...new Set(data.map((source) => source.table))].join(", ")
  }

  return parser.writeSQL({
    type: "root",
    source: dataSource,
    transform: getTransforms(
      layer,
      filter,
      globalFilter,
      transform,
      encoding,
      filteredSize,
      chart.dcFlag,
      visibleLayerIndex,
      chart.mapZoomCenter
    )
  })
}
