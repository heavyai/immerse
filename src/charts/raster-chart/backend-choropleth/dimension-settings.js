// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getColors, CHARTS_DEFAULT_COLORS } from "services/colors"
import {
  ALL_NUMERICAL_TYPES,
  NUMERICAL_AND_TIME_TYPES,
  POLY_GEO_TYPES,
  TEXT_TYPES
} from "constants/data-types"
import { map, merge } from "ramda"

import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

const backendChoroplethDimensionSettings = {
  capMin: 1,
  capMax: getFeatureFlag(available_feature_flags.CHOROPLETH_MAX_POLYGONS),
  defaultCap: getFeatureFlag(
    available_feature_flags.CHOROPLETH_DEFAULT_POLYGONS
  ),
  minDimensions: 0,
  maxDimensions: 1,
  dimensions: [{ name: "join", required: false }],
  dimensionTypes: merge(
    merge(TEXT_TYPES, { noArrays: true }),
    ALL_NUMERICAL_TYPES
  ),
  minMeasures: 1,
  maxMeasures: 2,
  measures: [
    {
      name: "geo",
      required: true,
      type: POLY_GEO_TYPES,
      includeJoinDataSources: true
    },
    {
      name: "color",
      type: merge(NUMERICAL_AND_TIME_TYPES, TEXT_TYPES),
      required: false
    }
  ],
  customColorable: true,
  defaultColors: getColors(CHARTS_DEFAULT_COLORS).backendChoropleth,
  allowedColorTypes: { solid: true },
  colorTypesFromColumnType: merge(
    map(() => "quantitative", NUMERICAL_AND_TIME_TYPES),
    map(() => "custom", TEXT_TYPES)
  ),
  aliases: { measures: { color: "color", geo: "geo" } }
}
export default backendChoroplethDimensionSettings
