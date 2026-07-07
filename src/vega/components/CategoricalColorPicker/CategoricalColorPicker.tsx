// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"

import { getColorsForScheme } from "vega/charts/color-utils"

import Popover from "components/popover/popover"
import ColorSwatch from "vega/components/ColorSelectors/ColorSwatch"
import CategoricalColorPalettePopup from "./CategoricalColorPickerPopup"

import { ColorPalette } from "vega/constants/presentation-settings-types"

import "./CategoricalColorPicker.scss"

type Props = {
  selectedColorScheme: ColorPalette
  paletteReversed: boolean
  handleSelectColorScheme: (schemeName: ColorPalette) => void
  handleToggleColorScheme: (isReversed: boolean) => void
}

export const CategoricalColorPicker: FC<Props> = ({
  selectedColorScheme,
  paletteReversed,
  handleSelectColorScheme,
  handleToggleColorScheme
}) => {
  const [popupOpen, setPopupOpen] = useState(false)

  const handlePopupOpen = () => {
    setPopupOpen(true)
  }

  const handlePopupClose = () => {
    setPopupOpen(false)
  }

  const handleSelectColorSchemeAndClosePopup = (scheme: ColorPalette) => {
    handleSelectColorScheme(scheme)
    handleToggleColorScheme(false)
    setPopupOpen(false)
  }

  return (
    <div className="categorical-color-picker">
      <div className="color-picker-content">
        <ColorSwatch
          colors={getColorsForScheme(selectedColorScheme)}
          interpolate={false}
          handleSelect={handlePopupOpen}
          reverse={paletteReversed}
        />
      </div>
      <Popover isOpened={popupOpen} onClose={handlePopupClose}>
        <CategoricalColorPalettePopup
          selectedColorScheme={selectedColorScheme}
          handleSelectColorScheme={handleSelectColorSchemeAndClosePopup}
          interpolate={false}
        />
      </Popover>
    </div>
  )
}
