// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

const { COLOR_MEASURE_CATEGORY_SIZE } = available_feature_flags

export const CHART_EDITOR_HEIGHT_OFFSET = 200
export const CHART_EDITOR_WIDTH_OFFSET = 640
export const COLOR_MAX_LENGTH = 9
export const CUSTOM_MEASURE_VALUE = "*CustomMeasure*"
export const CUSTOM_DIMENSION_VALUE = "*CustomDimension*"
export const DOWN_ARROW_KEY_NUM = 40
export const ENTER_KEY_NUM = 13
export const ESCAPE_KEY = 27
export const HOVER_DEBOUNCE_MS = 500
export const MAP_COLOR_LIST = [
  "blue",
  "#d23728",
  "green",
  "orange",
  "yellow",
  "brown",
  "violet",
  "brown",
  "white"
]
export const MAP_UPDATE_DEBOUNCE = 750 // ms
export const MAX_BIN_SIZE = 250
export const COLUMN_CARDINALITY_THRESHOLD = 500
export const MIN_SAVE_DASHBOARD_SPINNER_DURATION = 500
export const MS_IN_HALF_SECONDS = 500
export const MS_IN_SECONDS = 1000
export const NEGATIVE_ONE = -1
export const NUM_DASHBOARD_COLUMNS = 3
export const PIE_EXTERNAL_RADIUS_PADDING = 32
export const PIE_INNER_RADIUS_MULTIPLIER = 0.2
export const RESIZE_DEBOUNCE_MS = 400
export const SLIDER_MAX = 100
export const SLIDER_MIN = 1
export const SUBROWS_PER_VISIBLE_ROW = getFeatureFlag(
  available_feature_flags.MINIMIZE_CHART_SIZE
)
  ? 100
  : 10
export const TABLE_SIZE = 50
export const TRANSITION_DURATION = 500 // ms
export const UP_ARROW_KEY_NUM = 38
export const TOP_BAR_HEIGHT = 48 // Only used to position data selector tooltip...
export const TIME_FORMAT = "HH:mm:ss.SSS"
export const DATETIME_FORMAT = `YYYY-MM-DD ${TIME_FORMAT}`
export const DATETIME_DISPLAY_FORMAT = "MM/DD/YYYY HH:mm:ss.SSS"
export const DATE_DISPLAY_FORMAT = "MM/DD/YYYY"
export const TIME_DISPLAY_FORMAT = "HH:mm:ss.SSS"
export const NULLS_FIRST = " NULLS FIRST"
export const NULLS_LAST = " NULLS LAST"

// ------------ POINT MAP SPECIFIC ---------------
export const SIZE_RANGE_DEFAULTS = [3, 10]
export const SIZE_DOMAIN_DEFAULTS = [10000, 0]
export const SIZE_RANGE_MAX = 30
export const NUM_DEFAULT_CATEGORIES = getFeatureFlag(
  COLOR_MEASURE_CATEGORY_SIZE
)
export const LON_MIN = -180
export const LON_MAX = 180
export const LAT_MIN = -90
export const LAT_MAX = 90
export const AUTOSIZE_DOMAIN_DEFAULTS = [100000, 0]
export const AUTOSIZE_RANGE_DEFAULTS = [2.0, 5.0]
export const AUTOSIZE_RANGE_MININUM = [1, 1]
export const SIZING_THRESHOLD_FOR_AUTOSIZE_RANGE_MININUM = 1500000
export const DEFAULT_POINT_MARK_SHAPE = "circle"
export const DEFAULT_POINT_ORIENTATION_MARK_SHAPE = "wedge"

// ------------ LINE MAP SPECIFIC ---------------
export const STROKE_WIDTH_RANGE_DEFAULTS = [1, 3]
export const STROKE_RANGE_MAX = 50

// ------------ MAPBOX UTILITIES ---------------
export const MAPBOX_BBOX_PADDING = 0.05
export const MAPBOX_LON_MIN = -179.99999
export const MAPBOX_LON_MAX = 179.99999
export const MAPBOX_LAT_MIN = -84.99999
export const MAPBOX_LAT_MAX = 84.99999

// -------------EDITABLE INPUT BOX ----------------
export const LETTER_PIXEL_SIZE = 8.5
export const MIN_INPUT_BOX_SIZE = 120

export const GTM = {
  os: "GTM-MDFLXPR",
  ce: "GTM-MMGJMHG",
  ee: "GTM-MBFCLM",
  default: "GTM-MDFLXPR"
}

export const MAX_PIXEL_BIN_SIZE = 30

export const DEFAULT_GEOHEAT_PIXEL_SIZE = 10
export const DEFAULT_GEOHEAT_MARK = "hex"

export const GEOHEAT_DEFAULT_OPACITY = 0.5
export const POINT_DEFAULT_OPACITY = 0.85

export const DEFAULT_STROKEWIDTH = 2

export function layerDefaultOpacity(layerType) {
  switch (layerType) {
    case "deckgl-geoheat":
    case "geoheat":
      return GEOHEAT_DEFAULT_OPACITY
    case "deckgl":
    case "deckgl-pointmap":
    case "deckgl-linemap":
    case "deckgl-choropleth":
    case "pointmap":
    case "backendScatter":
    case "backendChoropleth":
    case "linemap":
      return POINT_DEFAULT_OPACITY
    default:
      return 1
  }
}
