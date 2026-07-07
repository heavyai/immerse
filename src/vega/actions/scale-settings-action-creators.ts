// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as scalesConstants from "../constants/scales-settings-action-types"
import { ColorPalette } from "../charts/types"

export const setColorDomain = (
  chartId: string,
  colorDomain: [number, number]
) => ({
  type: scalesConstants.SET_COLOR_DOMAIN,
  chartId,
  colorDomain
})

export const clearColorDomain = (chartId: string) => ({
  type: scalesConstants.CLEAR_COLOR_DOMAIN,
  chartId
})

export const setColorMeasureColorScheme = (
  chartId: string,
  colorScheme: ColorPalette
) => ({
  type: scalesConstants.SET_COLOR_MEASURE_COLOR_SCHEME,
  chartId,
  colorScheme
})

export const toggleColorMeasurePaletteReversal = (
  chartId: string,
  paletteReversed: boolean
) => ({
  type: scalesConstants.TOGGLE_REVERSE_COLOR_MEASURE_COLOR_PALETTE,
  chartId,
  paletteReversed
})

export const setColorMeasureCategoricalPalette = (
  chartId: string,
  layerId: string,
  palette: ColorPalette
) => ({
  type: scalesConstants.SET_COLOR_MEASURE_CATEGORICAL_PALETTE,
  chartId,
  layerId,
  palette
})
export const setColorDimensionCategoricalPalette = (
  chartId: string,
  layerId: string,
  palette: ColorPalette
) => ({
  type: scalesConstants.SET_COLOR_DIMENSION_CATEGORICAL_PALETTE,
  chartId,
  layerId,
  palette
})
