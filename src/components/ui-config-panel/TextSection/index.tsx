// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import {
  STYLE_PROPERTY_FONT_SIZE,
  STYLE_PROPERTY_FONT_WEIGHT,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  databaseTextStyleKeys
} from "../constants"

import { TextElement, FontWeight, UserConfig } from "../types"

import { TextElementControls } from "./TextElementControls"
import { Switch } from "widgets/switch/Switch"

interface Props {
  textStyles: UserConfig["text"]
  setTextSettings: (textSettings: UserConfig["text"]) => void
  highContrastFontColors: boolean
  setHighContrastFontColors: (enabled: boolean) => void
}

const TextSection: FC<Props> = ({
  textStyles,
  setTextSettings,
  highContrastFontColors,
  setHighContrastFontColors
}) => {
  const incrementFontSize = (elementKey: TextElement, increment: number) => {
    const prevStyle = textStyles[elementKey]
    const nextValue = prevStyle[STYLE_PROPERTY_FONT_SIZE] + increment

    setTextSettings({
      ...textStyles,
      [elementKey]: {
        ...prevStyle,
        [STYLE_PROPERTY_FONT_SIZE]: Math.min(
          FONT_SIZE_MAX,
          Math.max(FONT_SIZE_MIN, nextValue)
        )
      }
    })
  }

  const toggleFontWeight = (elementKey: TextElement) => {
    const currentFontWeight = textStyles[elementKey][STYLE_PROPERTY_FONT_WEIGHT]
    const newFontWeight: FontWeight =
      currentFontWeight === "bold" ? "normal" : "bold"

    setTextSettings({
      ...textStyles,
      [elementKey]: {
        ...textStyles[elementKey],
        [STYLE_PROPERTY_FONT_WEIGHT]: newFontWeight
      }
    })
  }

  const toggleHighContrastFontColors = () => {
    setHighContrastFontColors(!highContrastFontColors)
  }

  return (
    <ul className="ui-config__font-styles">
      {databaseTextStyleKeys.map(
        (elementKey) =>
          textStyles[elementKey] && (
            <TextElementControls
              key={`element-settings-${elementKey}`}
              elementKey={elementKey}
              incrementFontSize={incrementFontSize}
              toggleFontWeight={toggleFontWeight}
              styles={textStyles[elementKey]}
            />
          )
      )}
      <div className="switch-with-label">
        <div>Use high contrast font colors</div>
        <Switch
          className="high-contrast-switch"
          data-testid="toggle-high-contrast-colors"
          checked={highContrastFontColors}
          onChange={toggleHighContrastFontColors}
        />
      </div>
    </ul>
  )
}

export default TextSection
