// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import { ColorPalette } from "vega/charts/types"

import ColorSwatch from "./ColorSwatch"

type Props = {
  title: string
  type: "solid" | "ordinal" | "quantitative"
  interpolate?: boolean
  schemes: Record<string, string[]>
  selectedColorScheme?: ColorPalette
  handleSelectColorScheme: (scheme: ColorPalette) => void
}

const ColorSchemePopupSwatchGroup: FC<Props> = ({
  title,
  type,
  interpolate,
  schemes,
  selectedColorScheme = { type: undefined, name: undefined },
  handleSelectColorScheme
}) => (
  <>
    <div className="color-header">{title}</div>
    <div className={`swatch-group ${type}`}>
      {Object.entries(schemes).map(([name, colors]) => {
        const handleSelect = () => {
          handleSelectColorScheme({ type, name })
        }

        return (
          <ColorSwatch
            key={name}
            colors={colors}
            interpolate={interpolate}
            selected={
              selectedColorScheme.type === type &&
              (selectedColorScheme.name === name ||
                selectedColorScheme.key === name)
            }
            handleSelect={handleSelect}
          />
        )
      })}
    </div>
  </>
)

export default ColorSchemePopupSwatchGroup
