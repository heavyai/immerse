// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ALL_NUMERICAL_TYPES, GEO_POINT_TYPES } from "constants/data-types"

import DeckGLChartDefinition from "./definition"

const deckglPointmapDefinition = {
  ...DeckGLChartDefinition,
  type: "deckgl-geoheat",
  typeAlias: "DECKGL GEOHEAT",
  typeConstant: "DECKGL_GEOHEAT",
  dimensionSettings: () => {
    const base = DeckGLChartDefinition.dimensionSettings()
    return {
      ...base,
      minDimensions: 2,
      maxDimensions: 2,
      dimensionTypes: GEO_POINT_TYPES,
      dimensions: [
        { name: "Lon", required: true, type: GEO_POINT_TYPES },
        { name: "Lat", required: true, type: GEO_POINT_TYPES }
      ],
      minMeasures: 1,
      maxMeasures: 1,
      measures: [{ name: "color", required: true, type: ALL_NUMERICAL_TYPES }],
      aliases: {
        measures: {
          color: "color"
        }
      }
    }
  },
  visible: false
}

export default deckglPointmapDefinition
