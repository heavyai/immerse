// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

type Props = {
  // Colors to display, e.g. ["#22A7F0", "#3ad6cd", "#d4e666"]
  colors: string[]

  // Whether to smoothly interpolate the colors to make a gradient
  interpolate?: boolean

  // Whether to reverse the order of the colors
  reverse?: boolean

  // Whether to show a blue border around the swatch to show it's selected
  selected?: boolean

  // Handler for clicking on this swatch
  handleSelect: () => void
}

const ColorSwatch: FC<Props> = ({
  colors,
  interpolate,
  reverse,
  selected,
  handleSelect
}) => {
  const displayColors = reverse ? Array.from(colors).reverse() : colors

  return (
    <div
      className={`color-swatch${selected ? " selected" : ""}`}
      onClick={handleSelect}
    >
      {interpolate ? (
        <div
          className="color-item quantitative"
          style={{
            background: `linear-gradient(to right, ${displayColors})`
          }}
        />
      ) : (
        displayColors.map((color, i) => (
          <div
            className="color-item"
            key={`${color}${i}`}
            style={{ backgroundColor: color }}
          />
        ))
      )}
    </div>
  )
}

export default ColorSwatch
