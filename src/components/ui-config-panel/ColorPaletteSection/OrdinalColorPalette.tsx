// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect } from "react"
import cx from "classnames"
import { Icon } from "@rmwc/icon"

import Popover from "components/popover/popover"
import ColorPicker from "./ColorPicker"
import { NestedColorPalette } from "components/ui-config-panel/types"

import { MAX_NUM_CATEGORICAL_SWATCHES } from "components/ui-config-panel/constants"

/**
 * Ordinal color palette editor
 *
 * Ordinal color palettes are generally seen in charts where you need
 * alternating colors to distinguish different pieces of data, like in bar or
 * pie chart. They appear as a collection of swatches in color pickers around
 * Immerse. They are represented by an array of string arrays, like:
 *
 * [
 *  ["#ffffff", "#000000"],
 *  ["#ffff00", "#00fffff"]
 * ]
 *
 * Therefore, this color picker is a bit more complex than the simpler
 * ColorPalette, in that we have to allow the user to select which palette to
 * edit, and then allow the user the ability to edit colors within that palette.
 */

interface Props {
  label: string
  // The current group of ordinal color palettes
  colorPalettes: NestedColorPalette
  // Sets all ordinal color palettes
  setColorPalettes: (colorPalette: NestedColorPalette) => void
}

const OrdinalColorPalette: FC<Props> = ({
  label,
  colorPalettes,
  setColorPalettes
}) => {
  // The index of the ordinal palette currently being edtied
  const [currentPaletteIndex, setCurrentPaletteIndex] = useState<number>(0)
  // Whether the palette (gradient) popup is open
  const [isPalettePopupOpen, setPalettePopupOpen] = useState<boolean>(false)
  // Whether the individual color popup is open
  const [isColorPopupOpen, setColorPopupOpen] = useState<boolean>(false)
  // The value of the text input in the color popup
  const [hexValue, setHexValue] = useState<string>("")
  // Whether the value of the text input in the popup is valid
  const [isValidHex, setIsValidHex] = useState<boolean>(true)
  // The index of the color (in the current palette) that is currently being
  // edited. Value is set when popup opens and closes.
  const [currentColorIndex, setCurrentColorIndex] = useState<number>(-1)

  // The color palette the user is currently editing
  const selectedColorPalette = colorPalettes[currentPaletteIndex] || []

  const onChangeHex = (hex: string) => {
    if (hex.length === 7 && /^#[0-9A-F]{6}$/i.test(hex)) {
      setIsValidHex(true)
      setHexValue(hex)
    } else {
      setIsValidHex(false)
      setHexValue(hex)
    }
  }

  const saveCurrentlyEditingColor = (color) => {
    const newColorPalette = [...selectedColorPalette]
    newColorPalette[currentColorIndex] = color
    const newColorPalettes = [...colorPalettes]
    newColorPalettes[currentPaletteIndex] = newColorPalette
    setColorPalettes(newColorPalettes)
  }

  const onColorPickerChange = ({ hex }: { hex: string }) => {
    onChangeHex(hex)
    saveCurrentlyEditingColor(hex)
  }

  const openColorPopup = (colorIndex: number) => {
    setCurrentColorIndex(colorIndex)
    setIsValidHex(true)
    setHexValue(selectedColorPalette[colorIndex])
    setColorPopupOpen(true)
  }

  const closeColorPopup = () => {
    setCurrentColorIndex(-1)
    setColorPopupOpen(false)
  }

  const deleteColor = () => {
    if (selectedColorPalette.length > 2) {
      const newColorPalette = [...selectedColorPalette]
      newColorPalette.splice(currentColorIndex, 1)
      const newColorPalettes = [...colorPalettes]
      newColorPalettes[currentPaletteIndex] = newColorPalette
      setColorPalettes(newColorPalettes)
      closeColorPopup()
    }
  }

  const saveColor = () => {
    if (isValidHex) {
      saveCurrentlyEditingColor(hexValue)
      closeColorPopup()
    }
  }

  const addColor = () => {
    setCurrentColorIndex(selectedColorPalette.length)
    setHexValue("#ffffff")
    setIsValidHex(true)
    setColorPopupOpen(true)
  }

  const openPalettePopup = () => setPalettePopupOpen(true)
  const closePalettePopup = () => setPalettePopupOpen(false)

  const selectPalette = (paletteIndex: number) => {
    setCurrentPaletteIndex(paletteIndex)
    closePalettePopup()
  }

  const addPalette = () => {
    const newColorPalettes = [...colorPalettes, ["#FFFFFF", "#000000"]]
    setColorPalettes(newColorPalettes)
  }

  const deletePalette = (paletteIndex: number) => {
    if (colorPalettes.length > 1) {
      const newColorPalettes = [...colorPalettes]
      newColorPalettes.splice(paletteIndex, 1)
      setColorPalettes(newColorPalettes)
    }
  }

  // If the user adds a new palette, selects it, and then selects "revert
  // changes" - this resets the currentPaletteIndex so we don't accidentally try
  // to display palette information for a palette we don't have
  useEffect(() => {
    if (currentPaletteIndex >= colorPalettes.length) {
      setCurrentPaletteIndex(0)
    }
  }, [colorPalettes, currentPaletteIndex])

  // Palette selection that appears when the user opens the palette popup
  const palettes = colorPalettes.map((palette, i) => {
    const classNames = cx("ordinal-palette", {
      "currently-editing": currentPaletteIndex === i
    })
    const deletePaletteCx = cx("palette-delete-button", {
      disabled: colorPalettes.length <= 1
    })
    const swatches = palette.map((hex: string, id: number) => {
      return (
        <div
          className={"ordinal-palette-swatch"}
          key={id}
          style={{ background: hex }}
        />
      )
    })
    return (
      <div className="ordinal-palette-container" key={i}>
        <div className={classNames} onClick={() => selectPalette(i)}>
          {swatches}
        </div>
        <Icon
          className={deletePaletteCx}
          icon="delete"
          onClick={() => deletePalette(i)}
        />
      </div>
    )
  })

  // Color swatches for the currently selected palette
  const swatchesForPalette = selectedColorPalette.map(
    (hex: string, i: number) => {
      const className = cx("color-swatch", {
        "currently-editing": i === currentColorIndex
      })
      return (
        <div
          className={className}
          key={i}
          style={{ background: hex }}
          onClick={() => openColorPopup(i)}
        >
          <div className="swatch-arrow" />
        </div>
      )
    }
  )

  // The preview for the palette that's currently being edited
  const ordinalSwatchPreviewColors = selectedColorPalette.map(
    (hex: string, i: number) => {
      return (
        <div
          className={"ordinal-palette-swatch"}
          key={i}
          style={{ background: hex }}
        />
      )
    }
  )
  const hasMaxNumSwatches =
    selectedColorPalette.length >= MAX_NUM_CATEGORICAL_SWATCHES

  return (
    <div className="config-ui-color-palette-ordinal">
      <div className="color-palette-label">{label}</div>
      <div
        className="ordinal-palette-preview-container"
        onClick={openPalettePopup}
      >
        <div className="ordinal-palette-swatch-container">
          {ordinalSwatchPreviewColors}
        </div>
        <div className="ordinal-palette-arrow" />
      </div>
      <Popover isOpened={isPalettePopupOpen} onClose={closePalettePopup}>
        <div className="ordinal-palette-popover">
          <div className="popover-label">Choose a palette to edit</div>
          {palettes}
          <div className="add-palette-button" onClick={addPalette}>
            + New palette
          </div>
        </div>
      </Popover>
      <div className="color-swatch-list">
        {swatchesForPalette}
        {!hasMaxNumSwatches && (
          <div className="add-color-button" onClick={addColor}>
            +
          </div>
        )}
      </div>
      <Popover isOpened={isColorPopupOpen} onClose={closeColorPopup}>
        <ColorPicker
          saveColor={saveColor}
          canDeleteColor={selectedColorPalette.length > 2}
          deleteColor={deleteColor}
          color={hexValue}
          onChange={onColorPickerChange}
        />
      </Popover>
    </div>
  )
}

export default OrdinalColorPalette
