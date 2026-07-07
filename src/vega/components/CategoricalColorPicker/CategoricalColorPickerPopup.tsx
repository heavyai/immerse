// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import { getColors, ORDINAL_COLORS, SOLID_COLORS } from "services/colors"
import { ColorPalette } from "vega/charts/types"

import ColorSchemePopupSwatchGroup from "vega/components/ColorSelectors/ColorSchemePopupSwatchGroup"

type Props = {
  selectedColorScheme: ColorPalette
  handleSelectColorScheme: (schemeName: ColorPalette) => void
  interpolate?: boolean
}

const ColorSchemePopup: FC<Props> = ({
  selectedColorScheme,
  handleSelectColorScheme,
  interpolate = true
}) => (
  <div className="color-picker-popup">
    <ColorSchemePopupSwatchGroup
      title="Solid Colors"
      type="solid"
      interpolate={interpolate}
      schemes={getColors(SOLID_COLORS)}
      selectedColorScheme={selectedColorScheme}
      handleSelectColorScheme={handleSelectColorScheme}
    />
    <ColorSchemePopupSwatchGroup
      title="Categorical Scale"
      type="ordinal"
      interpolate={interpolate}
      schemes={getColors(ORDINAL_COLORS)}
      selectedColorScheme={selectedColorScheme}
      handleSelectColorScheme={handleSelectColorScheme}
    />
  </div>
)

export default ColorSchemePopup
