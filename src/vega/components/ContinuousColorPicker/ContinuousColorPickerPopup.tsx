// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import { getColors, QUANTITATIVE_COLORS } from "services/colors"

import ColorSchemePopupSwatchGroup from "vega/components/ColorSelectors/ColorSchemePopupSwatchGroup"
import { QuantitativeColorPalette } from "vega/constants/presentation-settings-types"

type Props = {
  selectedColorScheme: QuantitativeColorPalette
  handleSelectColorScheme: (schemeName: QuantitativeColorPalette) => void
}

const ColorSchemePopup: FC<Props> = ({
  selectedColorScheme,
  handleSelectColorScheme
}) => (
  <div className="color-picker-popup">
    <ColorSchemePopupSwatchGroup
      title="Quantitative Scale"
      type="quantitative"
      interpolate
      schemes={getColors(QUANTITATIVE_COLORS)}
      selectedColorScheme={selectedColorScheme}
      handleSelectColorScheme={handleSelectColorScheme}
    />
  </div>
)

export default ColorSchemePopup
