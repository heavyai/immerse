// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { NOT_BE_RENDERED } from "constants/chart-types"
import {
  getColors,
  CHARTS_DEFAULT_COLORS,
  ORDINAL_COLORS
} from "services/colors"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { MIN_ROW_HEIGHT } from "components/dashboard/dashboard-helpers"

import Text2Chart from "./text-container"
import Text2ChartSettings from "./chart-settings"
import getText2ChartData from "./getTextChartData"

const text2ChartDefinition = {
  type: "text2",
  typeAlias: "TEXT2",
  typeConstant: "TEXT2",
  chartDataFormatter: getText2ChartData,
  chartTypeCategories: [NOT_BE_RENDERED],
  labelsIcons: { label: "Text2", icon: "chart-text2" },
  Component: Text2Chart,
  iconId: "icon-chart-text2",
  exportChartData: {
    getChartData: (chart) => chart.text2,
    /* NOTE - text chart export is actually disabled
       So this isn't actually available. But just in case we ever flip it back on, this is the code to make it work.
    */
    getChartBlob: ({ dataSource, chartType, timeStamp, outputData }) => {
      const htmlData = outputData[0]
      const blob = new Blob([htmlData], { type: "text/html;charset=utf-8" })
      const filename = `immerse-${dataSource}-${chartType}-${timeStamp}.html`
      return { blob, filename }
    }
  },
  IconComponent: function Text2IconComponent() {
    return (
      <path d="M29.567,29.501l-16.195,0l-1.1,2.704c-1.636,3.92 -2.453,6.478 -2.453,7.673c0,1.279 0.435,2.248 1.305,2.909c0.87,0.66 1.986,0.99 3.349,0.99l0,1.447l-12.673,0l0,-1.447c1.887,-0.293 3.291,-0.959 4.214,-1.996c0.922,-1.038 2.033,-3.224 3.333,-6.557c0.105,-0.314 0.608,-1.53 1.51,-3.648l12.389,-29.591l1.227,0l14.245,33.868l1.949,4.465c0.441,1.007 1.033,1.798 1.777,2.374c0.744,0.577 1.861,0.939 3.349,1.085l0,1.447l-16.761,0l0,-1.447c2.055,0 3.444,-0.152 4.167,-0.456c0.723,-0.304 1.085,-0.906 1.085,-1.808c0,-0.461 -0.482,-1.834 -1.447,-4.119l-3.27,-7.893Zm-0.535,-1.415l-7.547,-18.176l-7.515,18.176l15.062,0Z" />
    )
  },
  initialChartData: { isNotDc: true },
  ChartSettingsComponent: Text2ChartSettings,
  defaultColors: {
    type: "ordinal",
    key: "rainbow",
    val: getColors(ORDINAL_COLORS).rainbow
  },
  dimensionSettings: {
    isNotDc: true,
    minDimensions: 0,
    maxDimensions: 0,
    dimensions: [],
    minMeasures: 0,
    maxMeasures: 0,
    measures: [],
    customColorable: false,
    minHeight: MIN_ROW_HEIGHT,
    defaultColors: getColors(CHARTS_DEFAULT_COLORS).text2,
    allowedColorTypes: { solid: true },
    aliases: { measures: { val: "value" } }
  },
  visible: getFeatureFlag(available_feature_flags.ENABLE_NEW_TEXT_CHART)
}

export default text2ChartDefinition
