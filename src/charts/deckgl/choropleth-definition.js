// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { POLY_GEO_TYPES, ALL_NUMERICAL_TYPES } from "constants/data-types"

import DeckGLChartDefinition from "./definition"

const deckglChoroplethDefinition = {
  ...DeckGLChartDefinition,
  type: "deckgl-choropleth",
  typeAlias: "DECKGL CHOROPLETH",
  typeConstant: "DECKGL_CHOROPLETH",
  dimensionSettings: () => {
    const base = DeckGLChartDefinition.dimensionSettings()
    return {
      ...base,
      // capMax: base.capMax * 0.015,
      // defaultCap: base.defaultCap * 0.015,
      minMeasures: 1,
      maxMeasures: 3,
      measures: [
        { name: "geo", required: true, type: POLY_GEO_TYPES },
        { name: "color", type: ALL_NUMERICAL_TYPES },
        { name: "elevation", type: ALL_NUMERICAL_TYPES }
      ],
      aliases: {
        measures: {
          geo: "geo",
          color: "color",
          elevation: "elevation"
        }
      }
    }
  },
  visible: false
}

export default deckglChoroplethDefinition
