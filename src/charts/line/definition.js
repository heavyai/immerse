// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { NOT_BE_RENDERED } from "constants/chart-types"
import { getColors, SOLID_COLORS, CHARTS_DEFAULT_COLORS } from "services/colors"
import { NUMERICAL_AND_TIME_TYPES, TEXT_TYPES } from "constants/data-types"
import { map, merge, values } from "ramda"

import {
  exportSeriesMapper,
  getICChartData,
  defaultGetColumnKey
} from "components/chart-container-header/export-chart-data"

import LineChartCreator from "charts/line/line-chart-component"
import LineChartSettings from "./chart-settings"

const lineChartDefinition = {
  type: "line",
  typeAlias: "LINE",
  typeConstant: "LINE",
  chartTypeCategories: [NOT_BE_RENDERED],
  labelsIcons: { label: "Line", icon: "chart-line" },
  Component: LineChartCreator(),
  iconId: "icon-chart-line",
  exportChartData: {
    getChartData: (chart) => {
      const data = getICChartData(chart)
      const chartInternalData = { ...data }
      return exportSeriesMapper(values(chartInternalData)[0], chart)
    },
    getColumnKey: (column, columnIndex, groupType) =>
      defaultGetColumnKey(
        column,
        columnIndex,
        groupType,
        (colName) => colName !== "color"
      )
  },
  IconComponent: function LineIconComponent() {
    return (
      <>
        <rect x="36.24" y="20.86" width="5.65" height="22.6" />
        <rect x="26.26" y="31.03" width="5.65" height="12.33" />
        <rect x="16.69" y="27.13" width="5.65" height="16.22" />
        <rect x="7.12" y="35.73" width="5.65" height="7.62" />
        <path
          d="M37.72,4.54A3.77,3.77,0,0,0,35,10.87L30,17.47a3.75,3.75,0,0,0-4.45,1l-4.89-2.23v0a3.78,3.78,0,1,0-6.41,
      2.7L9.49,25.19a3.78,3.78,0,1,0,1.34.82l4.78-6.28a3.75,3.75,0,0,0,4.73-2l4.49,2a3.78,3.78,0,1,0,6.45-1.42l4.95-6.63a3.77,3.77,0,1,0,1.5-7.24ZM8.22,31a2.21,2.21,0,1,1,
      2.21-2.21A2.22,2.22,0,0,1,8.22,31ZM16.9,18.41a2.21,2.21,0,1,1,2.21-2.21A2.22,2.22,0,0,1,16.9,18.41Zm11.54,4.69a2.21,2.21,0,1,1,2.21-2.21A2.22,2.22,0,0,1,
      28.44,23.11Zm9.28-12.58a2.21,2.21,0,1,1,2.21-2.21A2.22,2.22,0,0,1,37.72,10.53Z"
        />
      </>
    )
  },
  ChartSettingsComponent: LineChartSettings,
  defaultColors: {
    type: "solid",
    key: "blue",
    val: getColors(SOLID_COLORS).blue
  },
  dimensionSettings: {
    minDimensions: 1,
    maxDimensions: 2,
    dimensions: [
      {
        name: "X Axis",
        required: true,
        type: NUMERICAL_AND_TIME_TYPES,
        typeName: "numerical"
      },
      {
        name: "Color",
        required: false,
        type: merge(TEXT_TYPES, { noArrays: true }),
        typeName: "string"
      }
    ],
    minMeasures: 1,
    maxMeasures: 1,
    measures: [{ name: "series_1", required: true }],
    customColorable: true,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).line,
    allowedColorTypes: { solid: true },
    colorTypesFromColumnType: map(() => "custom", TEXT_TYPES),
    aliases: {
      measures: { series_1: "y axis" }
    }
  },
  visible: true
}

export default lineChartDefinition
