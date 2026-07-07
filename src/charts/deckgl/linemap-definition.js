// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LINE_GEO_TYPES, ALL_NUMERICAL_TYPES } from "constants/data-types"
import DeckGLChartDefinition from "./definition"

const deckglLinemapDefinition = {
  ...DeckGLChartDefinition,
  type: "deckgl-linemap",
  typeAlias: "DECKGL LINEMAP",
  typeConstant: "DECKGL_LINEMAP",
  dimensionSettings: () => {
    const base = DeckGLChartDefinition.dimensionSettings()
    return {
      ...base,
      // capMax: base.capMax / 10.0,
      // defaultCap: base.defaultCap / 10.0,
      minMeasures: 1,
      maxMeasures: 2,
      measures: [
        { name: "geo", required: true, type: LINE_GEO_TYPES },
        { name: "color", type: ALL_NUMERICAL_TYPES }
      ],
      aliases: {
        measures: {
          geo: "geo",
          color: "color"
        }
      }
    }
  },
  visible: false
}

export default deckglLinemapDefinition
