// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHARTS, LINE_STYLES } from "constants/charts"
import { CHART_TYPES } from "constants/chart-types"
import { lensPath, view } from "ramda"
import React, { Component } from "react"
import PropTypes from "prop-types"
import BarLineToggleParent from "components/bar-line-toggle/bar-line-toggle-parent"
import { colorShape } from "constants/prop-types"
import ColorSwatch from "components/color-swatch/color-swatch"
import Icon from "components/icon/icon"
import MeasureYAxisToggleParent from "components/measure-yaxis-toggle/measure-yaxis-toggle-parent"
import {
  CHARTS_DEFAULT_COLORS,
  ORDINAL_COLORS,
  QUANTITATIVE_COLORS,
  SOLID_COLORS,
  CS_TERRAIN_COLORS,
  getColors
} from "services/colors"
import "./colors-popup.scss"

export function buildSwatch(type) {
  const swatches = {
    quantitative: [
      {
        type: "quantitative",
        label: "Quantitative Scale",
        colors: getColors(QUANTITATIVE_COLORS)
      }
    ],
    ordinal: [
      { type: "solid", label: "Solid", colors: getColors(SOLID_COLORS) },
      { type: "ordinal", label: "Scale", colors: getColors(ORDINAL_COLORS) }
    ],
    ordinalScales: [
      { type: "ordinal", label: "Scale", colors: getColors(ORDINAL_COLORS) }
    ],
    solid: [{ type: "solid", label: "Solid", colors: getColors(SOLID_COLORS) }],
    terrain: [
      { type: "solid", label: "Solid", colors: getColors(CS_TERRAIN_COLORS) }
    ]
  }

  return swatches[type]
}

export default class ColorsPopup extends Component {
  static propTypes = {
    chartId: PropTypes.string,
    chartType: PropTypes.string.isRequired,
    chooseColor: PropTypes.func.isRequired,
    colorMeasureColorType: PropTypes.string,
    hasAxisSelector: PropTypes.bool,
    hasLineStyle: PropTypes.bool,
    hideSolid: PropTypes.bool,
    isSelected: PropTypes.func.isRequired,
    markType: PropTypes.string,
    numActiveDimensions: PropTypes.number.isRequired,
    selectCustomColors: PropTypes.func,
    selectedColor: colorShape.isRequired,
    showDensityAccumulatorColors: PropTypes.bool
  }

  get swatches() {
    const chartDefaultColorType = view(
      lensPath([this.props.chartType, "type"]),
      getColors(CHARTS_DEFAULT_COLORS)
    )
    let colors = chartDefaultColorType
    if (this.props.colorMeasureColorType) {
      colors = this.props.colorMeasureColorType
    } else if (this.props.showDensityAccumulatorColors === false) {
      colors = "solid"
    }
    if (colors === "ordinal") {
      if (
        // Color themselves when a dim is set, so allow for
        // solid color swatches as well.
        !this.props.hideSolid &&
        [
          CHART_TYPES.PIE,
          CHART_TYPES.SCATTER,
          CHART_TYPES.BACKEND_SCATTER
        ].includes(this.props.chartType)
      ) {
        return buildSwatch("ordinal")
      }
      return buildSwatch("ordinalScales")
    } else if (
      colors === "quantitative" ||
      this.props.showDensityAccumulatorColors
    ) {
      return buildSwatch("quantitative")
    } else if (this.props.chartType === CHART_TYPES.CROSS_SECTION_TERRAIN) {
      return buildSwatch("terrain")
    } else if (colors === "solid" || colors === "none") {
      return buildSwatch("solid")
    } else {
      throw new Error(
        `can't get swatch for invalid chart type: ${this.props.chartType}`
      )
    }
  }

  get shouldShowColorByDimButton() {
    const chartTypesWithoutColorByDimButton = {
      pointmap: true,
      linemap: true,
      backendChoropleth: true,
      line: true,
      line2: true,
      histogram: true
    }
    return (
      CHARTS[this.props.chartType]?.customColorable &&
      this.props.selectedColor.type !== "quantitative" &&
      !(this.props.chartType in chartTypesWithoutColorByDimButton) &&
      this.props.numActiveDimensions > 1
    )
  }

  chooseColor(color) {
    this.props.chooseColor(
      Object.assign({}, color, {
        lineStyle: this.props.selectedColor.lineStyle
      })
    )
  }

  renderSwatchColors(swatch) {
    return Object.keys(swatch.colors).map((key, i) => {
      const val = swatch.colors[key]
      const { type } = swatch
      const color = { type, key, val }
      return (
        <ColorSwatch
          color={color}
          hasLineStyle={this.props.hasLineStyle}
          id={`color-${type}-${i}`}
          key={key}
          onClick={() => this.chooseColor(color)}
          selected={this.props.isSelected(color)}
        />
      )
    })
  }

  chooseLineStyle(style) {
    this.props.chooseColor(
      Object.assign({}, this.props.selectedColor, { lineStyle: style })
    )
  }

  render() {
    const currentLineStyle =
      this.props.selectedColor.lineStyle || LINE_STYLES[0]
    return (
      <div className="color-picker-popup">
        <div>
          {this.swatches.map((swatch, index) => (
            <>
              <div className="color-header">{swatch.label}</div>
              <div
                className={`swatch-group ${swatch.type}`}
                data-testid={`swatch-group-${swatch.type}`}
                key={index}
              >
                {this.renderSwatchColors(swatch)}
              </div>
            </>
          ))}

          {this.props.hasAxisSelector && (
            <BarLineToggleParent
              chartId={this.props.chartId}
              measureIndex={0}
              chooseLineStyle={this.chooseLineStyle}
            />
          )}

          {this.props.hasLineStyle && this.props.markType !== "bar" && (
            <div className={"swatch-group"}>
              <div
                className="color-header"
                style={{ border: "none", marginBottom: 0 }}
              >
                Line Style
              </div>
              <div className="line-styles" data-testid="line-styles">
                {LINE_STYLES.map((style) => (
                  <button
                    className={`button line-${style} ${
                      style === currentLineStyle ? "is-active" : ""
                    }`}
                    data-testid={`line-${style}`}
                    key={style}
                    onClick={() => this.chooseLineStyle(style)}
                  >
                    <Icon name={`line-${style}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {this.props.hasAxisSelector && (
            <MeasureYAxisToggleParent
              chartId={this.props.chartId}
              measureIndex={0}
            />
          )}

          {this.shouldShowColorByDimButton && (
            <div className="custom-colors">
              <button
                className="button"
                id="color-by-dimension"
                onClick={this.props.selectCustomColors}
              >
                Color by Dimension
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }
}
