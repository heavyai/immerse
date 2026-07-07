// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getColors, CHARTS_DEFAULT_COLORS } from "services/colors"
import { NUMERICAL_AND_TIME_TYPES, TEXT_TYPES } from "constants/data-types"
import { map, merge } from "ramda"
import { Y_AXIS_ORIENTATIONS } from "constants/charts"

const dimensionSettings = {
  isNotDc: true,
  minDimensions: 1,
  maxDimensions: 2,
  dimensions: [
    {
      name: "X Axis",
      required: true,
      type: NUMERICAL_AND_TIME_TYPES,
      typeName: "numerical"
    },
    {
      name: "Color",
      required: false,
      type: merge(TEXT_TYPES, { noArrays: true }),
      typeName: "string"
    }
  ],
  minMeasures: 1,
  maxMeasures: Infinity,
  measures: [
    // NOTE: yAxisOrientation is ignored here
    {
      name: "series_1",
      required: true,
      yAxisOrientation: Y_AXIS_ORIENTATIONS.LEFT
    }
  ],
  measures_proto: {
    name: "y axis",
    yAxisOrientation: Y_AXIS_ORIENTATIONS.LEFT
  },
  customColorable: true,
  defaultColors: getColors(CHARTS_DEFAULT_COLORS).line2,
  allowedColorTypes: { solid: true },
  colorTypesFromColumnType: map(() => "custom", TEXT_TYPES),
  aliases: {
    measures: { series_1: "y axis", "y axis": "y axis" }
  },
  markTypes: []
}

export default dimensionSettings
