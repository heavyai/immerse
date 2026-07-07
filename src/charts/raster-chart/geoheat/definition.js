// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { BACKEND_RENDERED, LAYER } from "constants/chart-types"
import {
  getColors,
  QUANTITATIVE_COLORS,
  CHARTS_DEFAULT_COLORS
} from "services/colors"
import {
  GEO_POINT_TYPES,
  NUMERICAL_AND_TIME_TYPES,
  TEXT_TYPES
} from "constants/data-types"

import { map, merge } from "ramda"

import GeoHeatChart from "./geoheat-chart"
import GeoHeatChartSettings from "./chart-settings"
import getGeoHeatMapData from "./getGeoHeatMapData"
import { MASTER_LAYER_SETTINGS } from "charts/raster-chart/raster-chart-consts"
const { OPACITY, ZOOM_VISIBILITY } = MASTER_LAYER_SETTINGS

const geoheatChartDefinition = {
  type: "geoheat",
  typeConstant: "GEOHEAT",
  typeAlias: "GEO HEATMAP",
  chartDataFormatter: getGeoHeatMapData,
  chartTypeCategories: [BACKEND_RENDERED, LAYER],
  labelsIcons: { label: "Geo Heatmap", icon: "chart-geoheat" },
  Component: GeoHeatChart,
  iconId: "icon-chart-geoheat",
  IconComponent: function GeoHeatIconComponent() {
    return (
      <>
        <path d="M25.1,22.4l3.1-5.4l-3.1-5.4h-6.2L15.8,17l3.1,5.4H25.1z M20.1,13.7H24l1.9,3.4L24,20.4h-3.9L18.1,17L20.1,13.7z" />
        <path d="M25.1,23.4h-6.2l-3.1,5.4l3.1,5.4h6.2l3.1-5.4L25.1,23.4z M23.4,31.1h-2.7l-1.4-2.4l1.4-2.4h2.7l1.4,2.4L23.4,31.1z" />
        <path d="M26,22.9l2.8,4.8h5.6l2.8-4.8L34.4,18h-5.6L26,22.9z M30.5,21h2.1l1.1,1.8l-1.1,1.8h-2.1l-1.1-1.8L30.5,21z" />
        <path d="M15.7,19h-4.5l-2.2,3.9l2.2,3.9h4.5l2.2-3.9L15.7,19z M14.6,24.7h-2.1l-1.1-1.9l1.1-1.9h2.1l1.1,1.9L14.6,24.7z" />
        <path d="M10.2,18.8l-2.4-4.2H3l-2.4,4.2L3,23h4.8L10.2,18.8z M4.1,21l-1.3-2.2l1.3-2.2h2.5l1.3,2.2L6.6,21H4.1z" />
        <polygon points="8.5,24.1 4.9,24.1 3.1,27.2 4.9,30.3 8.5,30.3 10.2,27.2   " />
        <polygon points="11,27.7 9.5,30.4 11,33.1 14.1,33.1 15.7,30.4 14.1,27.7   " />
        <polygon points="40.3,31.9 38.6,28.8 35,28.8 33.3,31.9 35,35 38.6,35  " />
        <polygon points="28.4,30.4 27,32.8 28.4,35.2 31.2,35.2 32.6,32.8 31.2,30.4  " />
        <path d="M37.5,14.4l-2,3.4l2,3.4h4l2-3.4l-2-3.4H37.5z M40.3,19.3h-1.7l-0.8-1.4l0.8-1.4h1.7l0.8,1.4L40.3,19.3z" />
        <polygon points="46,10.5 43.2,10.5 41.8,13 43.2,15.5 46,15.5 47.5,13  " />
        <polygon points="38.7,22.3 37.1,25.1 38.7,27.8 41.8,27.8 43.4,25.1 41.8,22.3  " />
        <polygon points="38.3,36 37.3,37.8 38.3,39.6 40.4,39.6 41.5,37.8 40.4,36  " />
        <polygon points="21.2,35.1 20,37.2 21.2,39.4 23.6,39.4 24.9,37.2 23.6,35.1  " />
        <polygon points="32,17 33.2,15 32,12.9 29.5,12.9 28.2,15 29.5,17  " />
        <path d="M10.9,17.9h3.2l1.6-2.8l-1.6-2.8h-3.2l-1.6,2.8L10.9,17.9z M12.1,14.3H13l0.5,0.8L13,15.9h-0.9l-0.5-0.8L12.1,14.3z" />
        <polygon points="9,13.5 9.7,12.3 9,11 7.5,11 6.8,12.3 7.5,13.5  " />
        <polygon points="4.9,13.6 6.1,11.5 4.9,9.5 2.5,9.5 1.3,11.5 2.5,13.6  " />
      </>
    )
  },
  ChartSettingsComponent: GeoHeatChartSettings,
  defaultColors: {
    type: "quantitative",
    key: "mapDScale",
    val: getColors(QUANTITATIVE_COLORS).mapDScale
  },
  dimensionSettings: {
    minDimensions: 2,
    maxDimensions: 2,
    dimensionTypes: GEO_POINT_TYPES,
    dimensions: [
      { name: "Lon", required: true, type: GEO_POINT_TYPES },
      { name: "Lat", required: true, type: GEO_POINT_TYPES }
    ],
    minMeasures: 1,
    maxMeasures: 1,
    measures: [{ name: "color", required: true }],
    customColorable: false,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).heat,
    allowedColorTypes: { solid: true },
    colorTypesFromColumnType: merge(
      map(() => "quantitative", merge(NUMERICAL_AND_TIME_TYPES, TEXT_TYPES)),
      () => "custom",
      TEXT_TYPES
    ),
    aliases: { measures: { color: "color" } }
  },
  visible: true,
  masterLayerSettings: [OPACITY, ZOOM_VISIBILITY]
}

export default geoheatChartDefinition
