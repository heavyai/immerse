// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { NOT_BE_RENDERED } from "constants/chart-types"
import { getColors, SOLID_COLORS, CHARTS_DEFAULT_COLORS } from "services/colors"

import { getICChartData } from "components/chart-container-header/export-chart-data"

import NumberChart from "./number-chart-wrapper"
import NumberChartSettings from "./chart-settings"
import getNumberChartData from "./getNumberChartData"
import { MIN_ROW_HEIGHT } from "components/dashboard/dashboard-helpers"

const numberChartDefinition = {
  type: "number",
  typeAlias: "NUMBER",
  typeConstant: "NUMBER",
  chartDataFormatter: getNumberChartData,
  chartTypeCategories: [NOT_BE_RENDERED],
  labelsIcons: { label: "Number", icon: "chart-number" },
  Component: NumberChart,
  iconId: "icon-chart-number",
  exportChartData: {
    getChartData: (chart) => {
      const data = getICChartData(chart)
      return [{ val: data }]
    }
  },
  IconComponent: function NumberIconComponent() {
    return (
      <path
        d="M25.4,31h-4.9l-1.7,9h-3.7l1.7-9h-5.1v-3.5h5.7l1.3-6.9h-5.3v-3.5h6L21.1,8h3.7l-1.7,9.1H28L29.7,8h3.7l-1.7,9.1h4.6v3.5
H31l-1.3,6.9h4.9V31h-5.5l-1.7,9h-3.7L25.4,31z M21.2,27.5h4.9l1.3-6.9h-4.9L21.2,27.5z"
      />
    )
  },
  ChartSettingsComponent: NumberChartSettings,
  defaultColors: {
    type: "solid",
    key: "blue",
    val: getColors(SOLID_COLORS).blue
  },
  dimensionSettings: {
    minDimensions: 0,
    maxDimensions: 0,
    dimensions: [],
    minMeasures: 1,
    maxMeasures: 1,
    measures: [{ name: "val", required: true }],
    customColorable: false,
    minHeight: MIN_ROW_HEIGHT,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).number,
    allowedColorTypes: { solid: true },
    aliases: { measures: { val: "value" } }
  },
  visible: true
}

export default numberChartDefinition
