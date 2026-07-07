// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { CustomPicker } from "react-color"
import { Hue, Saturation } from "react-color/lib/components/common"

import "./color-picker.scss"

/**
 * ColorPicker properties.
 */
export interface IHSColorPickerProps {
  hsl?: any
  onChange: any
}

/**
 * HSColorPicker
 */

const HSColorPicker = (props: IHSColorPickerProps) => {
  return (
    <div className="hs-color-picker-container">
      <div className="h-color-picker-container">
        <Hue {...props} />
      </div>
      <div className="s-color-picker-container">
        <Saturation {...props} />
      </div>
    </div>
  )
}

export const HueSaturationColorPicker = CustomPicker(HSColorPicker)
