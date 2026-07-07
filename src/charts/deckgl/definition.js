// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { DECKGL, NOT_BE_RENDERED } from "constants/chart-types"
import { getColors, SOLID_COLORS, CHARTS_DEFAULT_COLORS } from "services/colors"
import {
  GEO_POINT_TYPES,
  ALL_NUMERICAL_TYPES,
  NUMERICAL_AND_TIME_TYPES,
  TEXT_TYPES
} from "constants/data-types"
import { map, merge } from "ramda"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { DECKGL_DEFAULT_POINTS, DECKGL_MAX_POINTS } = available_feature_flags

import DeckGLChart from "vega/charts/deckgl/deckgl-chart"
import DeckGLDataSelectionPanel from "./deckgl-data-selection-panel"
import DeckGLChartSettings from "./chart-settings"

import { getChartAddonTypes } from "chart-addons/chart-addon-registry"
const { CHART_ADDON_EXPORT_AS_IMAGE } = getChartAddonTypes()

const deckGLChartDefinition = {
  type: "deckgl",
  typeAlias: "GEO",
  typeConstant: "DECKGL",
  chartTypeCategories: [DECKGL, NOT_BE_RENDERED],
  labelsIcons: { label: "Pointmap", icon: "chart-deckgl" },
  Component: DeckGLChart,
  iconId: "icon-chart-deckgl",
  exportChartData: {
    getChartData: (chart) => chart.data
  },
  IconComponent: function DeckGLIconComponent() {
    return (
      <>
        <circle cx="23.5" cy="31.4" r="1.5" />
        <circle cx="21.429" cy="24.8" r="1.5" />
        <circle cx="10.15" cy="21.8" r="1.5" />
        <circle cx="24.429" cy="20.3" r="1.5" />
        <circle cx="13.15" cy="17.3" r="1.5" />
        <circle cx="16.722" cy="26.3" r="1.5" />
        <circle cx="17.5" cy="20.4" r="1.5" />
        <path d="M47.2,11.9l-0.4,-0.3l-0.3,-1.1l-1.2,-0.9l-1.1,0l-1.3,1l-0.4,1.9l-0.1,0.3l-0,0.2l-2.1,0.5l-0.7,0.5l-0.8,1.1l-0.2,0.8l-0.9,0.1l-0.9,1.5l-0.3,0.4l-0.5,-1.4l-0.3,0l-0.2,-1.1l-0.8,-0.9l0.1,-0.2l-0.2,-0.5l-0.8,-0.7l-0.9,-0.3l-0.8,0l-0.6,0.2l-0.4,-0.4l-1.5,0l-0.1,-0.9l-0.8,-0.3l-0.8,0l-0.8,-0.3l-1.1,-0.7l-0.9,0.2l-7,-0.3l-6.6,-1.1l-5.8,-1.3l-0.7,0.7l-0.5,-0.3l-1.9,1.1l0.1,1.6l-0.2,0.9l-1.4,3.1l-0.1,0.6l-0,1.1l-0.6,1l-0.2,0.7l0.1,1.8l0.2,0.6l0.3,0.4l-0,0.2l0.1,1l0.3,1.7l0.1,0.3l0.7,1.3l-0,0.2l0.7,1l0.8,0.8l0.3,0.5l0.3,0.2l0.1,0.6l1.1,1.1l1.5,0.2l0.1,0.2l2.6,1.7l0.4,0.2l3.1,0.6l0.7,-0.5l0.5,0.1l0.4,0.6l0.4,0.3l0.2,0.1l0.1,0.7l0.7,1l1.3,0.7l1.6,-0.4l-0,-0.1l0.3,0.8l0.2,0.3l0.6,0.8l0.4,1.1l0.8,0.8l1.7,0.5l1.6,-1.2l-0,-1.5l1.6,-1.1l0.8,-0.5l1.3,0.1l0.9,0.4l0.9,0l0.9,-0.5l0.6,-0.7l0.2,-0.4l0.1,0l0.7,0.2l1,-0.1l0.3,0.3l1.6,0.1l0.2,-0.1l0.2,0.2l-0,0.5l0.4,0.5l-0,0.7l0.6,1l0.1,0.1l0.6,0.7l0.6,0.4l0.3,0.6l2.2,0.2l0.7,-1l0.2,-0.7l-0,-1.2l-0.1,-0.6l-0.8,-1.6l-0.2,-0.7l-1,-1.4l-0.1,-0.9l0.4,-0.7l0.8,-0.9l0.3,-0.4l0.1,-0.4l0.2,-0.1l0.4,-0.3l1.1,-1.2l-0,-0.5l0.1,-0.1l0.5,-0.8l0.2,-0.7l-0.1,-0.8l-0.4,-0.8l0.2,-0.1l0.2,-1.5l-0.1,-0.5l0.3,-0.2l0.3,-1.2l-0,-0.5l0.1,-0.2l1.3,-0.7l0.3,-0.2l0.7,-0.6l-0.6,-1.9l0.1,-0.4l0.4,-0.3l0.3,-0.3l0.1,-0.2l0.2,-0.1l0.8,-0.8l0.3,-0.9l-0.6,-1.4Zm-1.2,1.8l-0.4,0.2l-0.1,0.1l-0.3,0.5l-0.8,0.5l-0.1,0.2l-0.2,1.7l0.1,0.2l0.4,0.3l0.1,0.1l0.1,0l-0.3,0.2l-1.6,0.8l-0.1,0.1l-0.6,0.9l-0,0.2l0.1,0.3l-0.2,1l-0.6,-0.1l-0.2,0.4l0.5,0.8l-0.1,0.8l-0.2,-0.3l-0.4,-1.1l-0.5,0.1l0.2,1.4l1.1,2.2l-0.1,0.6l-0.5,0.4l-0,0.4l0.1,0.2l-0.9,1l-0.6,0.2l-0.1,0.1l-0.3,0.9l-0.9,1l-0.7,1.2l-0,0.1l0.1,1.6l-0,0.1l1.1,1.6l-0,0.4l0.9,1.8l-0,1.1l-0.4,0.6l-0.3,-0.7l-0.2,-0.1l-0.4,-0.1l-0.5,-0.7l-0.5,-0.9l0.2,-0.3l-0.1,-0.4l-0.3,-0.1l-0.1,-1.1l-0.2,-0.2l-0.4,-0.1l-0.5,-0.6l-0.2,-0.2l-0.6,0l-0.7,0.5l-0.6,-0.5l-0.2,0l-1.5,0.2l-0.3,-0.2l-0.2,0l-1.4,0.4l-0.2,0.2l-0.1,0.6l-0.5,0.6l-0.7,0l-0.5,-0.6l-0.4,0l-0.1,0.2l-1.6,-0.1l-0.2,0l-3.3,2.2l-0,1.9l-1.2,-0.4l-0.4,-1.2l-0.8,-1l-0.5,-1.3l-0.1,-0.1l-1.5,-0.6l-0.3,0.1l-0.5,0.7l-1,-0.5l-0.1,-1.2l-0.1,-0.2l-0.6,-0.4l-0.7,-1l-0.2,0l-1.5,-0.3l-0.3,0.2l-0.1,0.3l-2.9,-0.7l-2.5,-1.6l-0,-0.2l-0.2,-0.2l-1.9,-0.3l-0.1,-0.9l-0.1,-0.2l-0.6,-0.5l-0,-0.2l-0.1,-0.2l-0.7,-0.4l-0.7,-1l-0.6,-1.3l-0.3,-1.6l-0.1,-1l-0,-0.5l-0.5,-0.7l-0.1,-1.6l0.7,-1.2l-0,-1.5l1.6,-3.4l0.2,-1.2l-0,-0.1l-0.1,-1.2l1.3,0.7l0.4,-0.2l-0,-0.9l5.5,1.4l6.7,1.2l7.1,0.3l0.2,-0.1l0.1,-0.2l1,0.7l1.4,0.6l0.2,0l0.4,-0.1l0.2,0.1l-0.2,0.1l-0.8,1.1l0.3,0.4l0.5,-0.1l0.2,0.3l0.3,0.1l1.1,-0.6l0.4,-0.4l0.4,0.3l0.2,0.4l0.3,0.1l1.4,-0.5l0.7,0.2l-0.7,0.1l-0.9,0.4l-0.4,0l-0.2,0.2l-0.5,1.4l0.3,0.3l0.1,0l-0.3,1.8l0.5,1.6l0.4,0.1l0.7,-0.6l0.1,-0.2l0.1,-1.2l-0,-0.2l-0.3,-0.5l0.2,-1.3l0.4,-0.2l0.3,-0.8l0.8,0.2l0.2,0.9l-0.3,0.4l0,0.3l0.2,0.4l0.4,0l0.2,-0.3l0.4,0.9l-0.5,1.2l0.1,0.3l0.7,0.3l0.2,0l1.7,-1l1,-1.1l0.1,-0.3l-0.2,-0.4l1.2,-0.2l0.7,-0.4l0.1,-0.3l-0.1,-0.7l0.7,-0.9l2.4,-0.6l0.8,-0.8l0.4,-2.4l0.7,0l0.4,1.4l0.1,0.1l0.6,0.4l-0.2,0.7Z" />
      </>
    )
  },
  initialChartData: { isNotDc: true },
  DataSelectionPanel: DeckGLDataSelectionPanel,
  ChartSettingsComponent: DeckGLChartSettings,
  defaultColors: {
    type: "solid",
    key: "blue",
    val: getColors(SOLID_COLORS).blue
  },
  dimensionSettings: () => ({
    isNotDc: true,
    capMin: 1,
    capMax: getFeatureFlag(DECKGL_MAX_POINTS) ?? 100000,
    defaultCap: getFeatureFlag(DECKGL_DEFAULT_POINTS) ?? 50000,
    minDimensions: 0,
    maxDimensions: Infinity,
    dimensionTypes: merge(
      merge(TEXT_TYPES, { noArrays: true }),
      ALL_NUMERICAL_TYPES
    ),
    dimensions: [],
    minMeasures: 2,
    maxMeasures: 4,
    measures: [
      { name: "lon", required: true, type: GEO_POINT_TYPES },
      { name: "lat", required: true, type: GEO_POINT_TYPES },
      { name: "alt", type: ALL_NUMERICAL_TYPES },
      { name: "color", type: ALL_NUMERICAL_TYPES }
    ],
    customColorable: true,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).pointmap,
    allowedColorTypes: { solid: true, custom: true },
    colorTypesFromColumnType: merge(
      map(() => "custom", TEXT_TYPES),
      map(() => "quantitative", NUMERICAL_AND_TIME_TYPES)
    ),
    aliases: {
      measures: {
        lon: "Lon",
        lat: "Lat",
        alt: "Altitude",
        size: "Size",
        color: "color"
      }
    }
  }),
  disableAddons: [CHART_ADDON_EXPORT_AS_IMAGE],
  visible: true
}

export default deckGLChartDefinition
