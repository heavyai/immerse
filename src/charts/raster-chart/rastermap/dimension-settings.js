// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getColors, QUANTITATIVE_COLORS } from "services/colors"
import { ALL_NUMERICAL_TYPES, GEO_POINT_TYPES } from "constants/data-types"

const rastermapDimensionSettings = {
  minDimensions: 0,
  maxDimensions: 0,
  dimensionTypes: {},
  dimensions: [],
  minMeasures: 3,
  maxMeasures: 3,
  measures: [
    { name: "x", required: true, type: GEO_POINT_TYPES },
    { name: "y", required: true, type: GEO_POINT_TYPES },
    { name: "color", required: true, type: ALL_NUMERICAL_TYPES }
  ],
  aliases: {
    measures: {
      x: "Lon",
      y: "Lat",
      color: "color"
    }
  },
  customColorable: true,
  allowedColorTypes: { quantitative: true },
  defaultColors: {
    type: "quantitative",
    key: "mapDScale",
    val: getColors(QUANTITATIVE_COLORS).mapDScale
  }
}
export default rastermapDimensionSettings
