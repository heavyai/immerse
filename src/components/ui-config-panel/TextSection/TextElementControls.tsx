// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect } from "react"
import cx from "classnames"

import { TextElement, TextConfigTypes, TextConfigStyles } from "../types"

import {
  STYLE_PROPERTY_FONT_WEIGHT,
  STYLE_PROPERTY_FONT_SIZE,
  FONT_INCREMENT_VALUE,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  UI_CONFIG_TEXT_CONSTANTS,
  formatStyleValue
} from "../constants"

interface TextElementControlsProps {
  elementKey: TextElement
  incrementFontSize: (elementKey: TextElement, increment: number) => void
  toggleFontWeight: (elementKey: TextElement) => void
  styles: TextConfigStyles
}

export const TextElementControls: FC<TextElementControlsProps> = ({
  elementKey,
  incrementFontSize,
  toggleFontWeight,
  styles
}) => {
  const [isMinDisabled, setIsMinDisabled] = useState<boolean>(false)
  const [isMaxDisabled, setIsMaxDisabled] = useState<boolean>(false)

  useEffect(() => {
    setIsMinDisabled(styles[STYLE_PROPERTY_FONT_SIZE] === FONT_SIZE_MIN)
    setIsMaxDisabled(styles[STYLE_PROPERTY_FONT_SIZE] === FONT_SIZE_MAX)
  }, [styles])

  const elementSettings = UI_CONFIG_TEXT_CONSTANTS[elementKey]

  const styleNames = Object.keys(styles) as TextConfigTypes[]
  const labelStyles = styleNames.reduce(
    (elementStyle, styleProperty: TextConfigTypes) => {
      elementStyle[styleProperty] = formatStyleValue[styleProperty](
        styles[styleProperty]
      ) as string
      return elementStyle
    },
    {}
  )

  return (
    <li className="ui-config__font-style">
      <span style={labelStyles}>{elementSettings.label}</span>

      <div className="ui-config__font-style__controls">
        <span
          className={cx("ui-config__font-style__control", {
            "is-disabled": isMinDisabled
          })}
          onClick={() => {
            if (!isMinDisabled) {
              incrementFontSize(elementKey, -1 * FONT_INCREMENT_VALUE)
            }
          }}
          data-testid={`${elementKey}-font-decrease`}
        >
          A<sup>—</sup>
        </span>

        <span
          className={cx("ui-config__font-style__control", {
            "is-disabled": isMaxDisabled
          })}
          onClick={() => {
            if (!isMaxDisabled) {
              incrementFontSize(elementKey, FONT_INCREMENT_VALUE)
            }
          }}
          data-testid={`${elementKey}-font-increase`}
        >
          A<sup>+</sup>
        </span>

        <span
          className="ui-config__font-style__control"
          onClick={() => toggleFontWeight(elementKey)}
          data-testid={`${elementKey}-font-bold`}
        >
          {styles[STYLE_PROPERTY_FONT_WEIGHT] === "bold" ? (
            <strong>Bold</strong>
          ) : (
            "Bold"
          )}
        </span>
      </div>
    </li>
  )
}
