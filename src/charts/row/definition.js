// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { NOT_BE_RENDERED, DEPRECATED } from "constants/chart-types"

import {
  getColors,
  ORDINAL_COLORS,
  CHARTS_DEFAULT_COLORS
} from "services/colors"
import { NUMERICAL_AND_TIME_TYPES, TEXT_TYPES } from "constants/data-types"
import { map, merge } from "ramda"
// import { getChartAddonTypes } from "chart-addons/chart-addon-registry"

import RowChart from "./row-chart-wrapper"
import RowChartSettings from "./chart-settings"
import getBarChartData from "./getBarChartData"

import "./row-crossfilter-replay"

// const { ROW_CHART_ADDON_CROSSFILTER_REPLAY } = getChartAddonTypes()

const rowChartDefinition = {
  type: "row",
  typeAlias: "BAR",
  typeConstant: "ROW",
  chartDataFormatter: getBarChartData,
  chartTypeCategories: [NOT_BE_RENDERED, DEPRECATED],
  labelsIcons: { label: "Bar Chart", icon: "chart-row" },
  Component: RowChart,
  iconId: "icon-chart-row",
  IconComponent: function RowIconComponent() {
    return (
      <>
        <rect x="4" y="4" width="2" height="40" />
        <rect x="10" y="16" width="26" height="6" />
        <rect x="10" y="6" width="34" height="6" />
        <rect x="10" y="26" width="18" height="6" />
        <rect x="10" y="36" width="14" height="6" />
      </>
    )
  },
  ChartSettingsComponent: RowChartSettings,
  // addons: [ROW_CHART_ADDON_CROSSFILTER_REPLAY],
  defaultColors: {
    type: "ordinal",
    key: "mapD",
    val: getColors(ORDINAL_COLORS).mapD
  },
  dimensionSettings: {
    defaultCap: 100,
    minDimensions: 1,
    maxDimensions: Infinity,
    dimensions: [{ name: null, required: true }],
    minMeasures: 1,
    maxMeasures: 2,
    measures: [{ name: "val", required: true }, { name: "color" }],
    customColorable: true,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).row,
    allowedColorTypes: { ordinal: true, solid: true, custom: true },
    colorTypesFromColumnType: map(
      () => "quantitative",
      merge(NUMERICAL_AND_TIME_TYPES, TEXT_TYPES)
    ),
    aliases: { measures: { val: "width", color: "color" } }
  },
  visible: true
}

export default rowChartDefinition
