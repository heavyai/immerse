// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { BACKEND_RENDERED, LAYER, GEO_MEASURE } from "constants/chart-types"
import { getColors, QUANTITATIVE_COLORS } from "services/colors"
import { RastermapChartIcon } from "./rastermap-chart-icon"

import RastermapChart from "./rastermap-chart"
import getRastermapData from "./getRastermapData"
import dimensionSettings from "./dimension-settings"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { MASTER_LAYER_SETTINGS } from "charts/raster-chart/raster-chart-consts"
const { OPACITY, ZOOM_VISIBILITY } = MASTER_LAYER_SETTINGS

const rastermapChartDefinition = {
  type: "rastermap",
  typeConstant: "RASTERMAP",
  chartDataFormatter: getRastermapData,
  chartTypeCategories: [BACKEND_RENDERED, LAYER, GEO_MEASURE],
  labelsIcons: { label: "Raster", icon: "chart-rastermap" },
  Component: RastermapChart,
  iconId: "icon-chart-rastermap",
  IconComponent: RastermapChartIcon,
  dimensionSettings,
  allowedColorTypes: { quantitative: true },
  defaultColors: {
    type: "quantitative",
    key: "mapDScale",
    val: getColors(QUANTITATIVE_COLORS).mapDScale
  },
  visible: getFeatureFlag(available_feature_flags.ENABLE_RASTERMAP_CHART),
  masterLayerSettings: [OPACITY, ZOOM_VISIBILITY]
}

export default rastermapChartDefinition
