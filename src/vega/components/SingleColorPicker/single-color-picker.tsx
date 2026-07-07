// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect, ChangeEvent } from "react"
import cx from "classnames"

import { OmniColorSchemes } from "services/colors"

import Popover from "components/popover/popover"
import SwatchPopup from "../SwatchPopup/swatch-popup"
import { validateHex } from "./utils"

import "./single-color-picker.scss"

interface Props {
  selectedColor: string
  onColorChange?: (markColor: string) => void
  onColorBlur?: (markColor: string) => void
  colorPalette: OmniColorSchemes["solid"]
  validateColor?: (hex: string) => boolean
}

const SingleColorPicker: FC<Props> = ({
  selectedColor,
  onColorChange = () => {},
  onColorBlur = () => {},
  colorPalette,
  validateColor = validateHex
}) => {
  const [isPopupOpen, setPopupOpen] = useState(false)
  const [textInputValue, setTextInputValue] = useState(selectedColor)
  const [isValidHex, setValidHex] = useState(true)

  useEffect(() => {
    const isValidInput = validateColor(textInputValue)
    setValidHex(isValidInput)
    if (isValidInput) {
      onColorChange(textInputValue)
    }
  }, [textInputValue, validateColor, onColorChange])

  useEffect(() => {
    setTextInputValue(selectedColor)
  }, [selectedColor])

  const closePopup = () => {
    setPopupOpen(false)
  }

  const openPopup = () => {
    setPopupOpen(true)
  }

  const handleSelectColor = (color: string) => {
    setValidHex(true)
    setTextInputValue(color)
    onColorChange(color)
    onColorBlur(color)
    closePopup()
  }

  const onTextInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTextInputValue(e.target.value)
  }

  const onTextInputBlur = () => {
    if (isValidHex) {
      onColorBlur(textInputValue)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
  }

  const hexInputClassnames = cx("color-picker-hex-input", {
    invalid: !isValidHex
  })

  return (
    <div className="single-color-picker">
      <div className="color-picker-content">
        <div
          className="color-picker-swatch"
          onClick={openPopup}
          style={{ background: isValidHex ? textInputValue : "#FFFFFF" }}
        >
          <div className="color-picker-arrow" />
        </div>
        <div className="color-picker-hex">
          <input
            className={hexInputClassnames}
            value={textInputValue}
            onChange={onTextInputChange}
            onBlur={onTextInputBlur}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
      <Popover isOpened={isPopupOpen} onClose={closePopup}>
        <SwatchPopup
          colors={colorPalette}
          selectedColor={selectedColor}
          onSelectColor={handleSelectColor}
        />
      </Popover>
    </div>
  )
}

export default SingleColorPicker
