// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { CustomPicker } from "react-color"
import {
  EditableInput,
  Hue,
  Saturation
} from "react-color/lib/components/common"
import { Tooltip } from "@rmwc/tooltip"

import "./ColorPicker.scss"

export interface IColorPickerProps {
  color?: any
  canDeleteColor: boolean
  onChange: any
  hideDeleteColor?: boolean
}

const ColorPicker = (props: IColorPickerProps) => (
  <div className="color-palette-picker" data-testid="color-palette-popup">
    <div className="color-palette-picker__saturation">
      <Saturation {...props} />
    </div>
    <section>
      <span
        className="color-palette-picker__value"
        style={{ background: props.color }}
      />
      <div className="color-palette-picker__hue">
        <Hue {...props} />
      </div>
    </section>
    <section>
      <div
        className="color-palette-picker__input"
        data-testid="color-palette-input"
      >
        <EditableInput value={props.color} {...props} />
      </div>
      {props.canDeleteColor && (
        <span
          className="color-palette-picker__delete"
          onClick={props.deleteColor}
          data-testid="color-palette-swatch-delete"
        >
          Delete swatch
        </span>
      )}
      {!props.hideDeleteColor && !props.canDeleteColor && (
        <Tooltip
          content="Color palettes have a minimum of 2 colors"
          enterDelay={500}
        >
          <span className="color-palette-picker__delete is-disabled">
            Delete swatch
          </span>
        </Tooltip>
      )}
    </section>
  </div>
)

export default CustomPicker(ColorPicker)
