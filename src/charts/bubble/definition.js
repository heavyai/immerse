// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { NOT_BE_RENDERED } from "constants/chart-types"

import { NUMERICAL_AND_TIME_TYPES, TEXT_TYPES } from "constants/data-types"
import { DEFAULT_CATEGORICAL_PALETTE } from "constants/colors"
import { map, merge } from "ramda"

import ScatterChart from "./scatter-chart-wrapper"
import ScatterChartSettings from "./chart-settings"
import getBubbleChartData from "./getBubbleChartData"
import { getOrdinalOrSolidPalette } from "vega/charts/color-utils"

const bubbleChartDefinition = {
  type: "scatter",
  typeAlias: "BUBBLE",
  typeConstant: "SCATTER",
  chartDataFormatter: getBubbleChartData,
  chartTypeCategories: [NOT_BE_RENDERED],
  labelsIcons: { label: "Bubble", icon: "chart-scatter" },
  Component: ScatterChart,
  iconId: "icon-chart-scatter",
  IconComponent: function ScatterIconComponent() {
    return (
      <>
        <path d="M39,6.5c1.4,0,2.5,1.1,2.5,2.5s-1.1,2.5-2.5,2.5s-2.5-1.1-2.5-2.5S37.6,6.5,39,6.5 M39,4c-2.8,0-5,2.2-5,5s2.2,5,5,5 s5-2.2,5-5S41.8,4,39,4L39,4z" />
        <circle cx="8" cy="40" r="4" />
        <path d="M39,34.5c2.5,0,4.5,2,4.5,4.5s-2,4.5-4.5,4.5s-4.5-2-4.5-4.5S36.5,34.5,39,34.5 M39,32c-3.9,0-7,3.1-7,7c0,3.9,3.1,7,7,7s7-3.1,7-7C46,35.1,42.9,32,39,32L39,32z" />
        <path
          d="M21.7,14c0.2-0.7,0.3-1.3,0.3-2c0-4.4-3.6-8-8-8s-8,3.6-8,8c0,3.3,2.1,6.2,5,7.4l0,0c-1.2,1.9-2,4.2-2,6.6
      c0,6.6,5.4,12,12,12s12-5.4,12-12C33,19.6,28,14.4,21.7,14z M8.5,12c0-3,2.5-5.5,5.5-5.5S19.5,9,19.5,12c0,0.8-0.2,1.5-0.4,2.2h0
      c-2.4,0.4-4.6,1.5-6.3,3.2l0,0C10.3,16.8,8.5,14.6,8.5,12z M21,34c-4.4,0-8-3.6-8-8c0-4.4,3.6-8,8-8s8,3.6,8,8
      C29,30.4,25.4,34,21,34z"
        />
      </>
    )
  },
  ChartSettingsComponent: ScatterChartSettings,
  defaultColors: {
    type: "ordinal",
    key: DEFAULT_CATEGORICAL_PALETTE,
    val: getOrdinalOrSolidPalette()
  },
  dimensionSettings: {
    defaultCap: 30,
    minDimensions: 1,
    maxDimensions: Infinity,
    dimensions: [{ name: null, required: true }],
    minMeasures: 2,
    maxMeasures: 4,
    measures: [
      { name: "x", required: true },
      { name: "y", required: true },
      { name: "size" },
      { name: "color" }
    ],
    customColorable: true,
    defaultColors: getOrdinalOrSolidPalette(),
    allowedColorTypes: { ordinal: true, solid: true, custom: true },
    colorTypesFromColumnType: map(
      () => "quantitative",
      merge(NUMERICAL_AND_TIME_TYPES, TEXT_TYPES)
    ),
    aliases: {
      measures: { x: "x axis", y: "y axis", size: "size", color: "color" }
    }
  },
  visible: true
}

export default bubbleChartDefinition
