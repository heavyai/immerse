// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { lensPath, view } from "ramda"

import {
  CATEGORIZED_CHART_TYPES,
  NOT_BE_RENDERED,
  BACKEND_RENDERED,
  LAYER,
  DEPRECATED,
  GEO_MEASURE,
  DENSITY_ACCUMULATION,
  MULTISOURCE,
  EXPERIMENTAL,
  OMNICOMBO,
  DECKGL,
  CHART_DIMENSION_SETTINGS,
  CHARTS_ORDER,
  CHART_TYPES,
  VEGA_CHARTS,
  BACKEND_CHARTS,
  DECKGL_CHARTS,
  EXPERIMENTAL_CHARTS,
  CHART_DEFS
} from "./chart-types"

import countries from "../charts/geojson/countries.json"

export const Y_AXIS_ORIENTATIONS = Object.freeze({
  LEFT: "left",
  RIGHT: "right"
})

// the magic string we use to display the "Current Immerse Theme"
export const CURRENT_IMMERSE_THEME_STRING = "Current Immerse Theme"
export const MINIMALIST_THEME_LABEL = "Minimalist"
export const MINIMALIST_BASEMAP_VALUE = "minimalist"
export const DECKGL_MESSAGE = "The beta pointmap supports altitude."

export const MINIMALIST_BASEMAP_STYLE = {
  version: 8,
  sources: {
    countries: {
      type: "geojson",
      data: countries
    }
  },
  layers: [
    {
      id: "countries",
      type: "fill",
      source: "countries",
      paint: {
        "fill-color": "#dddddd",
        "fill-outline-color": "white",
        "fill-opacity": 1
      },
      minzoom: 0,
      maxzoom: 22
    }
  ]
}

export const OFFLINE_BASEMAP = [
  {
    label: MINIMALIST_THEME_LABEL,
    value: MINIMALIST_BASEMAP_VALUE
  }
]

// default basemap options from mapbox
// custom basemap styles may be added via servers.json
export const BASEMAP_OPTIONS = [
  { label: "Light", value: "mapbox://styles/mapbox/light-v9" },
  { label: "Dark", value: "mapbox://styles/mapbox/dark-v9" },
  { label: "Basic", value: "mapbox://styles/mapbox/basic-v9" },
  { label: "Satellite", value: "mapbox://styles/mapbox/satellite-v9" },
  { label: "Streets", value: "mapbox://styles/mapbox/streets-v10" },
  { label: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v10" },
  { label: "Bright", value: "mapbox://styles/mapbox/bright-v9" },
  {
    label: "Odyssey",
    value: "mapbox://styles/mapbox/cj94ar55h54o92smwiolc8shp"
  },
  {
    label: "Vintage",
    value: "mapbox://styles/mapbox/cj7at0rnp9ei22rtegvjf58dx"
  },
  {
    label: "Decimal",
    value: "mapbox://styles/mapbox/cj5l80zrp29942rmtg0zctjto"
  },
  {
    label: "North-Star",
    value: "mapbox://styles/mapbox/cj44mfrt20f082snokim4ungi"
  },
  OFFLINE_BASEMAP[0],
  { label: CURRENT_IMMERSE_THEME_STRING, value: "current" }
]

export const BASEMAP_OPTIONS_3D = [
  { label: "Satellite 3D", value: "3d_satellite" },
  { label: "Wireframe 3D", value: "3d_wireframe" },
  { label: "Surface 3D", value: "3d_surface" }
]

export const BASEMAPS_BY_LABEL = BASEMAP_OPTIONS.reduce((bucket, opt) => {
  bucket[opt.label] = opt
  return bucket
}, {})

export const BASEMAPS_BY_LABEL_3D = BASEMAP_OPTIONS_3D.reduce((bucket, opt) => {
  bucket[opt.label] = opt
  return bucket
}, {})

export const LINE_STYLES = ["solid", "dashes", "dotted"]

export const DEFAULT_BASEMAP = BASEMAP_OPTIONS[BASEMAP_OPTIONS.length - 1]

export const BASE_LINE2_DIMENSIONS = [
  {
    isError: false,
    isRequired: true,
    inactive: false,
    name: "X Axis"
  },
  {
    inactive: false,
    name: "Color",
    isError: false,
    isRequired: false
  }
]

export const BASE_LINE2_MEASURES = [
  {
    inactive: false,
    name: "series_1",
    isError: false,
    isRequired: true
  }
]

export const OMNICOMBO_CHART_TYPE = CATEGORIZED_CHART_TYPES[OMNICOMBO]
export const DECKGL_CHART_TYPES = CATEGORIZED_CHART_TYPES[DECKGL]
export const EXPERIMENTAL_CHART_TYPES = CATEGORIZED_CHART_TYPES[EXPERIMENTAL]
export const NOT_BE_RENDERED_CHART_TYPES =
  CATEGORIZED_CHART_TYPES[NOT_BE_RENDERED]
export const BACKEND_RENDERED_CHART_TYPES =
  CATEGORIZED_CHART_TYPES[BACKEND_RENDERED]
export const DEPRECATED_CHART_TYPES = CATEGORIZED_CHART_TYPES[DEPRECATED]
export const LAYER_CHART_TYPES = CATEGORIZED_CHART_TYPES[LAYER]
export const MULTISOURCE_CHART_TYPES = CATEGORIZED_CHART_TYPES[MULTISOURCE]
export const GEO_MEASURE_CHARTS = CATEGORIZED_CHART_TYPES[GEO_MEASURE]
export const DENSITY_ACCUMULATION_CHARTS =
  CATEGORIZED_CHART_TYPES[DENSITY_ACCUMULATION]

export {
  CHART_TYPES,
  CHARTS_ORDER,
  CHART_DIMENSION_SETTINGS as CHARTS,
  VEGA_CHARTS as vegaCharts,
  DECKGL_CHARTS as deckglCharts,
  BACKEND_CHARTS as backendCharts,
  EXPERIMENTAL_CHARTS as experimentalCharts,
  CHART_DEFS
}

export const CHARTS_DEFAULT_OTHER_ALIASES = {
  default: "Other",
  other: "All Others"
}

export const isVegaChart = (chartType) => VEGA_CHARTS.includes(chartType)

export const isDeckGLChart = (chartType) => DECKGL_CHARTS.includes(chartType)

export const isNewChart = (chartType) =>
  isVegaChart(chartType) || isDeckGLChart(chartType)

export function namedMeasures(chartType) {
  return view(lensPath([chartType, "measures"]), CHART_DIMENSION_SETTINGS) || []
}

export function dimensionsRequired(chartType) {
  const maxDimensions = CHART_DIMENSION_SETTINGS[chartType].maxDimensions
  return maxDimensions !== 0
}

export function canChooseAggType(chartType) {
  return chartType !== "pointmap" && chartType !== "backendScatter"
}
