// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { colorShape, measureShape } from "constants/prop-types"
import { lensProp, set, values } from "ramda"
import React, { Component } from "react"
import PropTypes from "prop-types"
import { assign } from "lodash"
import { COLOR_MAX_LENGTH } from "constants/magic-variables"
import ColorsPopup from "components/colors-popup/colors-popup"
import ColorSwatch from "components/color-swatch/color-swatch"
import CustomColors from "components/custom-colors/custom-colors"
import { AdditionalColors } from "components/custom-colors/additional-colors"
import cx from "classnames"
import { DENSITY_ACCUMULATION_CHARTS } from "constants/charts"
import Popover from "components/popover/popover"
import Services from "services/immerse"
import {
  isD3ChartWithCustomDomainRange,
  isD3ChartWithCategoricalColoring,
  resetD3ChartMappingDomainRange
} from "reducers/charts/helpers/color-helpers"
import "./color-picker.scss"

export default class ColorPicker extends Component {
  static propTypes = {
    buttonLabel: PropTypes.string.isRequired,
    canRemoveCustomColors: PropTypes.bool.isRequired,
    chart: PropTypes.any,
    chartId: PropTypes.string.isRequired,
    currentLayer: PropTypes.number || PropTypes.string,
    chartType: PropTypes.string.isRequired,
    color: colorShape.isRequired,
    colorDimensionActive: PropTypes.bool.isRequired,
    colorMeasure: measureShape,
    customColorsOn: PropTypes.bool.isRequired,
    customColorsOptions: PropTypes.arrayOf(PropTypes.object),
    customOrdinalColors: PropTypes.bool,
    densityAccumulatorEnabled: PropTypes.bool,
    disableAdd: PropTypes.bool,
    disableOthers: PropTypes.bool,
    disableRemove: PropTypes.bool,
    disableToggle: PropTypes.bool,
    hasAxisSelector: PropTypes.bool,
    hasColorDimension: PropTypes.bool,
    headerLabel: PropTypes.string,
    id: PropTypes.string.isRequired,
    isCustomColors: PropTypes.bool.isRequired,
    isMultiSource: PropTypes.bool.isRequired,
    keysColumns: PropTypes.object.isRequired,
    lockedTopN: PropTypes.bool.isRequired,
    markTypes: PropTypes.arrayOf(PropTypes.string),
    multiSourceIndex: PropTypes.string,
    numActiveDimensions: PropTypes.number.isRequired,
    onUnlockTopN: PropTypes.func,
    paletteMapping: PropTypes.any,
    showColorPopup: PropTypes.bool.isRequired,
    showOther: PropTypes.bool,
    updateChart: PropTypes.func.isRequired,
    updateChartColor: PropTypes.func.isRequired,
    updateChartColors: PropTypes.func.isRequired,
    updateColorByDimension: PropTypes.func.isRequired,
    updateShowColorPopup: PropTypes.func.isRequired
  }

  static defaultProps = {
    colorDimensionActive: false,
    lockedTopN: false
  }

  constructor(props) {
    super(props)
    this.isSelected = this.isSelected.bind(this)
    this.chooseColor = this.chooseColor.bind(this)
    this.openPopup = this.openPopup.bind(this)
    this.closePopup = this.closePopup.bind(this)
    this.reverseColors = this.reverseColors.bind(this)
  }

  isSelected(color) {
    return color.key === this.props.color.key
  }

  openPopup() {
    this.props.updateShowColorPopup(true)
  }

  closePopup() {
    this.props.updateShowColorPopup(false)
  }

  chooseColor(color) {
    if (isD3ChartWithCustomDomainRange(this.props.chart)) {
      const dcChart = Services.get("dc").getChart(this.props.chart.dcFlag)
      if (dcChart) {
        // since palette was changed, only reset range, not domain
        dcChart.customRange([])
        resetD3ChartMappingDomainRange(this.props.chart)
      }
    }
    this.props.updateChartColor(color)
  }

  reverseColors() {
    const reversedColors = assign({}, this.props.color, {
      reverse: !this.props.color.reverse
    })
    this.props.updateChartColor(reversedColors)
  }

  removeCustomColors = () => {
    const newColor = set(lensProp("isCustom"), false, this.props.color)
    this.props.updateChart({ color: newColor, colorByDimension: null })
    this.props.updateChartColors()
  }

  selectCustomColors = () => {
    this.closePopup()
    const selectedColumn = this.props.color.isCustom
      ? values(this.props.customColorsOptions).filter(
          (option) => option.value === this.props.color.customKey
        )[0].label
      : values(this.props.customColorsOptions)[0].label
    this.props.updateColorByDimension(selectedColumn)
    this.props.updateChartColors()
  }

  colorMeasureColorType = () =>
    this.props.colorMeasure && this.props.colorMeasure.colorType

  showDensityAccumulatorColors = () =>
    this.props.densityAccumulatorEnabled &&
    DENSITY_ACCUMULATION_CHARTS[this.props.chartType]

  render() {
    if (this.props.color === null) {
      return null
    }

    const currentPalette =
      this.props.color?.val ?? this.props.color?.palette?.val
    const additionalColors = [
      ...new Set(
        this.props.color?.customRange?.filter(
          (r) => !currentPalette?.includes(r)
        )
      )
    ].sort()

    const customColorsProps = {
      ...this.props,
      allowRemoval: this.props.canRemoveCustomColors,
      options: this.props.customColorsOptions,
      removeCustomColors: this.removeCustomColors,
      additionalColors
    }

    return (
      <div className="color-picker-widget" data-testid="color-picker">
        {!this.props.showColorPopup && !this.props.customColorsOn && (
          <>
            <div className="color-preview-wrap">
              <ColorSwatch
                color={this.props.color}
                hasLineStyle={this.props.chartType === "line2"}
                id="color-swatch"
                onClick={this.openPopup}
                selected
              />
              {this.props.color.val?.length > 1 &&
                this.props.colorMeasure?.colorType !== "ordinal" &&
                !isD3ChartWithCategoricalColoring(this.props.chart) && (
                  <button
                    className={cx("button icon-btn reverse-colors", {
                      active: this.props.color.reverse,
                      closer: this.props.color.val.length < COLOR_MAX_LENGTH
                    })}
                    id="color-reverse"
                    onClick={this.reverseColors}
                    title={"Reverse Colors"}
                  />
                )}
            </div>
            {this.props.customOrdinalColors && (
              <div>
                {additionalColors?.length > 0 && (
                  <AdditionalColors colors={additionalColors} />
                )}
                <CustomColors {...customColorsProps} allowRemoval={false} />
              </div>
            )}
          </>
        )}
        {this.props.customColorsOn && <CustomColors {...customColorsProps} />}
        <Popover isOpened={this.props.showColorPopup} onClose={this.closePopup}>
          <ColorsPopup
            chartId={this.props.chartId}
            chartType={this.props.chartType}
            chooseColor={this.chooseColor}
            colorMeasureColorType={this.colorMeasureColorType()}
            hasAxisSelector={this.props.hasAxisSelector}
            hasLineStyle={this.props.chartType === "line2"}
            hideSolid={
              isD3ChartWithCategoricalColoring(this.props.chart) &&
              Boolean(this.props.paletteMapping)
            }
            isSelected={this.isSelected}
            markType={this.props.markTypes[0]}
            numActiveDimensions={this.props.numActiveDimensions}
            selectCustomColors={this.selectCustomColors}
            selectedColor={this.props.color}
            showDensityAccumulatorColors={this.showDensityAccumulatorColors()}
          />
        </Popover>
      </div>
    )
  }
}
