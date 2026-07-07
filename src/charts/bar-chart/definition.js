// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { NOT_BE_RENDERED, DEPRECATED } from "constants/chart-types"
import {
  getColors,
  ORDINAL_COLORS,
  CHARTS_DEFAULT_COLORS
} from "services/colors"
import { TEXT_TYPES } from "constants/data-types"
import { map, merge } from "ramda"

import { defaultGetColumnKey } from "components/chart-container-header/export-chart-data"

import BarChart from "./bar-container"
import BarChartSettings from "./chart-settings"
import getStackedBarChartData from "./getStackedBarChartData"
const barChartDefinition = {
  type: "bar",
  typeAlias: "STACKED BAR",
  typeConstant: "BAR",
  chartDataFormatter: getStackedBarChartData,
  chartTypeCategories: [NOT_BE_RENDERED, DEPRECATED],
  labelsIcons: { label: "Stacked Bar", icon: "chart-bar" },
  Component: BarChart,
  iconId: "icon-chart-bar",
  exportChartData: {
    getChartData: (chart) => chart.data,
    getColumnKey: (column, columnIndex, groupType) => {
      if (groupType === "measure") {
        return `val${columnIndex === 0 ? "" : columnIndex}`
      } else {
        return defaultGetColumnKey(
          column,
          columnIndex,
          groupType,
          (colName) => colName !== "color"
        )
      }
    }
  },
  IconComponent: function BarIconComponent() {
    return (
      <>
        <rect x="0" y="46" width="48" height="2" />
        <rect x="2" y="23" width="8" height="5" />
        <rect x="2" y="38" width="8" height="4" />
        <rect x="2" y="19" width="8" height="3" />
        <rect x="2" y="29" width="8" height="8" />
        <rect x="26" y="1" width="8" height="5" />
        <rect x="26" y="36" width="8" height="6" />
        <rect x="26" y="7" width="8" height="6" />
        <rect x="26" y="14" width="8" height="21" />
        <rect x="14" y="12" width="8" height="2" />
        <rect x="14" y="23" width="8" height="14" />
        <rect x="14" y="38" width="8" height="4" />
        <rect x="14" y="15" width="8" height="7" />
        <rect x="38" y="13" width="8" height="15" />
        <rect x="38" y="37" width="8" height="5" />
        <rect x="38" y="7" width="8" height="5" />
        <rect x="38" y="29" width="8" height="7" />
      </>
    )
  },
  initialChartData: { isNotDc: true },
  ChartSettingsComponent: BarChartSettings,
  defaultColors: {
    type: "ordinal",
    key: "mapD",
    val: getColors(ORDINAL_COLORS).mapD
  },
  dimensionSettings: {
    isNotDc: true,
    defaultCap: 100,
    minDimensions: 1,
    maxDimensions: 2,
    dimensions: [
      { name: "X Axis", required: true, type: TEXT_TYPES, typeName: "string" },
      {
        name: "Color",
        required: false,
        type: merge(
          // either "line" or "bar", for line-bar combo chart
          TEXT_TYPES,
          { noArrays: true }
        ),
        typeName: "string"
      }
    ],
    minMeasures: 1,
    maxMeasures: 1,
    measures: [{ name: "val", required: true }],
    measures_proto: { name: "y axis" },
    customColorable: true,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).bar,
    allowedColorTypes: { solid: true, ordinal: true, custom: true },
    colorTypesFromColumnType: map(() => "custom", TEXT_TYPES),
    aliases: { measures: { series_1: "y axis", val: "y axis" } }
  },
  visible: true
}

export default barChartDefinition
