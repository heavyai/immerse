// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { colorSwatchShape } from "constants/prop-types"
import cx from "classnames"
import Icon from "components/icon/icon"
import { LINE_STYLES } from "constants/charts"
import {
  HEAVYAI_CUSTOM_COLORS,
  HEAVYAI_QUANTITATIVE_COLORS,
  HEAVYAI_ORDINAL_COLORS,
  HEAVYAI_SOLID_COLORS,
  HEAVY_SOLID_TERRAIN_COLORS
} from "services/colors"

import "./color-swatch.scss"
import { getOrdinalOrSolidPalette } from "vega/charts/color-utils"

ColorSwatch.propTypes = {
  color: colorSwatchShape.isRequired,
  hasLineStyle: PropTypes.bool,
  id: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired
}

const getColorTitle = (colorMap, colorStr) =>
  Object.keys(colorMap).find((key) => colorStr === colorMap[key].toString())

export default function ColorSwatch({
  color,
  selected,
  id,
  onClick,
  hasLineStyle
}) {
  // Fall back to palette val
  const paletteVal =
    color.val ?? color.palette?.val ?? getOrdinalOrSolidPalette()
  const colorValues = color.reverse ? paletteVal.slice(0).reverse() : paletteVal
  const currentLineStyle = color.lineStyle || LINE_STYLES[0]
  const colorMap = {
    ...HEAVYAI_CUSTOM_COLORS,
    ...HEAVYAI_SOLID_COLORS,
    ...HEAVYAI_ORDINAL_COLORS,
    ...HEAVYAI_QUANTITATIVE_COLORS,
    ...HEAVY_SOLID_TERRAIN_COLORS
  }

  const colorTitle = getColorTitle(colorMap, paletteVal.toString())

  return (
    <div
      data-testid="color-swatch"
      className={cx("color-swatch", { selected, line: hasLineStyle })}
      id={id}
      title={colorTitle}
      onClick={onClick}
    >
      {color.type === "quantitative" ? (
        <div
          data-testid={`color-item-${colorTitle}`}
          className="color-item quantitative"
          style={{
            background: `linear-gradient(to right, ${colorValues.toString()})`
          }}
        />
      ) : (
        colorValues?.map((val, index) => (
          <div
            className="color-item"
            key={index}
            style={{ color: val }}
            data-testid={`color-item-${colorTitle}`}
          >
            {hasLineStyle && <Icon name={`line-${currentLineStyle}`} />}
          </div>
        ))
      )}
    </div>
  )
}
