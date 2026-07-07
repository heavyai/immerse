// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { BACKEND_RENDERED, GEO_MEASURE, LAYER } from "constants/chart-types"
import { CHARTS_DEFAULT_COLORS, getColors, SOLID_COLORS } from "services/colors"
import {
  ALL_NUMERICAL_TYPES,
  ALL_TYPES,
  GEO_POINT_TYPES,
  NUMERICAL_AND_TIME_TYPES,
  TEXT_TYPES
} from "constants/data-types"
import "../point/pointmap-crossfilter-replay"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import WindbarbChart from "./windbarb-chart"
import getPointMapData from "../point/getPointMapData"
import { CHART_TYPE_WINDBARB } from "./constants"
import { mapObject } from "../../utils/map-object"
import WindbarbDisplaySettings from "./windbarb-display-settings"
import { MASTER_LAYER_SETTINGS } from "charts/raster-chart/raster-chart-consts"

const { ZOOM_VISIBILITY } = MASTER_LAYER_SETTINGS
const { WINDBARB_DEFAULT_POINTS, WINDBARB_MAX_POINTS } = available_feature_flags

const WindbarbSettingsWrapper = ({ id: chartId, updateChart }) => {
  return (
    <WindbarbDisplaySettings
      {...{
        chartId,
        updateChart
      }}
    />
  )
}

const WindbarbDefinition = {
  type: CHART_TYPE_WINDBARB,
  typeConstant: "WINDBARB",
  chartDataFormatter: getPointMapData,
  chartTypeCategories: [BACKEND_RENDERED, GEO_MEASURE, LAYER],
  labelsIcons: { label: "Windbarb", icon: "chart-windbarb" },
  Component: WindbarbChart,
  iconId: "icon-chart-windbarb",
  IconComponent: function WindbarbIconComponent() {
    return (
      <>
        <path d="M21.7732 23.2611L21.063 23.9686L25.1611 24.3401L25.0257 25.834L19.6773 25.3492L17.5777 27.4409C17.6802 27.9202 17.5452 28.4402 17.1728 28.8126C16.5887 29.3967 15.6417 29.3967 15.0576 28.8126C14.4735 28.2285 14.4735 27.2815 15.0576 26.6974C15.4722 26.2828 16.0695 26.1625 16.5902 26.3364L19.0758 23.8507L19.0814 23.789L19.1328 23.7937L22.0664 20.8601L22.0649 20.86L25.0259 17.899L25.0267 17.8998L25.0276 17.899L25.028 17.9012L25.4002 18.2734L28.9821 21.4332L24.0206 21.0221L23.1589 21.8805L30.2811 22.5261L30.1457 24.02L21.7732 23.2611Z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M47.6 12.7L48 13L48.6 14.4L48.3 15.3L47.5 16.1L47.3 16.2L47.2 16.4L46.9 16.7L46.5 17L46.4 17.4L47 19.3L46.3 19.9L46 20.1L44.7 20.8L44.6 21V21.5L44.3 22.7L44 22.9L44.1 23.4L43.9 24.9L43.7 25L44.1 25.8L44.2 26.6L44 27.3L43.5 28.1L43.4 28.2V28.7L42.3 29.9L41.9 30.2L41.7 30.3L41.6 30.7L41.3 31.1L40.5 32L40.1 32.7L40.2 33.6L41.2 35L41.4 35.7L42.2 37.3L42.3 37.9V39.1L42.1 39.8L41.4 40.8L39.2 40.6L38.9 40L38.3 39.6L37.7 38.9L37.6 38.8L37 37.8V37.1L36.6 36.6V36.1L36.4 35.9L36.2 36L34.6 35.9L34.3 35.6L33.3 35.7L32.6 35.5H32.5L32.3 35.9L31.7 36.6L30.8 37.1H29.9L29 36.7L27.7 36.6L26.9 37.1L25.3 38.2V39.7L23.7 40.9L22 40.4L21.2 39.6L20.8 38.5L20.2 37.7L20 37.4L19.7 36.6V36.7L18.1 37.1L16.8 36.4L16.1 35.4L16 34.7L15.8 34.6L15.4 34.3L15 33.7L14.5 33.6L13.8 34.1L10.7 33.5L10.3 33.3L7.7 31.6L7.6 31.4L6.1 31.2L5 30.1L4.9 29.5L4.6 29.3L4.3 28.8L3.5 28L2.8 27V26.8L2.1 25.5L2 25.2L1.7 23.5L1.6 22.5V22.3L1.3 21.9L1.1 21.3L1 19.5L1.2 18.8L1.8 17.8V16.7L1.9 16.1L3.3 13L3.5 12.1L3.4 10.5L5.3 9.4L5.8 9.7L6.5 9L12.3 10.3L18.9 11.4L25.9 11.7L26.8 11.5L27.9 12.2L28.7 12.5H29.5L30.3 12.8L30.4 13.7H31.9L32.3 14.1L32.9 13.9H33.7L34.6 14.2L35.4 14.9L35.6 15.4L35.5 15.6L36.3 16.5L36.5 17.6H36.8L37.3 19L37.6 18.6L38.5 17.1L39.4 17L39.6 16.2L40.4 15.1L41.1 14.6L43.2 14.1V13.9L43.3 13.6L43.7 11.7L45 10.7H46.1L47.3 11.6L47.6 12.7ZM46.4 15L46.8 14.8L47 14.1L46.4 13.7L46.3 13.6L45.9 12.2H45.2L44.8 14.6L44 15.4L41.6 16L40.9 16.9L41 17.6L40.9 17.9L40.2 18.3L39 18.5L39.2 18.9L39.1 19.2L38.1 20.3L36.4 21.3H36.2L35.5 21L35.4 20.7L35.9 19.5L35.5 18.6L35.3 18.9H34.9L34.7 18.5V18.2L35 17.8L34.8 16.9L34 16.7L33.7 17.5L33.3 17.7L33.1 19L33.4 19.5V19.7L33.3 20.9L33.2 21.1L32.5 21.7L32.1 21.6L31.6 20L31.9 18.2H31.8L31.5 17.9L32 16.5L32.2 16.3H32.6L33.5 15.9L34.2 15.8L33.5 15.6L32.1 16.1L31.8 16L31.6 15.6L31.2 15.3L30.8 15.7L29.7 16.3L29.4 16.2L29.2 15.9L28.7 16L28.4 15.6L29.2 14.5L29.4 14.4L29.2 14.3L28.8 14.4H28.6L27.2 13.8L26.2 13.1L26.1 13.3L25.9 13.4L18.8 13.1L12.1 11.9L6.6 10.5V11.4L6.2 11.6L4.9 10.9L5 12.1V12.2L4.8 13.4L3.2 16.8V18.3L2.5 19.5L2.6 21.1L3.1 21.8V22.3L3.2 23.3L3.5 24.9L4.1 26.2L4.8 27.2L5.5 27.6L5.6 27.8V28L6.2 28.5L6.3 28.7L6.4 29.6L8.3 29.9L8.5 30.1V30.3L11 31.9L13.9 32.6L14 32.3L14.3 32.1L15.8 32.4H16L16.7 33.4L17.3 33.8L17.4 34L17.5 35.2L18.5 35.7L19 35L19.3 34.9L20.8 35.5L20.9 35.6L21.4 36.9L22.2 37.9L22.6 39.1L23.8 39.5V37.6L27.1 35.4H27.3L28.9 35.5L29 35.3H29.4L29.9 35.9H30.6L31.1 35.3L31.2 34.7L31.4 34.5L32.8 34.1H33L33.3 34.3L34.8 34.1H35L35.6 34.6L36.3 34.1H36.9L37.1 34.3L37.6 34.9L38 35L38.2 35.2L38.3 36.3L38.6 36.4L38.7 36.8L38.5 37.1L39 38L39.5 38.7L39.9 38.8L40.1 38.9L40.4 39.6L40.8 39V37.9L39.9 36.1V35.7L38.8 34.1V34L38.7 32.4V32.3L39.4 31.1L40.3 30.1L40.6 29.2L40.7 29.1L41.3 28.9L42.2 27.9L42.1 27.7V27.3L42.6 26.9L42.7 26.3L41.6 24.1L41.4 22.7L41.9 22.6L42.3 23.7L42.5 24L42.6 23.2L42.1 22.4L42.3 22L42.9 22.1L43.1 21.1L43 20.8V20.6L43.6 19.7L43.7 19.6L45.3 18.8L45.6 18.6H45.5L45.4 18.5L45 18.2L44.9 18L45.1 16.3L45.2 16.1L46 15.6L46.3 15.1L46.4 15Z"
        />
      </>
    )
  },
  ChartSettingsComponent: WindbarbSettingsWrapper,
  defaultColors: {
    type: "solid",
    key: "blue",
    val: getColors(SOLID_COLORS).blue
  },
  dimensionSettings: () => ({
    capMin: 0,
    capMax: getFeatureFlag(WINDBARB_MAX_POINTS),
    defaultCap: getFeatureFlag(WINDBARB_DEFAULT_POINTS),
    minDimensions: 0,
    maxDimensions: 0,
    dimensionTypes: {},
    dimensions: [],
    minMeasures: 4,
    maxMeasures: 6,
    maxPostFilters: 1,
    measures: [
      { name: "x", required: true, type: GEO_POINT_TYPES },
      { name: "y", required: true, type: GEO_POINT_TYPES },
      { name: "speed", required: true, type: ALL_NUMERICAL_TYPES },
      { name: "orientation", required: true, type: ALL_NUMERICAL_TYPES },
      {
        name: "color",
        type: {
          ...ALL_TYPES,
          noArrays: true
        }
      }
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
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).pointmap,
    allowedColorTypes: { solid: true },
    colorTypesFromColumnType: {
      ...mapObject(TEXT_TYPES, "custom"),
      ...mapObject(NUMERICAL_AND_TIME_TYPES, "quantitative")
    },
    aliases: {
      measures: {
        x: "Lon",
        y: "Lat",
        speed: "speed",
        size: "size",
        color: "color",
        orientation: "direction"
      }
    }
  }),
  visible: getFeatureFlag(available_feature_flags.ENABLE_WINDBARB_CHART),
  masterLayerSettings: [ZOOM_VISIBILITY]
}

export default WindbarbDefinition
