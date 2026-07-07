// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as scalesConstants from "../constants/scales-settings-action-types"
import { ChartsState } from "../charts/types"
import produce from "immer"
import { getLayerIndex } from "vega/utils/data-selection"
import { HEAVYAI_TOPN_COLORS } from "services/colors"
import { buildDefaultCustomizableTopNOptions } from "vega/charts/top-n-utils"
import { isBaseDimCategoricalColoringChart } from "reducers/charts/helpers/color-helpers"

export default {
  [scalesConstants.SET_COLOR_DOMAIN](
    state: ChartsState,
    { chartId, colorDomain }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        scales: {
          ...state[chartId].scales,
          colorMeasure: {
            ...state[chartId].scales.colorMeasure,
            domain: colorDomain
          }
        }
      }
    }
  },

  [scalesConstants.CLEAR_COLOR_DOMAIN](state: ChartsState, { chartId }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        scales: {
          ...state[chartId].scales,
          colorMeasure: {
            ...state[chartId].scales.colorMeasure,
            domain: null
          }
        }
      }
    }
  },

  [scalesConstants.SET_COLOR_MEASURE_COLOR_SCHEME](
    state: ChartsState,
    { chartId, colorScheme }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        scales: {
          ...state[chartId].scales,
          colorMeasure: {
            ...state[chartId].scales.colorMeasure,
            palette: colorScheme
          }
        }
      }
    }
  },

  [scalesConstants.TOGGLE_REVERSE_COLOR_MEASURE_COLOR_PALETTE](
    state: ChartsState,
    { chartId, paletteReversed }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        scales: {
          ...state[chartId].scales,
          colorMeasure: {
            ...state[chartId].scales.colorMeasure,
            paletteReversed
          }
        }
      }
    }
  },

  [scalesConstants.SET_COLOR_MEASURE_CATEGORICAL_PALETTE]: produce(
    (state: ChartsState, { chartId, layerId, palette }) => {
      const dataSelections = state[chartId].dataSelections
      const layerIndex = getLayerIndex(dataSelections, layerId)
      const dataSelection = dataSelections[layerIndex]
      if (!dataSelection.measureTopNOptions) {
        dataSelection.measureTopNOptions = buildDefaultCustomizableTopNOptions(
          dataSelection.table,
          layerIndex
        )
      }
      const measureOptions = dataSelection.measureTopNOptions

      if (measureOptions) {
        dataSelection.measures.color.paletteMappingId = null
        measureOptions.dynamicValues = []
        measureOptions.palette = palette
      }
    }
  ),

  [scalesConstants.SET_COLOR_DIMENSION_CATEGORICAL_PALETTE]: produce(
    (state: ChartsState, { chartId, layerId, palette }) => {
      const chart = state[chartId]
      const dataSelections = chart.dataSelections
      const layerIndex = getLayerIndex(dataSelections, layerId)
      const dataSelection = dataSelections[layerIndex]
      const topNOptions = dataSelection.topNoptions

      if (topNOptions) {
        if (
          isBaseDimCategoricalColoringChart(chart.type) &&
          !dataSelection.dimensions.color
        ) {
          dataSelection.paletteMappingId = null
        } else {
          dataSelection.dimensions.color.paletteMappingId = null
        }
        topNOptions.dynamicValues = []
        // Reset top color as well as any dynamic values set
        topNOptions.allOthers.color = HEAVYAI_TOPN_COLORS.allOthers
        topNOptions.palette = palette
      }
    }
  )
}
