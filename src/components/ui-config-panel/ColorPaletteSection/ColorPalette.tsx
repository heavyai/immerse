// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import cx from "classnames"

import { SimpleColorPalette } from "components/ui-config-panel/types"

import Popover from "components/popover/popover"
import ColorPicker from "./ColorPicker"

interface Props {
  label: string
  colorPalette: SimpleColorPalette
  setColorPalette: (colorPalette: SimpleColorPalette) => void
}

const ColorPalette: FC<Props> = ({ label, colorPalette, setColorPalette }) => {
  // Whether the color modification popup is open
  const [isPopupOpen, setPopupOpen] = useState<boolean>(false)
  // The value of the text input in the popup
  const [hexValue, setHexValue] = useState<string>("")
  // Whether the value of the text input in the popup is valid
  const [isValidHex, setIsValidHex] = useState<boolean>(true)
  // The index of the color (in the palette) that is currently being edited. Gets
  // set when popup opens
  const [currentColorIndex, setCurrentColorIndex] = useState<number>(-1)

  const setColor = (index: number, color: string) => {
    const newPalette = [...colorPalette]
    newPalette[index] = color
    setColorPalette(newPalette)
  }

  const onChangeHex = (hex: string) => {
    if (hex.length === 7 && /^#[0-9A-F]{6}$/i.test(hex)) {
      setIsValidHex(true)
      setHexValue(hex)
    } else {
      setIsValidHex(false)
      setHexValue(hex)
    }
  }

  const onColorPickerChange = ({ hex }: { hex: string }) => {
    onChangeHex(hex)
    setColor(currentColorIndex, hex)
  }

  const closePopup = () => {
    setCurrentColorIndex(-1)
    setPopupOpen(false)
  }

  const editSwatch = (index: number) => {
    setCurrentColorIndex(index)
    setIsValidHex(true)
    setHexValue(colorPalette[index])
    setPopupOpen(true)
  }

  const saveColor = () => {
    if (isValidHex) {
      setColor(currentColorIndex, hexValue)
      closePopup()
    }
  }

  const deleteColor = () => {
    if (colorPalette.length > 1) {
      const newPalette = [...colorPalette]
      newPalette.splice(currentColorIndex, 1)
      setColorPalette(newPalette)
      closePopup()
    }
  }

  const addColor = () => {
    const DEFAULT_HEX = "#ffffff"

    setCurrentColorIndex(colorPalette.length)
    setHexValue(DEFAULT_HEX)
    setColor(colorPalette.length, DEFAULT_HEX)
    setIsValidHex(true)
    setPopupOpen(true)
  }

  return (
    <div className="config-ui-color-palette">
      <div className="color-palette-label">{label}</div>
      <div className="color-swatch-list">
        {colorPalette.map((hex: string, i: number) => (
          <div
            className={cx("color-swatch", {
              "currently-editing": i === currentColorIndex
            })}
            key={i}
            style={{ background: hex }}
            onClick={() => editSwatch(i)}
            data-testid={`color-palette-swatch-${hex.replace("#", "")}`}
          />
        ))}
        <div
          className="add-color-button"
          onClick={addColor}
          data-testid="color-palette-add"
        >
          +
        </div>
      </div>
      <Popover isOpened={isPopupOpen} onClose={closePopup}>
        <ColorPicker
          saveColor={saveColor}
          canDeleteColor={colorPalette.length > 2}
          deleteColor={deleteColor}
          color={hexValue}
          onChange={onColorPickerChange}
        />
      </Popover>
    </div>
  )
}

export default ColorPalette
