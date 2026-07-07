// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import {
  BACKEND_RENDERED,
  GEO_MEASURE,
  DENSITY_ACCUMULATION
} from "constants/chart-types"
import { getColors, SOLID_COLORS, CHARTS_DEFAULT_COLORS } from "services/colors"
import {
  ALL_NUMERICAL_TYPES,
  ALL_TYPES,
  NUMERICAL_AND_TIME_TYPES,
  TEXT_TYPES
} from "constants/data-types"

import { map, merge } from "ramda"

import BackendScatterChart from "./backend-scatter-chart"
import BackendScatterChartSettings from "./chart-settings"
import getScatterChartData from "./getScatterChartData"

import { getChartAddonTypes } from "chart-addons/chart-addon-registry"
import { MASTER_LAYER_SETTINGS } from "charts/raster-chart/raster-chart-consts"
const { OPACITY, ZOOM_VISIBILITY } = MASTER_LAYER_SETTINGS
const { CHART_ADDON_EXPORT_AS_IMAGE } = getChartAddonTypes()

const backendScatterChartDefinition = {
  type: "backendScatter",
  typeConstant: "BACKEND_SCATTER",
  chartDataFormatter: getScatterChartData,
  typeAlias: "SCATTER",
  chartTypeCategories: [BACKEND_RENDERED, GEO_MEASURE, DENSITY_ACCUMULATION],
  labelsIcons: { label: "Scatterplot", icon: "chart-backendScatter" },
  Component: BackendScatterChart,
  iconId: "icon-chart-backendScatter",
  IconComponent: function BackendScatterIconComponent() {
    return (
      <>
        <circle cx="6" cy="42" r="2" />
        <circle cx="10" cy="38" r="2" />
        <circle cx="18" cy="40" r="2" />
        <circle cx="20" cy="35" r="2" />
        <circle cx="14" cy="32" r="2" />
        <circle cx="26" cy="32" r="2" />
        <circle cx="23" cy="26" r="2" />
        <circle cx="30" cy="22" r="2" />
        <circle cx="32" cy="28" r="2" />
        <circle cx="38" cy="30" r="2" />
        <circle cx="32" cy="34" r="2" />
        <circle cx="30" cy="14" r="2" />
        <circle cx="36" cy="10" r="2" />
        <circle cx="40" cy="20" r="2" />
      </>
    )
  },
  ChartSettingsComponent: BackendScatterChartSettings,
  defaultColors: {
    type: "solid",
    key: "blue",
    val: getColors(SOLID_COLORS).blue
  },
  dimensionSettings: {
    capMin: 1000,
    defaultCap: 2000000,
    minDimensions: 0,
    maxDimensions: Infinity,
    maxPostFilters: 1,
    dimensionTypes: merge(
      merge(TEXT_TYPES, { noArrays: true }),
      ALL_NUMERICAL_TYPES
    ),
    dimensions: [],
    minMeasures: 2,
    maxMeasures: 5,
    measures: [
      { name: "x", type: ALL_NUMERICAL_TYPES, required: true },
      { name: "y", type: ALL_NUMERICAL_TYPES, required: true },
      { name: "size", type: ALL_NUMERICAL_TYPES },
      {
        name: "color",
        type: merge(ALL_TYPES, { noArrays: true })
      },
      { name: "orientation", type: ALL_NUMERICAL_TYPES }
    ],
    postFilters: [
      {
        name: "postFilter",
        required: true,
        operator: null,
        min: "",
        max: "",
        type: ALL_NUMERICAL_TYPES
      }
    ],
    customColorable: true,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).backendScatter,
    allowedColorTypes: { solid: true },
    colorTypesFromColumnType: merge(
      map(() => "custom", TEXT_TYPES),
      map(() => "quantitative", NUMERICAL_AND_TIME_TYPES)
    ),
    aliases: {
      measures: {
        x: "x axis",
        y: "y axis",
        size: "size",
        color: "color",
        orientation: "angle"
      }
    }
  },
  disableAddons: [CHART_ADDON_EXPORT_AS_IMAGE],
  visible: true,
  masterLayerSettings: [OPACITY, ZOOM_VISIBILITY]
}

export default backendScatterChartDefinition
