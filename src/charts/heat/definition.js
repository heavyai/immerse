// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { NOT_BE_RENDERED } from "constants/chart-types"
import {
  getColors,
  QUANTITATIVE_COLORS,
  CHARTS_DEFAULT_COLORS
} from "services/colors"
import { NUMERICAL_AND_TIME_TYPES, TEXT_TYPES } from "constants/data-types"
import { map, merge } from "ramda"

import { defaultGetColumnKey } from "components/chart-container-header/export-chart-data"

import HeatChart from "./heat-chart-wrapper"
import HeatChartSettings from "./chart-settings"
import getHeatChartData from "./getHeatChartData"

const heatChartDefinition = {
  type: "heat",
  typeAlias: "HEAT",
  typeConstant: "HEAT",
  chartDataFormatter: getHeatChartData,
  chartTypeCategories: [NOT_BE_RENDERED],
  labelsIcons: { label: "Heat", icon: "chart-heat" },
  Component: HeatChart,
  iconId: "icon-chart-heat",
  exportChartData: {
    getColumnKey: (column, columnIndex, groupType) =>
      defaultGetColumnKey(
        column,
        columnIndex,
        groupType,
        (colName) => colName !== "color"
      )
  },
  IconComponent: function HeatIconComponent() {
    return (
      <>
        <rect x="4" y="32" width="12" height="12" />
        <path d="M4,30h12V18H4V30z M7,21h6v6H7V21z" />
        <path d="M4,16h12V4H4V16z M6,6h8v8H6V6z" />
        <path d="M18,16h12V4H18V16z M20,6h8v8h-8V6z" />
        <rect x="18" y="18" width="12" height="12" />
        <path d="M32,4v12h12V4H32z M41,13h-6V7h6V13z" />
        <path d="M18,44h12V32H18V44z M21,35h6v6h-6V35z" />
        <rect x="32" y="18" width="12" height="12" />
        <path d="M32,44h12V32H32V44z M34,34h8v8h-8V34z" />
      </>
    )
  },
  ChartSettingsComponent: HeatChartSettings,
  defaultColors: {
    type: "quantitative",
    key: "mapDScale",
    val: getColors(QUANTITATIVE_COLORS).mapDScale
  },
  dimensionSettings: {
    minDimensions: 2,
    maxDimensions: 2,
    dimensions: [
      { name: "X Axis", required: true },
      { name: "Y Axis", required: true }
    ],
    minMeasures: 1,
    maxMeasures: 1,
    measures: [{ name: "color", required: true }],
    customColorable: false,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).heat,
    allowedColorTypes: { quantitative: true },
    colorTypesFromColumnType: map(
      () => "quantitative",
      merge(NUMERICAL_AND_TIME_TYPES, TEXT_TYPES)
    ),
    aliases: { measures: { color: "color" } }
  },
  visible: true
}

export default heatChartDefinition
