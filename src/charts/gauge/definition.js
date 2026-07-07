// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { NOT_BE_RENDERED } from "constants/chart-types"
import { getColors, ORDINAL_COLORS } from "services/colors"
import { ALL_NUMERICAL_TYPES } from "constants/data-types"

import GaugeChart from "./chart"
import GaugeChartSettings from "./chart-settings"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const defaultColors = {
  type: "ordinal",
  key: "gauge",
  val: getColors(ORDINAL_COLORS).gauge
}

const gaugeChartDefinition = {
  type: "gauge",
  typeAlias: "GAUGE",
  typeConstant: "GAUGE",
  // chartDataFormatter: getIFrameData,
  chartTypeCategories: [NOT_BE_RENDERED],
  labelsIcons: { label: "Gauge", icon: "chart-gauge" },
  Component: GaugeChart,
  iconId: "icon-chart-gauge",
  exportChartData: {
    getChartData: (chart) => chart.data
  },
  IconComponent: function GaugeIconComponent() {
    return (
      <g transform="translate(0,7)">
        <path d="M-0,28.288c-0.139,-1.089 0,-2.2 0,-3.328c0,-13.785 10.745,-24.96 24,-24.96c13.255,0 24,11.175 24,24.96c0,1.128 0.14,2.228 0,3.317l-3.233,-0c-0,-0 0.033,-2.185 0.033,-3.317c0,-11.947 -9.312,-21.632 -20.8,-21.632c-11.488,0 -20.8,9.685 -20.8,21.632c-0,1.132 0.033,3.328 0.033,3.328l-3.233,0Z" />
        <path
          d="M19.448,17.611l5.151,10.344"
          stroke="currentColor"
          strokeWidth="4%"
        />
        <path d="M16.771,12.233l6.523,4.343l-6.878,3.704l0.355,-8.047Z" />
        <path d="M23.485,25.716c1.568,-0.844 3.5,-0.206 4.313,1.425c0.812,1.632 0.198,3.641 -1.371,4.486c-1.568,0.845 -3.5,0.206 -4.313,-1.425c-0.812,-1.631 -0.198,-3.641 1.371,-4.486Z" />
      </g>
    )
  },
  initialChartData: {
    isNotDc: true,
    color: defaultColors,
    segments: []
  },
  ChartSettingsComponent: GaugeChartSettings,
  defaultColors,
  dimensionSettings: {
    isNotDc: true,
    minDimensions: 0,
    maxDimensions: 0,
    dimensions: [],
    minMeasures: 1,
    maxMeasures: 4,
    measures: [
      {
        name: "base",
        required: true,
        type: ALL_NUMERICAL_TYPES,
        aggType: "Avg"
      },
      {
        name: "minMeter",
        required: true,
        type: ALL_NUMERICAL_TYPES,
        aggType: "Min"
      },
      {
        name: "maxMeter",
        required: true,
        type: ALL_NUMERICAL_TYPES,
        aggType: "Max"
      },
      {
        name: "target",
        required: false,
        type: ALL_NUMERICAL_TYPES,
        aggType: "Avg"
      }
    ],
    customColorable: false,
    allowedColorTypes: { none: true },
    aliases: {
      measures: {
        base: "Base",
        target: "Target",
        minMeter: "Min",
        maxMeter: "Max"
      }
    }
  },

  visible: getFeatureFlag(available_feature_flags.ENABLE_GAUGE_CHART)
}

export default gaugeChartDefinition
