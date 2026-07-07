// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"

import ColorPicker from "components/ui-config-panel/ColorPaletteSection/ColorPicker"
import CustomColorsPopup from "./custom-colors-popup"

import "./custom-colors-combo-popup.scss"

export type ColorObj = {
  val: string[]
  key: string
}

interface ICustomColorsComboPopup {
  additionalColors?: string[]
  chartId?: string
  chooseColor: (c: ColorObj) => void
  chooseLineStyle?: (ls: string) => void
  hasAxisSelector?: boolean
  lineStyle?: string
  markType?: string
  measureIndex?: number
  palette: any
  selectedColor: string
  toggleYAxisOrientation?: () => void
  canDeleteColor?: boolean
}

export const CustomColorsComboPopup = ({
  additionalColors,
  chartId,
  chooseColor,
  chooseLineStyle,
  hasAxisSelector = false,
  lineStyle,
  markType,
  measureIndex,
  palette,
  selectedColor,
  toggleYAxisOrientation,
  canDeleteColor = false
}: ICustomColorsComboPopup) => {
  const [currentColor, setCurrentColor] = useState(selectedColor)
  const [currentPaletteColor, setCurrentPaletteColor] = useState(selectedColor)

  const selectColorPickerColor = (color: any): void => {
    setCurrentColor(color.hex)
    chooseColor({ val: [color.hex], key: color.hex })
  }

  const selectCurrentPaletteColor = (color: any): void => {
    const hex = color.val[0]
    setCurrentColor(hex)
    setCurrentPaletteColor(hex)
    chooseColor(color)
  }

  return (
    <div className="custom-colors-combo-popup__wrapper">
      <ColorPicker
        color={currentColor}
        canDeleteColor={canDeleteColor}
        hideDeleteColor
        onChange={selectColorPickerColor}
      />
      <CustomColorsPopup
        additionalColors={additionalColors}
        chartId={chartId}
        chooseColor={selectCurrentPaletteColor}
        chooseLineStyle={chooseLineStyle}
        hasAxisSelector={hasAxisSelector}
        measureIndex={measureIndex}
        lineStyle={lineStyle}
        markType={markType}
        palette={palette}
        selectedColor={currentPaletteColor}
        toggleYAxisOrientation={toggleYAxisOrientation}
      />
    </div>
  )
}
