// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import {
  UserConfig,
  SimpleColorPalette,
  NestedColorPalette
} from "components/ui-config-panel/types"

import ColorPalette from "components/ui-config-panel/ColorPaletteSection/ColorPalette"
import QuantitativeColorPalette from "components/ui-config-panel/ColorPaletteSection/QuantitativeColorPalette"
import OrdinalColorPalette from "components/ui-config-panel/ColorPaletteSection/OrdinalColorPalette"

import "./styles.scss"

interface Props {
  colorPalettes: UserConfig["colorPalettes"]
  setColorPalettes: (colorPalette: UserConfig["colorPalettes"]) => void
}

const ColorPaletteSection: FC<Props> = ({
  colorPalettes,
  setColorPalettes
}) => {
  const setSolidColors = (colorPalette: SimpleColorPalette) => {
    setColorPalettes({
      ...colorPalettes,
      solid: colorPalette
    })
  }
  const setQuantitativeColors = (quantitativePalettes: NestedColorPalette) => {
    setColorPalettes({
      ...colorPalettes,
      quantitative: quantitativePalettes
    })
  }
  const setOrdinalColors = (ordinalPalettes: NestedColorPalette) => {
    setColorPalettes({
      ...colorPalettes,
      ordinal: ordinalPalettes
    })
  }
  return (
    <div
      className="color-palette-section"
      data-testid="config-ui-color-palette-section"
    >
      <ColorPalette
        label="Solid"
        colorPalette={colorPalettes.solid}
        setColorPalette={setSolidColors}
      />
      <OrdinalColorPalette
        label="Categorical Colors"
        colorPalettes={colorPalettes.ordinal}
        setColorPalettes={setOrdinalColors}
      />
      <QuantitativeColorPalette
        label="Continuous Colors"
        colorPalettes={colorPalettes.quantitative}
        setColorPalettes={setQuantitativeColors}
      />
    </div>
  )
}

export default ColorPaletteSection
