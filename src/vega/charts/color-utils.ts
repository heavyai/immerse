// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  DEFAULT_CATEGORICAL_PALETTE,
  COLOR_PALETTE_TYPES
} from "constants/colors"
import {
  getColors,
  ORDINAL_COLORS,
  SOLID_COLORS,
  QUANTITATIVE_COLORS,
  OmniColorScheme
} from "services/colors"
import { ColorPalette } from "vega/charts/types"

const colorSchemeMap: Record<string, OmniColorScheme> = {
  ordinal: ORDINAL_COLORS,
  solid: SOLID_COLORS,
  quantitative: QUANTITATIVE_COLORS
}

export const validColorSchemes = new Set(Object.keys(colorSchemeMap))

const getColorMap = (
  type: "ordinal" | "solid" | "quantitative"
): Record<string, string[]> => {
  if (!colorSchemeMap[type]) {
    throw new Error(`Unsupported color scheme type: ${type}`)
  }

  return getColors(colorSchemeMap[type])
}

export const getColorsForScheme = (
  scheme: ColorPalette = {
    name: DEFAULT_CATEGORICAL_PALETTE,
    type: "ordinal"
  }
): string[] => {
  // roundabout way to retrieve getColors(ORDINAL_COLORS)
  const palettes = getColorMap(scheme.type)
  const colors = palettes[scheme.name] ?? palettes[scheme.key]

  // If the palette is not found, show an error in the console and fall back to
  // an existing palette. Palettes may have been removed via the UI config panel
  // or through servers.json whitelabeling
  if (!colors) {
    // eslint-disable-next-line no-console
    console.error(`Color scheme not found: ${JSON.stringify(scheme)}`)
    const defaultPaletteKey = Object.keys(palettes)[0]
    if (defaultPaletteKey) {
      return palettes[defaultPaletteKey]
    }
  }

  return colors
}
export const getOrdinalOrSolidPalette = (
  key: string = DEFAULT_CATEGORICAL_PALETTE,
  type: string = COLOR_PALETTE_TYPES.ORDINAL
) => {
  if (type === COLOR_PALETTE_TYPES.SOLID) {
    return getColors(SOLID_COLORS)[key]
  } else {
    return (
      getColors(ORDINAL_COLORS)[key] ??
      Object.values(getColors(ORDINAL_COLORS))[0]
    )
  }
}
