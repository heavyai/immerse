// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import cx from "classnames"
import { LINE_STYLES } from "constants/charts"
import PropTypes from "prop-types"
import BarLineToggleParent from "components/bar-line-toggle/bar-line-toggle-parent"
import ColorSwatch from "components/color-swatch/color-swatch"
import Icon from "components/icon/icon"
import MeasureYAxisToggleParent from "components/measure-yaxis-toggle/measure-yaxis-toggle-parent"
import { CUSTOM_COLORS, getColors } from "services/colors"
import { colorShape } from "constants/prop-types"

import "./custom-colors-popup.scss"

const SwatchGroup = ({ colorObjects, onSelect, selectedColor }) => {
  return (
    <div className="swatch-group solid">
      {colorObjects.map((colorObject) => {
        const { key, val } = colorObject
        return (
          <ColorSwatch
            color={colorObject}
            key={key}
            onClick={() => onSelect(colorObject)}
            selected={selectedColor === val[0]}
          />
        )
      })}
    </div>
  )
}

export default class CustomColorsPopup extends Component {
  getColorObjects() {
    const { palette } = this.props

    if (palette) {
      return palette.val.map((hex, i) => {
        return { val: [hex], key: `${hex}${i}` }
      })
    } else {
      const colors = getColors(CUSTOM_COLORS)
      return Object.keys(colors).map((key) => {
        const val = colors[key]
        return { key, val }
      })
    }
  }

  getAdditionalColorsObjects() {
    return this.props.additionalColors.map((hex, i) => {
      return { val: [hex], key: `${hex}${i}` }
    })
  }

  render() {
    return (
      <div
        className={cx("custom-colors-popup", {
          "is-combo-popup": this.props.palette
        })}
        data-testid="custom-colors-popup"
      >
        {this.props.additionalColors && (
          <div className="custom-colors-label">Palette Colors</div>
        )}
        <div className="custom-colors-wrapper">
          <SwatchGroup
            colorObjects={this.getColorObjects()}
            selectedColor={this.props.selectedColor}
            onSelect={this.props.chooseColor}
          />
        </div>

        {Boolean(this.props.additionalColors?.length) && (
          <>
            <div className="custom-colors-label">Additional Colors</div>
            <div className="custom-colors-wrapper">
              <SwatchGroup
                colorObjects={this.getAdditionalColorsObjects()}
                selectedColor={this.props.selectedColor}
                onSelect={this.props.chooseColor}
              />
            </div>
          </>
        )}

        {this.props.hasAxisSelector && (
          <div className="bar-line-toggle-wrapper">
            <BarLineToggleParent
              chartId={this.props.chartId}
              measureIndex={this.props.measureIndex}
              chooseLineStyle={this.props.chooseLineStyle}
            />
          </div>
        )}

        {this.props.lineStyle && this.props.markType !== "bar" && (
          <div className="line-styles">
            {LINE_STYLES.map((style) => (
              <button
                className={`button ${
                  this.props.lineStyle === style ? "is-active" : ""
                }`}
                key={style}
                onClick={() => this.props.chooseLineStyle(style)}
              >
                <Icon name={`line-${style}`} />
              </button>
            ))}
          </div>
        )}

        {this.props.hasAxisSelector && (
          <div className="measure-yaxis-toggle-wrapper">
            <MeasureYAxisToggleParent
              chartId={this.props.chartId}
              measureIndex={this.props.measureIndex}
              toggleYAxisOrientation={this.props.toggleYAxisOrientation}
            />
          </div>
        )}
      </div>
    )
  }
}

CustomColorsPopup.propTypes = {
  chartId: PropTypes.string,
  chooseColor: PropTypes.func.isRequired,
  chooseLineStyle: PropTypes.func,
  hasAxisSelector: PropTypes.bool,
  lineStyle: PropTypes.string,
  markType: PropTypes.string,
  measureIndex: PropTypes.string,
  palette: colorShape,
  selectedColor: PropTypes.string,
  toggleYAxisOrientation: PropTypes.func
}
