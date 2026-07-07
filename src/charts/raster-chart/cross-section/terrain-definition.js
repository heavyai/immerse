// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { BACKEND_RENDERED, GEO_MEASURE, LAYER } from "constants/chart-types"
import {
  ALL_NUMERICAL_TYPES,
  GEO_POINT_TYPES,
  SINGLE_VALUE_TYPES
} from "constants/data-types"
import { getColors, CS_TERRAIN_COLORS } from "services/colors"
import CrossSectionDefinition from "./definition"
import TerrainChartSettings from "./terrain-chart-settings"

import { EndpointSelectorNames } from "./constants"

const crossSectionTerrainChartDefinition = {
  ...CrossSectionDefinition,
  type: "crossSectionTerrain",
  typeConstant: "CROSS_SECTION_TERRAIN",
  typeAlias: "TERRAIN",
  compatibleLayerTypes: ["crossSection", "crossSectionTerrain"],
  supportedNumLayers: 1,
  chartTypeCategories: [LAYER, BACKEND_RENDERED, GEO_MEASURE],

  defaultColors: {
    type: "solid",
    key: "black",
    val: getColors(CS_TERRAIN_COLORS).black
  },

  labelsIcons: {
    label: "Terrain",
    icon: "chart-crossSectionTerrain"
  },
  iconId: "icon-chart-crossSectionTerrain",
  IconComponent: function CrossSectionTerrainIconComponent() {
    return (
      <>
        <g
          transform="scale(2.4) translate(0, 2)"
          clipPath="url(#cross-section-terrain-icon-a)"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.859 8.847C7.846 8.26 8.924 7.804 10 7.804c1.817 0 3.085.947 4.248 1.815.149.112.296.222.443.329 1.315.956 2.785 1.856 5.309 1.856v1.5c-2.976 0-4.756-1.1-6.191-2.143a75.761 75.761 0 0 1-.458-.337c-1.205-.889-2.06-1.52-3.351-1.52-.674 0-1.471.295-2.374.832-.892.531-1.808 1.25-2.71 1.996l-.722.603c-.64.537-1.266 1.064-1.833 1.484a8.491 8.491 0 0 1-1.16.745c-.364.186-.778.34-1.201.34v-1.5c.077 0 .24-.033.52-.175.267-.137.583-.344.947-.614.528-.392 1.101-.874 1.726-1.398.247-.208.503-.422.766-.64.91-.754 1.901-1.535 2.9-2.13Z"
          />
        </g>
        <defs>
          <clipPath id="cross-section-terrain-icon-a">
            <path fill="#fff" d="M0 0h20v20H0z" />
          </clipPath>
        </defs>
      </>
    )
  },
  ChartSettingsComponent: TerrainChartSettings,
  dimensionSettings: () => {
    const base = CrossSectionDefinition.dimensionSettings()
    return {
      ...base,
      minMeasures: 3,
      maxMeasures: 7,
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
        { name: "terrain", required: true, type: ALL_NUMERICAL_TYPES },
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
      aliases: {
        measures: {
          terrain: "terrain",
          lat: "lat",
          lon: "lon",
          [EndpointSelectorNames.START_LAT]: "start lat",
          [EndpointSelectorNames.START_LON]: "start lon",
          [EndpointSelectorNames.END_LAT]: "end lat",
          [EndpointSelectorNames.END_LON]: "end lon"
        }
      }
    }
  },
  visible: false
}

export default crossSectionTerrainChartDefinition
