// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { NOT_BE_RENDERED } from "constants/chart-types"
import { NUMERICAL_AND_TIME_TYPES, TEXT_TYPES } from "constants/data-types"
import { DEFAULT_CATEGORICAL_PALETTE } from "constants/colors"
import { map, merge } from "ramda"
// import { getChartAddonTypes } from "chart-addons/chart-addon-registry"

import PieChart from "./pie-chart-wrapper"
import PieChartSettings from "./chart-settings"
import getPieChartData from "./getPieChartData"
import "./pie-crossfilter-replay"
import { getOrdinalOrSolidPalette } from "vega/charts/color-utils"

// const { PIE_CHART_ADDON_CROSSFILTER_REPLAY } = getChartAddonTypes()

const pieChartDefinition = {
  type: "pie",
  typeAlias: "PIE",
  typeConstant: "PIE",
  chartDataFormatter: getPieChartData,
  chartTypeCategories: [NOT_BE_RENDERED],
  labelsIcons: { label: "Pie Chart", icon: "chart-pie" },
  Component: PieChart,
  iconId: "icon-chart-pie",
  IconComponent: function PieIconComponent() {
    return (
      <path
        d="M40.6,12.9l3.3-2.2C39.7,4.2,32.3,0,24,0v4C13,4,4,13,4,24s9,20,20,20s20-9,20-20C44,19.9,42.8,16.1,40.6,12.9z M26.5,2.6
      c5.4,0.6,10.4,3.3,13.9,7.4l-13.9,9.3V2.6z M24,40.5c-9.1,0-16.5-7.4-16.5-16.5S14.9,7.5,24,7.5V24l13.7-9.1
      c1.8,2.6,2.8,5.8,2.8,9.1C40.5,33.1,33.1,40.5,24,40.5z"
      />
    )
  },
  ChartSettingsComponent: PieChartSettings,
  // addons: [PIE_CHART_ADDON_CROSSFILTER_REPLAY],
  defaultColors: {
    type: "ordinal",
    key: DEFAULT_CATEGORICAL_PALETTE,
    val: getOrdinalOrSolidPalette()
  },
  dimensionSettings: {
    defaultCap: 10,
    minDimensions: 1,
    maxDimensions: Infinity,
    dimensions: [{ name: null, required: true }],
    minMeasures: 1,
    maxMeasures: 2,
    measures: [{ name: "val", required: true }, { name: "color" }],
    customColorable: true,
    defaultColors: getOrdinalOrSolidPalette(),
    allowedColorTypes: { ordinal: true, solid: true, custom: true },
    colorTypesFromColumnType: map(
      () => "quantitative",
      merge(NUMERICAL_AND_TIME_TYPES, TEXT_TYPES)
    ),
    aliases: { measures: { val: "size", color: "color" } }
  },
  visible: true
}

export default pieChartDefinition
