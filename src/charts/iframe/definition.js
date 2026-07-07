// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { NOT_BE_RENDERED } from "constants/chart-types"

import IFrameChart from "./chart"
import IFrameChartSettings from "./chart-settings"
import getIFrameData from "./getIFrameData"

import { defaultGetColumnKey } from "components/chart-container-header/export-chart-data"

import {
  setExternalConfig,
  setExternalConfigSchema
} from "./api/setExternalConfig"
import {
  getExternalConfig,
  getExternalConfigSchema
} from "./api/getExternalConfig"
import {
  registerForExternalConfigNotifications,
  unregisterForExternalConfigNotifications,
  registerForExternalConfigNotificationsSchema,
  unregisterForExternalConfigNotificationsSchema
} from "./api/registerForExternalConfigNotifications"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import { getChartAddonTypes } from "chart-addons/chart-addon-registry"
const { CHART_ADDON_EXPORT_AS_IMAGE } = getChartAddonTypes()

const iframeChartDefinition = {
  type: "iframe",
  typeAlias: "IFRAME",
  typeConstant: "IFRAME",
  chartDataFormatter: getIFrameData,
  externalAPI: {
    setExternalConfig,
    getExternalConfig,
    registerForExternalConfigNotifications,
    unregisterForExternalConfigNotifications
  },
  externalAPISchema: {
    setExternalConfig: setExternalConfigSchema,
    getExternalConfig: getExternalConfigSchema,
    registerForExternalConfigNotifications: registerForExternalConfigNotificationsSchema,
    unregisterForExternalConfigNotifications: unregisterForExternalConfigNotificationsSchema
  },
  chartTypeCategories: [NOT_BE_RENDERED],
  labelsIcons: { label: "iFrame", icon: "chart-iframe" },
  Component: IFrameChart,
  iconId: "icon-chart-iframe",
  exportChartData: {
    getChartData: (chart) => chart.data,
    getColumnKey: (column, columnIndex, groupType) => {
      if (groupType === "measure") {
        return `measure${columnIndex}`
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
  IconComponent: function IFrameIconComponent() {
    return (
      <g transform="scale(1,1) translate(0,7)">
        <path
          d="M48,6c-0,-3.311 -2.689,-6 -6,-6l-36,0c-3.311,0 -6,2.689 -6,6l0,21.982c0,3.312 2.689,6 6,6l36,0c3.311,0 6,-2.688 6,-6l-0,-21.982Zm-4,0l-0,21.982c-0,1.104 -0.896,2 -2,2l-36,0c-1.104,0 -2,-0.896 -2,-2l0,-21.982c0,-1.104 0.896,-2 2,-2l36,0c1.104,0 2,0.896 2,2Z"
          stroke="none"
          fill="currentColor"
        />
        <path
          d="M0,8.728l48,0"
          stroke="currentColor"
          strokeWidth="4%"
          fill="none"
        />
        <path
          d="M16.035,12.743l-7.327,7.328l7.327,7.327"
          stroke="currentColor"
          strokeWidth="4%"
          fill="none"
        />
        <path
          d="M32.602,12.743l7.327,7.328l-7.327,7.327"
          stroke="currentColor"
          strokeWidth="4%"
          fill="none"
        />
        <path
          d="M28.791,11.738l-6.584,16.142"
          stroke="currentColor"
          strokeWidth="4%"
          fill="none"
        />
      </g>
    )
  },
  initialChartData: { isNotDc: true },
  ChartSettingsComponent: IFrameChartSettings,
  defaultColors: { type: "none" },
  dimensionSettings: {
    isNotDc: true,
    minDimensions: 0,
    maxDimensions: Infinity,
    dimensions: [{ name: null }],
    minMeasures: 0,
    maxMeasures: Infinity,
    measures: [{ name: null }],
    customColorable: false,
    allowedColorTypes: { none: true },
    defaultColors: { type: "none" }
  },
  disableAddons: [CHART_ADDON_EXPORT_AS_IMAGE],
  visible: getFeatureFlag(available_feature_flags.ENABLE_IFRAME_CHART)
}

export default iframeChartDefinition
