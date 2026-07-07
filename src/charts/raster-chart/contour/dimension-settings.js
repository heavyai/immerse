// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getColors, QUANTITATIVE_COLORS } from "services/colors"
import { ALL_NUMERICAL_TYPES, GEO_POINT_TYPES } from "constants/data-types"

const contourDimensionSettings = {
  minDimensions: 2,
  maxDimensions: 2,
  dimensionTypes: GEO_POINT_TYPES,
  dimensions: [
    { name: "Lon", required: true, type: GEO_POINT_TYPES },
    { name: "Lat", required: true, type: GEO_POINT_TYPES }
  ],
  minMeasures: 1,
  maxMeasures: 1,
  measures: [{ name: "value", required: true, type: ALL_NUMERICAL_TYPES }],
  aliases: { measures: { value: "value", color: "color" } },
  customColorable: true,
  allowedColorTypes: { quantitative: true },
  defaultColors: {
    type: "quantitative",
    key: "mapDScale",
    val: getColors(QUANTITATIVE_COLORS).mapDScale
  }
}
export default contourDimensionSettings
