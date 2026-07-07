// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { BACKEND_RENDERED, LAYER } from "constants/chart-types"
import { getColors, QUANTITATIVE_COLORS } from "services/colors"
import { ContourChartIcon } from "./contour-chart-icon"

import ContourChart from "./contour-chart"
import ContourChartSettings from "./chart-settings"
import getContourData from "./getContourData"
import dimensionSettings from "./dimension-settings"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { MASTER_LAYER_SETTINGS } from "charts/raster-chart/raster-chart-consts"
const { ZOOM_VISIBILITY } = MASTER_LAYER_SETTINGS

const contourChartDefinition = {
  type: "contour",
  typeConstant: "CONTOUR",
  chartDataFormatter: getContourData,
  chartTypeCategories: [BACKEND_RENDERED, LAYER],
  labelsIcons: { label: "Contour", icon: "chart-contour" },
  Component: ContourChart,
  iconId: "icon-chart-contour",
  IconComponent: ContourChartIcon,
  ChartSettingsComponent: ContourChartSettings,
  dimensionSettings,
  allowedColorTypes: { quantitative: true },
  defaultColors: {
    type: "quantitative",
    key: "mapDScale",
    val: getColors(QUANTITATIVE_COLORS).mapDScale
  },
  visible: getFeatureFlag(available_feature_flags.ENABLE_CONTOUR_CHART),
  masterLayerSettings: [ZOOM_VISIBILITY]
}

export default contourChartDefinition
