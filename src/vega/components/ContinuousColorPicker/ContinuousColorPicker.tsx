// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"

import { getColorsForScheme } from "vega/charts/color-utils"

import Popover from "components/popover/popover"
import ColorSwatch from "vega/components/ColorSelectors/ColorSwatch"
import ContinuousColorPalettePopup from "./ContinuousColorPickerPopup"
import ReverseColorGradientIcon from "components/svg-icons/icon-reverse-color-gradient"

import { QuantitativeColorPalette } from "vega/constants/presentation-settings-types"

import "./ContinuousColorPicker.scss"

type Props = {
  selectedColorScheme: QuantitativeColorPalette
  paletteReversed: boolean
  handleSelectColorScheme: (schemeName: QuantitativeColorPalette) => void
  handleToggleColorScheme: (isReversed: boolean) => void
}

const ContinuousColorPicker: FC<Props> = ({
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

  const handleSelectColorSchemeAndClosePopup = (
    scheme: QuantitativeColorPalette
  ) => {
    handleSelectColorScheme(scheme)
    handleToggleColorScheme(false)
    setPopupOpen(false)
  }

  return (
    <div className="continuous-color-picker">
      <div className="color-picker-content">
        <ColorSwatch
          colors={getColorsForScheme(selectedColorScheme)}
          interpolate
          handleSelect={handlePopupOpen}
          reverse={paletteReversed}
        />
        <div
          className="color-picker-reverse-icon"
          onClick={() => handleToggleColorScheme(!paletteReversed)}
        >
          <ReverseColorGradientIcon />
        </div>
      </div>
      <Popover isOpened={popupOpen} onClose={handlePopupClose}>
        <ContinuousColorPalettePopup
          selectedColorScheme={selectedColorScheme}
          handleSelectColorScheme={handleSelectColorSchemeAndClosePopup}
        />
      </Popover>
    </div>
  )
}

export default ContinuousColorPicker
