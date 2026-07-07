// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChartTypes } from "components/sql-notebook/types"

// Viewport settings
export const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 1,
  pitch: 0,
  bearing: 0
}
export const DEFAULT_BASEMAP = "mapbox://styles/mapbox/dark-v9"
export const DEFAULT_POINT_SIZE = 3
export const DEFAULT_SIZE_RANGE = [3, 8]
export const DEFAULT_LINE_WIDTH = 2
export const DEFAULT_LINE_RANGE = [2, 6]

export enum LAYER_TYPE {
  POINT = "POINT",
  POLYGON = "POLYGON",
  LINE = "LINE"
}

export const GEO_CHART_TYPES = [
  ChartTypes.POINT_MAP,
  ChartTypes.LINE_MAP,
  ChartTypes.POLYGON_MAP
]
