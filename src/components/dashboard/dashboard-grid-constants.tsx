// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

export const NUM_COLS = 30
export const OFFSET = 165 // fixed nav height + subnav + extra pixels for numVisibleRows to work properly
export const NUM_VISIBLE_ROWS = 2

export const getMinWidth = () =>
  getFeatureFlag(available_feature_flags.MINIMIZE_CHART_SIZE) ? 12 : 120
export const getMinHeight = () =>
  getFeatureFlag(available_feature_flags.MINIMIZE_CHART_SIZE) ? 12 : 110

/** The width of the handles used to open the filter / config UI panel, plus 4px
 * of padding */
export const DASHBOARD_CONFIG_HANDLE_WIDTH_PLUS_PADDING = 24

// Initial sizing for parameter dashboard widgets, in px
// These need to be transformed into grid units before being passed to react-grid-layout!
export const PARAMETER_WIDGET_DIMENSIONS_IN_PX = {
  h: 144,
  minH: 144,
  maxH: Infinity,
  minW: 256
}

export const PARAMETER_WIDGET_DEFAULT_WIDTH_GRID_UNITS = 10

export const PARAMETER_CONTAINER = "PARAMETER"
