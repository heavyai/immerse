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
  ALL_NUMERICAL_TYPES,
  ALL_TYPES,
  LINE_GEO_TYPES,
  NUMERICAL_AND_TIME_TYPES,
  TEXT_TYPES
} from "constants/data-types"
import { map, merge } from "ramda"

import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

import LinemapChart from "./line-chart"
import LinemapChartSettings from "./chart-settings"
import { MASTER_LAYER_SETTINGS } from "charts/raster-chart/raster-chart-consts"
const { OPACITY, ZOOM_VISIBILITY } = MASTER_LAYER_SETTINGS

const lineMapDefinition = {
  type: "linemap",
  typeConstant: "LINEMAP",
  chartTypeCategories: [BACKEND_RENDERED, LAYER],
  labelsIcons: { label: "Linemap", icon: "chart-linemap" },
  Component: LinemapChart,
  iconId: "icon-chart-linemap",
  IconComponent: function LineMapIconComponent() {
    return (
      <path d="M15.492893,22 L6.2,22 L6.2,21 L15.5395924,21 L10.8966991,16.3571068 L11.6038059,15.65 L16.2,20.2461941 L16.2,13 L17.2,13 L17.2,20.292893 L23.063961,14.428932 L23.7710678,15.1360388 L17.9071066,21 L26.2,21 L26.2,22 L17.9538059,22 L21.5033009,25.5494949 L20.7961941,26.2566017 L17.2,22.6604076 L17.2,30 L16.2,30 L16.2,22.7071066 L10.336039,28.5710676 L9.62893219,27.8639608 L15.492893,22 Z M47.2,12 L47.8,13.4 L47.5,14.3 L46.7,15.1 L46.5,15.2 L46.4,15.4 L46.1,15.7 L45.7,16 L45.6,16.4 L46.2,18.3 L45.5,18.9 L45.2,19.1 L43.9,19.8 L43.8,20 L43.8,20.5 L43.5,21.7 L43.2,21.9 L43.3,22.4 L43.1,23.9 L42.9,24 L43.3,24.8 L43.4,25.6 L43.2,26.3 L42.7,27.1 L42.6,27.2 L42.6,27.7 L41.5,28.9 L41.1,29.2 L40.9,29.3 L40.8,29.7 L40.5,30.1 L39.7,31 L39.3,31.7 L39.4,32.6 L40.4,34 L40.6,34.7 L41.4,36.3 L41.5,36.9 L41.5,38.1 L41.3,38.8 L40.6,39.8 L38.4,39.6 L38.1,39 L37.5,38.6 L36.9,37.9 L36.8,37.8 L36.2,36.8 L36.2,36.1 L35.8,35.6 L35.8,35.1 L35.6,34.9 L35.4,35 L33.8,34.9 L33.5,34.6 L32.5,34.7 L31.8,34.5 L31.7,34.5 L31.5,34.9 L30.9,35.6 L30,36.1 L29.1,36.1 L28.2,35.7 L26.9,35.6 L26.1,36.1 L24.5,37.2 L24.5,38.7 L22.9,39.9 L21.2,39.4 L20.4,38.6 L20,37.5 L19.4,36.7 L19.2,36.4 L18.9,35.6 L18.9,35.7 L17.3,36.1 L16,35.4 L15.3,34.4 L15.2,33.7 L15,33.6 L14.6,33.3 L14.2,32.7 L13.7,32.6 L13,33.1 L9.9,32.5 L9.5,32.3 L6.9,30.6 L6.8,30.4 L5.3,30.2 L4.2,29.1 L4.1,28.5 L3.8,28.3 L3.5,27.8 L2.9,27.2 L2.7,27 L2,26 L2,25.8 L1.3,24.5 L1.2,24.2 L0.9,22.5 L0.8,21.5 L0.8,21.3 L0.5,20.9 L0.3,20.3 L0.2,18.5 L0.4,17.8 L1,16.8 L1,15.7 L1.1,15.1 L2.5,12 L2.7,11.1 L2.6,9.5 L4.5,8.4 L5,8.7 L5.7,8 L11.5,9.3 L18.1,10.4 L25.1,10.7 L26,10.5 L27.1,11.2 L27.9,11.5 L28.7,11.5 L29.5,11.8 L29.6,12.7 L31.1,12.7 L31.5,13.1 L32.1,12.9 L32.9,12.9 L33.8,13.2 L34.6,13.9 L34.8,14.4 L34.7,14.6 L35.5,15.5 L35.7,16.6 L36,16.6 L36.5,18 L36.8,17.6 L37.7,16.1 L38.6,16 L38.8,15.2 L39.6,14.1 L40.3,13.6 L42.4,13.1 L42.4,12.9 L42.5,12.6 L42.9,10.7 L44.2,9.7 L45.3,9.7 L46.5,10.6 L46.8,11.7 L47.2,12 Z M46.5,13.3 L46.7,12.6 L46.1,12.2 L46,12.1 L45.6,10.7 L44.9,10.7 L44.5,13.1 L44.4,13.2 L43.8,13.8 L43.7,13.9 L41.3,14.5 L40.6,15.4 L40.7,16.1 L40.6,16.4 L39.9,16.8 L38.7,17 L38.9,17.4 L38.8,17.7 L37.8,18.8 L36.1,19.8 L35.9,19.8 L35.2,19.5 L35.1,19.2 L35.6,18 L35.2,17.1 L35,17.4 L34.6,17.4 L34.4,17 L34.4,16.7 L34.7,16.3 L34.5,15.4 L33.7,15.2 L33.4,16 L33.2,16.1 L33,16.2 L32.8,17.5 L33.1,18 L33.1,18.2 L33,19.4 L32.9,19.6 L32.2,20.2 L31.8,20.1 L31.3,18.5 L31.6,16.7 L31.5,16.7 L31.2,16.4 L31.7,15 L31.9,14.8 L32.3,14.8 L33.2,14.4 L33.9,14.3 L33.2,14.1 L31.8,14.6 L31.5,14.5 L31.3,14.1 L30.9,13.8 L30.5,14.2 L29.4,14.8 L29.1,14.7 L28.9,14.4 L28.4,14.5 L28.1,14.1 L28.9,13 L29.1,12.9 L28.9,12.8 L28.5,12.9 L28.3,12.9 L26.9,12.3 L25.9,11.6 L25.8,11.8 L25.6,11.9 L18.5,11.6 L11.8,10.4 L6.3,9 L6.3,9.9 L5.9,10.1 L4.6,9.4 L4.7,10.6 L4.7,10.7 L4.5,11.9 L2.9,15.3 L2.9,16.7 L2.9,16.8 L2.2,18 L2.3,19.6 L2.8,20.3 L2.8,20.4 L2.8,20.8 L2.9,21.8 L3.2,23.4 L3.8,24.7 L4.5,25.7 L5.2,26.1 L5.3,26.3 L5.3,26.5 L5.9,27 L6,27.2 L6.1,28.1 L8,28.4 L8.2,28.6 L8.2,28.8 L10.7,30.4 L13.6,31.1 L13.7,30.8 L14,30.6 L15.5,30.9 L15.7,30.9 L16.4,31.9 L17,32.3 L17.1,32.5 L17.2,33.7 L18.2,34.2 L18.7,33.5 L19,33.4 L20.5,34 L20.6,34.1 L21.1,35.4 L21.9,36.4 L22.3,37.6 L23.5,38 L23.5,36.2 L23.5,36.1 L26.8,33.9 L27,33.9 L28.6,34 L28.7,33.8 L29.1,33.8 L29.6,34.4 L30.3,34.4 L30.8,33.8 L30.9,33.2 L31.1,33 L32.5,32.6 L32.7,32.6 L33,32.8 L34.5,32.6 L34.7,32.6 L35.3,33.1 L36,32.6 L36.1,32.6 L36.6,32.6 L36.8,32.8 L37.3,33.4 L37.7,33.5 L37.9,33.7 L38,34.8 L38.3,34.9 L38.4,35.3 L38.2,35.6 L38.7,36.5 L39.2,37.2 L39.6,37.3 L39.8,37.4 L40.1,38.1 L40.5,37.5 L40.5,36.4 L39.6,34.6 L39.6,34.4 L39.6,34.2 L38.5,32.6 L38.5,32.5 L38.4,30.9 L38.4,30.8 L39.1,29.6 L40,28.6 L40.3,27.7 L40.4,27.6 L41,27.4 L41.9,26.4 L41.8,26.2 L41.8,25.8 L42.3,25.4 L42.4,24.8 L41.3,22.6 L41.1,21.2 L41.6,21.1 L42,22.2 L42.2,22.5 L42.3,21.7 L41.8,20.9 L42,20.5 L42.6,20.6 L42.8,19.6 L42.7,19.3 L42.7,19.1 L43.3,18.2 L43.4,18.1 L45,17.3 L45.3,17.1 L45.2,17.1 L45.1,17 L44.7,16.7 L44.6,16.5 L44.8,14.8 L44.9,14.6 L45.7,14.1 L46,13.6 L46.1,13.5 L46.5,13.3 Z" />
    )
  },
  ChartSettingsComponent: LinemapChartSettings,
  defaultColors: {
    type: "quantitative",
    key: "mapDScale",
    val: getColors(QUANTITATIVE_COLORS).mapDScale
  },
  dimensionSettings: {
    capMin: getFeatureFlag(available_feature_flags.LINEMAP_MIN_LINES),
    defaultCap: getFeatureFlag(available_feature_flags.LINEMAP_MAX_LINES),
    minDimensions: 0,
    maxDimensions: Infinity,
    dimensions: [{ name: "join", required: false }],
    dimensionTypes: merge(
      merge(TEXT_TYPES, { noArrays: true }),
      ALL_NUMERICAL_TYPES
    ),
    minMeasures: 1,
    maxMeasures: 3,
    measures: [
      {
        name: "geo",
        required: true,
        type: LINE_GEO_TYPES,
        includeJoinDataSources: true
      },
      { name: "size", type: ALL_NUMERICAL_TYPES },
      {
        name: "color",
        type: merge(ALL_TYPES, { noArrays: true })
      }
    ],
    customColorable: true,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).linemap,
    allowedColorTypes: { solid: true },
    colorTypesFromColumnType: merge(
      map(() => "custom", TEXT_TYPES),
      map(() => "quantitative", NUMERICAL_AND_TIME_TYPES)
    ),
    aliases: { measures: { geo: "geo", size: "size", color: "color" } }
  },
  visible: true,
  masterLayerSettings: [OPACITY, ZOOM_VISIBILITY]
}

export default lineMapDefinition
