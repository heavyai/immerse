// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import SingleColorPicker from "vega/components/SingleColorPicker"
import { validateSixDigitHex } from "vega/components/SingleColorPicker/utils"
import CustomSlider from "components/custom-slider/custom-slider"

import "./styles.scss"

type Props = {
  validSubdivisions: [number]
  labels?: boolean

  width: number
  color: string | undefined
  colorPalette: any | undefined
  opacity: number | undefined
  onSettingsChange: (val: number, field: string) => null
}

const ContourIntervalPanel: FC<Props> = ({
  onSettingsChange,
  width,
  color,
  colorPalette,
  opacity,
  children
}) => {
  return (
    <div className="contour-interval-panel">
      <div className="chart-editor-label">Border Color</div>
      <SingleColorPicker
        selectedColor={color}
        onColorBlur={(c) => onSettingsChange(c, "borderColor")}
        colorPalette={colorPalette}
        validateColor={validateSixDigitHex}
      />

      <div className="chart-editor-label">Border Opacity</div>
      <div className="interval-settings-container">
        <CustomSlider
          defaultValue={(opacity ? opacity : 1) * 100}
          testid={`contour-border-opacity`}
          max={100}
          min={0}
          onValueChange={(val: number) => {
            const floatVal: number = parseFloat((val / 100).toFixed(2))
            onSettingsChange(floatVal, "borderOpacity")
          }}
          step={1}
        />
      </div>

      <div className="chart-editor-label">Border Width</div>
      <div className="interval-settings-container">
        <CustomSlider
          defaultValue={width}
          testid={`contour-border-slider`}
          max={5}
          min={0}
          onValueChange={(val: number) => onSettingsChange(val, "borderWidth")}
          step={0.1}
        />
      </div>
      <>{children}</>
    </div>
  )
}

export default ContourIntervalPanel
