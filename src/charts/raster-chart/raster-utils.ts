// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// DO NOT import from services/immerse, services/ImmerseCrossFilter, or any of the
// files in the same directory as this file. Otherwise, the ensuing circular
// dependencies will break everything in very non-obvious ways.
import { equals, path } from "ramda"
import { isSelectorUsable, toTransformAgg } from "utils/selector-helpers"
import {
  layerDefaultOpacity,
  SIZE_DOMAIN_DEFAULTS
} from "constants/magic-variables"
import { CHARTS_DEFAULT_COLORS, getColors } from "services/colors"
import { CHART_DEFS, CHART_TYPES } from "constants/charts"
import { importableProcess as process } from "utils/ImmerseSQLPlusPlus/parser-importable"
import { getDisplayOrParameterName } from "utils/get-display-or-parameter-name"
import { CHART_TYPE_WINDBARB } from "./windbarb/constants"
import { isCrossSectionTerrainEnabled } from "./cross-section/hooks/use-cross-section-terrain-enabled"
import { isCrossSectionType } from "./cross-section/utils/is-cross-section-type"
import { select } from "redux-saga/effects"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import { PaletteMapping } from "components/shared-settings/types"

export function toAggExpression(type: string, field: string) {
  switch (type) {
    case "Custom":
      return field
    case "# Unique":
      return {
        type: "count",
        approx: true,
        distinct: true,
        field
      }
    case "Avg":
      return {
        type: "average",
        field
      }
    case "Median":
    case "Stddev":
      return {
        type: type.toLowerCase(),
        x: field
      }
    case "Sum":
    case "Min":
    case "Max":
      return {
        type: type.toLowerCase(),
        field
      }
    default:
      return {
        type: "count",
        field
      }
  }
}

export const selectChart = (id) => ({ charts }) => charts[id] || {}

export const colorDomainSetter = (domain) => (state) => ({
  ...state,
  encoding: {
    ...state.encoding,
    color: {
      ...state.encoding.color,
      domain,
      scale: {
        ...state.encoding.color.scale,
        domain
      }
    }
  }
})

export const getRasterLayersDiff = (layersA, layersB) =>
  layersB.filter(
    (layerB) =>
      !layersA.find((layerA) => layerB.rasterLayerId === layerA.rasterLayerId)
  )

export const findRasterLayerIndexById = (layers, rasterLayerId) =>
  layers.findIndex((layer) => layer.rasterLayerId === rasterLayerId)

export function isLayerValid({ type, ...layer }) {
  switch (type) {
    case "geoheat":
      return Boolean(
        layer.dimensions &&
          layer.dimensions.every((d) => d.value && !d.isError) &&
          layer.measures &&
          layer.measures.every((m) => m.value && !m.isError)
      )
    case "pointmap":
      return Boolean(
        layer.measures &&
          layer.measures.slice(0, 2).every((m) => m.value && !m.isError)
      )
    case "linemap":
      return Boolean(
        layer.measures &&
          layer.measures.slice(0, 1).every((m) => m.value && !m.isError)
      )
    case "backendChoropleth":
      return Boolean(
        layer.measures &&
          layer.measures.slice(0, 1).every((m) => m.value && !m.isError)
      )
    case CHART_TYPES.CONTOUR:
      return Boolean(
        layer.dimensions?.every((d) => d.value && !d.isError) &&
          layer.measures?.every((m) => m.value && !m.isError)
      )
    case CHART_TYPE_WINDBARB:
      return Boolean(
        layer.measures?.every((m) => (m.value || !m.isRequired) && !m.isError)
      )
    case CHART_TYPES.CROSS_SECTION:
    case CHART_TYPES.CROSS_SECTION_TERRAIN:
      return layer.measures?.every(
        (m) => (m.value || !m.isRequired) && !m.isError
      )
    case "deckgl":
    case "deckgl-pointmap":
      return Boolean(
        layer.measures &&
          layer.measures.slice(0, 2).every((m) => m.value && !m.isError)
      )
    case "deckgl-linemap":
      return Boolean(
        layer.measures &&
          layer.measures.slice(0, 1).every((m) => m.value && !m.isError)
      )
    case "deckgl-geoheat":
      return Boolean(
        layer.dimensions &&
          layer.dimensions.every((d) => d.value && !d.isError) &&
          layer.measures &&
          layer.measures.every((m) => m.value && !m.isError)
      )
    case "deckgl-choropleth":
      return Boolean(
        layer.measures &&
          layer.measures.slice(0, 1).every((m) => m.value && !m.isError)
      )
    default:
      return false
  }
}

export function rasterLegendConfig(chartSpec, legendProp) {
  const currentLayer =
    chartSpec.currentLayer && chartSpec.currentLayer !== "master"
      ? chartSpec.currentLayer
      : 0
  return chartSpec.layers && chartSpec.layers.length
    ? chartSpec.layers[currentLayer][legendProp]
    : chartSpec[legendProp]
}

export function getRasterLegendProp(chartSpec, legendProp) {
  return chartSpec.currentLayer === "master"
    ? null
    : rasterLegendConfig(chartSpec, legendProp)
}

export function isRasterPointChart(chartType) {
  return ["pointmap", "backendScatter", CHART_TYPE_WINDBARB].includes(chartType)
}

export const isRasterChart = (type) =>
  [
    "geoheat",
    "pointmap",
    "backendScatter",
    "backendChoropleth",
    "linemap",
    CHART_TYPES.CROSS_SECTION,
    CHART_TYPES.CROSS_SECTION_TERRAIN,
    CHART_TYPES.CONTOUR,
    CHART_TYPE_WINDBARB
  ].includes(type)

export const isMultiLayer = (type: string) => {
  const isCrossSectionAndEnabled =
    isCrossSectionType(type) && isCrossSectionTerrainEnabled()

  const isMultiLayerType = [
    "geoheat",
    "pointmap",
    "backendChoropleth",
    "linemap",
    "deckgl",
    "deckgl-pointmap",
    "deckgl-linemap",
    "deckgl-geoheat",
    "deckgl-choropleth",
    CHART_TYPES.CONTOUR,
    CHART_TYPE_WINDBARB
  ].includes(type)
  return isMultiLayerType || isCrossSectionAndEnabled
}

export const isGeoChart = (type) =>
  [
    "geoheat",
    "pointmap",
    "backendChoropleth",
    "linemap",
    CHART_TYPES.CONTOUR,
    CHART_TYPE_WINDBARB
  ].includes(type)
// this const could be removed once we refactor and combine geoheat only functionality
export const isRasterChartButNotGeoheat = (type) =>
  [
    "pointmap",
    "backendScatter",
    "backendChoropleth",
    "linemap",
    CHART_TYPES.CROSS_SECTION,
    CHART_TYPES.CROSS_SECTION_TERRAIN,
    CHART_TYPES.CONTOUR,
    CHART_TYPE_WINDBARB
  ].includes(type)

export const isDeckGLButNotGeoheat = (type) =>
  type === "deckgl" ||
  type === "deckgl-pointmap" ||
  type === "deckgl-linemap" ||
  type === "deckgl-choropleth"

export const isGeoTypeSupportedRasterChart = (type: string) =>
  type === "backendChoropleth" || type === "linemap"

// this list does NOT include backendChoropleth because that is handled
// separately due to two versions of choropleth chart
export const isBERendered = (type) =>
  [
    "pointmap",
    "backendScatter",
    "geoheat",
    "linemap",
    CHART_TYPES.CROSS_SECTION,
    CHART_TYPES.CROSS_SECTION_TERRAIN,
    CHART_TYPES.CONTOUR,
    CHART_TYPE_WINDBARB
  ].includes(type)

// We accept POINT type column for Pointmap and Heatmap as lat/lon selectors
export function pointValue(selectors, index) {
  const selector = selectors && selectors[index]

  return (
    selector &&
    (selector.type === "POINT"
      ? `ST_${index === 0 ? "X" : "Y"}(${selector.value})`
      : selector.value)
  )
}

// this object keeps track of each layer dimension on a datasource from crossfilter
export const layerAdapterDimensionMap = {}
// gets the mapping from key -> is internal crossfilter dimension
export function setLayerAdapterDimensionMapping(
  chartId,
  dataSource,
  dimensionVal,
  dimension
) {
  layerAdapterDimensionMap[
    `${chartId}+${dataSource}+${dimensionVal}`
  ] = dimension
  return dimension
}

// given a key, returns its internal dimension
export function getLayerAdapterDimensionMapping(
  chartId,
  dataSource,
  dimensionVal
) {
  return layerAdapterDimensionMap[`${chartId}+${dataSource}+${dimensionVal}`]
}

export function removeLayerAdapterDimensionMapping(
  chartId,
  dataSource,
  dimensionVal
) {
  delete layerAdapterDimensionMap[`${chartId}+${dataSource}+${dimensionVal}`]
}

export function removeLayerAdapterDimensionMappingHandler(
  chartId,
  dataSource,
  type,
  measures = [],
  dimensions = []
) {
  const findName = (items, name) => items.find((item) => item.name === name)

  // Need to match with the selector name that was added from the creation of Pointmap and Heatmap.
  // NOTE: we prepend ST_X/ST_Y for POINT type selectors
  if (isRasterPointChart(type)) {
    if (measures && measures.length) {
      removeLayerAdapterDimensionMapping(
        chartId,
        dataSource,
        pointValue(measures, 0)
      )
      removeLayerAdapterDimensionMapping(
        chartId,
        dataSource,
        pointValue(measures, 1)
      )
    }
  } else if (type === "geoheat") {
    // TODO[C]: do we need to check for contour type here?
    if (dimensions && dimensions.length) {
      removeLayerAdapterDimensionMapping(
        chartId,
        dataSource,
        pointValue(dimensions, 0)
      )
      removeLayerAdapterDimensionMapping(
        chartId,
        dataSource,
        pointValue(dimensions, 1)
      )
    }
  } else {
    const geoMeasure = measures && findName(measures, "geo")
    if (
      geoMeasure &&
      getLayerAdapterDimensionMapping(chartId, dataSource, geoMeasure.value)
    ) {
      removeLayerAdapterDimensionMapping(chartId, dataSource, geoMeasure.value)
    }

    const mappings = [...dimensions, ...measures].filter(({ value }) =>
      getLayerAdapterDimensionMapping(chartId, dataSource, value)
    )

    mappings.forEach(({ value }) => {
      removeLayerAdapterDimensionMapping(chartId, dataSource, value)
    })
  }
}

export function getLayerCrossfilterDimension(
  chartId,
  dataSource,
  dimValue,
  cf
) {
  let dimension = getLayerAdapterDimensionMapping(chartId, dataSource, dimValue)

  if (!dimension) {
    dimension = cf.dimension(dimValue)
    setLayerAdapterDimensionMapping(chartId, dataSource, dimValue, dimension)
  }

  return dimension
}

export function doJoin(layerSpec) {
  return (
    layerSpec.dimensions &&
    layerSpec.dimensions.filter(isSelectorUsable).map((d) => d.value) &&
    path(["geoJoin", "column"], layerSpec)
  )
}

/**
 * defines line or point size
 * @param sizeMeasure
 * @param sizeRange
 * @param autoSize
 * @param sizeDomain
 * @param isAgg
 * @param sizeRangeDefaults
 * @returns {*}
 */
export function getPointOrLineSize(
  sizeMeasure,
  sizeRange,
  autoSize,
  sizeDomain,
  isAgg = false,
  sizeRangeDefaults
) {
  if (autoSize) {
    return "auto"
  } else if (sizeMeasure && sizeMeasure.value) {
    return {
      type: sizeMeasure.aggType === "Custom" ? "custom" : "quantitative",
      field: sizeMeasure.value,
      ...(isAgg ? { aggregate: toTransformAgg(sizeMeasure.aggType) } : {}),
      domain: sizeDomain
        ? sizeDomain
        : sizeMeasure.minMax || SIZE_DOMAIN_DEFAULTS,
      range: sizeRange || sizeRangeDefaults
    }
  } else {
    return sizeRange ? sizeRange[0] : sizeRangeDefaults[0]
  }
}

/**
 * defines shape color and corresponding type of legend based on color measure selection
 * shape color defaults to solid blue if there is no color measure selection
 * quantitative measure selection has gradient legend and the legend lock defaults to unlocked
 * @param color
 * @param colorMeasure
 * @param density
 * @param opacity
 * @param legendOpen
 * @param isAgg
 * @param colorDomain
 * @param legendLocked
 * @param layerType
 * @returns {*}
 */
export function getColorBlock(
  color,
  colorMeasure,
  density,
  layerOpacity,
  legendOpen,
  isAgg = false,
  colorDomain,
  legendLocked,
  layerType,
  rasterShowOther,
  dataSource
) {
  legendOpen = typeof legendOpen === "undefined" ? true : legendOpen
  const opacity = layerOpacity || layerDefaultOpacity(layerType)

  if (
    density &&
    (!colorMeasure || !colorMeasure.value) &&
    layerType !== "backendChoropleth"
  ) {
    return {
      type: "density",
      range: color.reverse ? [...color.val].reverse() : color.val,
      opacity
    }
  } else if (color.type === "solid" || !colorMeasure || !colorMeasure.value) {
    return { type: "solid", value: color.val[0], opacity }
  } else if (color.type === "custom" && !isAgg) {
    return {
      type: "ordinal",
      field: colorMeasure.value,
      domain: color.customDomain,
      range: color.customRange,
      default: color.defaultOtherRange,
      showOther: rasterShowOther,
      defaultOtherRange:
        color.defaultOtherRange ||
        getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange,
      hideOther: colorMeasure.type === "BOOL" ? true : color.hideOther,
      opacity,
      legend: {
        title: `${getDisplayOrParameterName(dataSource)} ${
          colorMeasure.custom ? "[custom]" : `[util]`
        }`,
        open: legendOpen
      },
      colorMeasureAggType: colorMeasure.aggType
    }
  } else {
    const colorLegendBound = colorDomain || colorMeasure.minMax // changing the color legend bounds updates colorDomain,
    // if user sets colorDomain, it will regard the value. If not, it will take color measure minMax

    const allNullCol = (clb) => equals(clb, [null, null])

    let colorVal = null
    if (color.type === "quantitative" && allNullCol(colorLegendBound)) {
      // handles all null color measure column color
      colorVal = color.defaultOtherRange
        ? [color.defaultOtherRange]
        : color.val.slice(1)
    } else {
      colorVal = color.val
    }

    const aggregateFields = isAgg
      ? {
          aggregate:
            layerType === "pointmap"
              ? toTransformAgg(colorMeasure.aggType)
              : toAggExpression(colorMeasure.aggType, `${colorMeasure.value}`),
          colorMeasureAggType: colorMeasure.aggType
        }
      : {}

    return {
      type: "quantitative",
      field: colorMeasure.value,
      domain: colorDomain && legendLocked ? colorLegendBound : "auto", // we use auto when legend is not locked
      range: color.reverse ? [...color.val].reverse() : colorVal,
      opacity: opacity || layerDefaultOpacity("linemap"),
      legend: {
        title: `${colorMeasure.label} ${
          colorMeasure.custom
            ? "[custom]"
            : `[${process(colorMeasure.table, { useDisplayName: true })}]`
        }`,
        open: legendOpen,
        locked: legendLocked
      },
      ...aggregateFields
    }
  }
}

const POSITION_MEASURE_NAMES = ["x", "y"]

export const isPositionMeasure = ({ name }: { name: string }) =>
  POSITION_MEASURE_NAMES.includes(name)

export const isWindbarbChartType = (type) => type === CHART_TYPE_WINDBARB

export const getMultiLayerName = (name: string, idx: number) => {
  return `${name}Layer${idx}`
}

export const layerSupportsMasterSetting = (type, setting) => {
  return CHART_DEFS[type]?.masterLayerSettings?.includes(setting) ?? false
}

// Returns true if layer is either toggled off from master layer or if the current
// zoom level is outside of its visible zoom range
export function isLayerHidden(layer) {
  return layer.active === false || layer.activeZoomLevel === false
}

export function* getChartColor(color) {
  const paletteMappings: Array<PaletteMapping> = yield select(
    (state) => state.sharedSettings?.mappings
  )

  const sharedColorsEnabled = getFeatureFlag(
    available_feature_flags.ENABLE_SHARED_COLOR_SETTINGS
  )
  const savedMapping = paletteMappings?.find(
    (pm) => pm.id === color.paletteMappingId
  )
  return sharedColorsEnabled ? savedMapping?.mapping ?? color : color
}
