// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { map, merge } from "ramda"

import {
  BACKEND_RENDERED,
  GEO_MEASURE,
  DENSITY_ACCUMULATION,
  LAYER
} from "constants/chart-types"
import { getColors, SOLID_COLORS, CHARTS_DEFAULT_COLORS } from "services/colors"

import {
  ALL_NUMERICAL_TYPES,
  GEO_POINT_TYPES,
  NUMERICAL_AND_TIME_TYPES,
  SINGLE_VALUE_TYPES,
  TEXT_TYPES
} from "constants/data-types"

import CrossSectionChart from "charts/raster-chart/cross-section/cross-section-chart"
import CrossSectionChartSettings from "./chart-settings"
import getCrossSectionChartData from "charts/raster-chart/cross-section/getCrossSectionChartData"

import { getChartAddonTypes } from "chart-addons/chart-addon-registry"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

import CrossSectionDataSelectionPanel from "./cross-section-data-selection-panel"
import { EndpointSelectorNames } from "./constants"
import { MASTER_LAYER_SETTINGS } from "../raster-chart-consts"

const { CHART_ADDON_EXPORT_AS_IMAGE } = getChartAddonTypes()

const crossSectionChartDefinition = {
  type: "crossSection",
  typeConstant: "CROSS_SECTION",
  chartDataFormatter: getCrossSectionChartData,
  typeAlias: "CROSS SECTION",
  chartTypeCategories: [
    LAYER,
    BACKEND_RENDERED,
    GEO_MEASURE,
    DENSITY_ACCUMULATION
  ],
  masterLayerSettings: [MASTER_LAYER_SETTINGS.OPACITY],
  labelsIcons: { label: "Cross Section", icon: "chart-crossSection" },
  Component: CrossSectionChart,
  iconId: "icon-chart-crossSection",
  // For multi layer chart, which other layer types are supported?
  compatibleLayerTypes: ["crossSection", "crossSectionTerrain"],
  subTypes: ["crossSection", "crossSectionTerrain"],
  supportedNumLayers: 2,
  IconComponent: function CrossSectionIconComponent() {
    return (
      <>
        <g
          transform="scale(2.4) translate(0, 2)"
          clipPath="url(#cross-section-icon-a)"
        >
          <path d="m.465 11.1.054-.026c.268-.137.584-.344.948-.614.528-.392 1.101-.873 1.726-1.398.247-.208.503-.422.766-.64.91-.753 1.901-1.535 2.9-2.13C7.846 5.706 8.924 5.25 10 5.25c1.817 0 3.085.947 4.248 1.815.149.111.296.221.443.328C16.006 8.35 17.476 9.25 20 9.25V0H0v11.133c.161 0 .316-.011.465-.032Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.859 8.847C7.846 8.26 8.924 7.804 10 7.804c1.817 0 3.085.947 4.248 1.815.149.112.296.222.443.329 1.315.956 2.785 1.856 5.309 1.856v1.5c-2.976 0-4.756-1.1-6.191-2.143a75.761 75.761 0 0 1-.458-.337c-1.205-.889-2.06-1.52-3.351-1.52-.674 0-1.471.295-2.374.832-.892.531-1.808 1.25-2.71 1.996l-.722.603c-.64.537-1.266 1.064-1.833 1.484a8.491 8.491 0 0 1-1.16.745c-.364.186-.778.34-1.201.34v-1.5c.077 0 .24-.033.52-.175.267-.137.583-.344.947-.614.528-.392 1.101-.874 1.726-1.398.247-.208.503-.422.766-.64.91-.754 1.901-1.535 2.9-2.13Z"
          />
        </g>
        <defs>
          <clipPath id="cross-section-icon-a">
            <path fill="#fff" d="M0 0h20v20H0z" />
          </clipPath>
        </defs>
      </>
    )
  },
  ChartSettingsComponent: CrossSectionChartSettings,
  defaultColors: {
    type: "solid",
    key: "blue",
    val: getColors(SOLID_COLORS).blue
  },
  dimensionSettings: () => ({
    capMin: 1000,
    defaultCap: 2000000,
    minDimensions: 0,
    maxDimensions: 0,
    maxPostFilters: 1,
    dimensionTypes: GEO_POINT_TYPES,
    dimensions: [],
    minMeasures: 4,
    maxMeasures: 8,
    measures: [
      {
        name: "lon",
        required: true,
        type: GEO_POINT_TYPES
      },
      {
        name: "lat",
        required: true,
        type: GEO_POINT_TYPES
      },
      { name: "z", required: true, type: ALL_NUMERICAL_TYPES },
      {
        name: "color",
        type: ALL_NUMERICAL_TYPES
      },
      {
        name: EndpointSelectorNames.START_LON,
        required: false,
        type: SINGLE_VALUE_TYPES,
        typeName: "numerical"
      },
      {
        name: EndpointSelectorNames.START_LAT,
        required: false,
        type: SINGLE_VALUE_TYPES,
        typeName: "numerical"
      },
      {
        name: EndpointSelectorNames.END_LON,
        required: false,
        type: SINGLE_VALUE_TYPES,
        typeName: "numerical"
      },
      {
        name: EndpointSelectorNames.END_LAT,
        required: false,
        type: SINGLE_VALUE_TYPES,
        typeName: "numerical"
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
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).backendScatter,
    allowedColorTypes: { solid: true },
    colorTypesFromColumnType: merge(
      map(() => "custom", TEXT_TYPES),
      map(() => "quantitative", NUMERICAL_AND_TIME_TYPES)
    ),
    aliases: {
      measures: {
        z: "z axis",
        color: "color",
        lat: "lat",
        lon: "lon",
        [EndpointSelectorNames.START_LAT]: "start lat",
        [EndpointSelectorNames.START_LON]: "start lon",
        [EndpointSelectorNames.END_LAT]: "end lat",
        [EndpointSelectorNames.END_LON]: "end lon"
      }
    }
  }),
  disableAddons: [CHART_ADDON_EXPORT_AS_IMAGE],
  visible: getFeatureFlag(available_feature_flags.ENABLE_CROSS_SECTION_CHART),
  DataSelectionPanel: CrossSectionDataSelectionPanel
}

export default crossSectionChartDefinition
