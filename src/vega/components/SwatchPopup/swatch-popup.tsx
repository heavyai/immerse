// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import cx from "classnames"

import "./swatch-popup.scss"

interface Props {
  colors: string[]
  selectedColor: string
  onSelectColor: (color: string) => void
}

const SwatchPopup: FC<Props> = ({
  colors = [],
  selectedColor,
  onSelectColor
}) => {
  const swatches = colors.map((color) => {
    const className = cx("swatch-color", {
      selected: color === selectedColor
    })
    const style = {
      backgroundColor: color
    }
    return (
      <div
        key={color}
        className={className}
        style={style}
        onClick={() => onSelectColor(color)}
      />
    )
  })
  return <div className="swatch-popup">{swatches}</div>
}

export default SwatchPopup
