// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { NOT_BE_RENDERED, DEPRECATED } from "constants/chart-types"
import { getColors, SOLID_COLORS, CHARTS_DEFAULT_COLORS } from "services/colors"
import { NUMERICAL_AND_TIME_TYPES, TEXT_TYPES } from "constants/data-types"
import { merge, values } from "ramda"

import {
  exportSeriesMapper,
  getICChartData,
  defaultGetColumnKey
} from "components/chart-container-header/export-chart-data"

import HistogramChartCreator from "charts/line/line-chart-component"
import HistogramChartSettings from "./chart-settings"
import getHistogramData from "./getHistogramData"

const histogramChartDefinition = {
  type: "histogram",
  typeAlias: "HISTOGRAM",
  typeConstant: "HISTOGRAM",
  chartDataFormatter: getHistogramData,
  chartTypeCategories: [NOT_BE_RENDERED, DEPRECATED],
  labelsIcons: { label: "Histogram", icon: "chart-histogram" },
  Component: HistogramChartCreator(),
  iconId: "icon-chart-histogram",
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
  IconComponent: function HistogramIconComponent() {
    return (
      <>
        <rect x="4" y="42" width="40" height="2" />
        <rect x="26" y="4" width="6" height="34" />
        <rect x="36" y="12" width="6" height="26" />
        <rect x="16" y="20" width="6" height="18" />
        <rect x="6" y="24" width="6" height="14" />
      </>
    )
  },
  ChartSettingsComponent: HistogramChartSettings,
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
    measures: [{ name: "val", required: true }],
    customColorable: true,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).histogram,
    allowedColorTypes: { solid: true },
    aliases: { measures: { val: "height" } }
  },
  visible: true
}

export default histogramChartDefinition
