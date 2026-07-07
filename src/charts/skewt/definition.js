// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { NOT_BE_RENDERED } from "constants/chart-types"
import { getColors, ORDINAL_COLORS } from "services/colors"
import { NUMERICAL_AND_TIME_TYPES } from "constants/data-types"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { defaultGetColumnKey } from "components/chart-container-header/export-chart-data"

import SkewT from "./chart"
import SkewTSettings from "./chart-settings"

const skewTDefinition = {
  type: "skewt",
  typeAlias: "SKEW-T",
  typeConstant: "SKEWT",
  chartTypeCategories: [NOT_BE_RENDERED],
  labelsIcons: { label: "Skew-T", icon: "chart-skewt" },
  Component: SkewT,
  iconId: "icon-chart-skewt",
  exportChartData: {
    getChartData: (chart) => chart.data,
    getColumnKey: (column, columnIndex, groupType) =>
      defaultGetColumnKey(column, columnIndex, groupType, () => true)
  },

  IconComponent: function SkewTIconComponent() {
    return (
      <g transform="scale(0.5)">
        <path d="M26.127,64.669h3.807a1.5,1.5,0,0,0,0-3H26.127a16.18,16.18,0,1,1,12.623-26.3,1.5,1.5,0,0,0,2.34-1.878A19.18,19.18,0,1,0,26.127,64.669Z" />
        <path d="M30.942,23.092a1.5,1.5,0,0,0,1.771-1.168,16.177,16.177,0,1,1,31.668,6.628c-.007.032-.006.064-.011.1a1.7,1.7,0,0,0-.019.175,1.349,1.349,0,0,0,.006.142c0,.049,0,.1.014.149a1.456,1.456,0,0,0,.04.161c.01.034.013.068.026.1,0,.008.008.015.011.024a1.465,1.465,0,0,0,.069.144c.021.042.04.085.064.124s.048.064.072.1a1.419,1.419,0,0,0,.108.135c.023.025.05.044.075.067a1.365,1.365,0,0,0,.142.122c.029.02.062.036.092.055a1.653,1.653,0,0,0,.159.089c.033.015.069.024.1.037a1.521,1.521,0,0,0,.177.057.2.2,0,0,0,.023.007c.03.007.06.005.09.01a1.627,1.627,0,0,0,.186.02c.013,0,.027,0,.041,0s.032-.008.048-.008a1.493,1.493,0,0,0,.433-.075l.022-.006h0a16.186,16.186,0,1,1,8.926,31.037,1.5,1.5,0,0,0,.311,2.968,1.537,1.537,0,0,0,.314-.033A19.176,19.176,0,1,0,67.651,26.8c.046-.539.085-1.079.085-1.621a19.177,19.177,0,0,0-37.963-3.856A1.5,1.5,0,0,0,30.942,23.092Z" />
        <path d="M63.691,61.668H37.344a1.5,1.5,0,0,0,0,3H63.691a10.98,10.98,0,1,0-10.98-10.98,1.5,1.5,0,0,0,3,0,7.98,7.98,0,1,1,7.98,7.98Z" />
        <path d="M93.054,80.185a9.6,9.6,0,0,0-9.593-9.592H53.269a1.5,1.5,0,1,0,0,3H83.461a6.593,6.593,0,1,1-6.593,6.592,1.5,1.5,0,0,0-3,0,9.593,9.593,0,1,0,19.186,0Z" />
        <path d="M59,91a3.931,3.931,0,0,1-3.927-3.926,1.5,1.5,0,0,0-3,0A6.927,6.927,0,1,0,59,80.148H37.344a1.5,1.5,0,1,0,0,3H59A3.926,3.926,0,0,1,59,91Z" />
        <path d="M26.679,72.093a1.5,1.5,0,0,0,1.5,1.5H42.868a1.5,1.5,0,1,0,0-3H28.179A1.5,1.5,0,0,0,26.679,72.093Z" />
        <path d="M18.168,70.593h-5.85a1.5,1.5,0,1,0,0,3h5.85a1.5,1.5,0,0,0,0-3Z" />
      </g>
    )
  },
  initialChartData: { isNotDc: true },
  ChartSettingsComponent: SkewTSettings,

  defaultColors: {
    type: "ordinal",
    key: "blueRed",
    val: getColors(ORDINAL_COLORS).blueRed
  },
  dimensionSettings: {
    isNotDc: true,
    minDimensions: 6,
    maxDimensions: 6,
    dimensions: [
      {
        name: "press",
        required: true,
        type: NUMERICAL_AND_TIME_TYPES,
        typeName: "numerical"
      },
      {
        name: "hght",
        required: true,
        type: NUMERICAL_AND_TIME_TYPES,
        typeName: "numerical"
      },
      {
        name: "temp",
        required: true,
        type: NUMERICAL_AND_TIME_TYPES,
        typeName: "numerical"
      },
      {
        name: "dwpt",
        required: true,
        type: NUMERICAL_AND_TIME_TYPES,
        typeName: "numerical"
      },
      {
        name: "wdir",
        required: true,
        type: NUMERICAL_AND_TIME_TYPES,
        typeName: "numerical"
      },
      {
        name: "wspd",
        required: true,
        type: NUMERICAL_AND_TIME_TYPES,
        typeName: "numerical"
      }
    ],
    minMeasures: 0,
    maxMeasures: 0,
    measures: [],
    customColorable: false,
    allowedColorTypes: { none: true },
    aliases: {
      measures: {
        base: "Base"
      }
    }
  },
  version: 1.0,
  visible: getFeatureFlag(available_feature_flags.ENABLE_SKEWT_CHART)
}

export default skewTDefinition
