// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useRef } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import cx from "classnames"

import {
  CHARTS,
  CHARTS_ORDER,
  CHART_TYPES,
  BACKEND_RENDERED_CHART_TYPES,
  NOT_BE_RENDERED_CHART_TYPES,
  LAYER_CHART_TYPES,
  vegaCharts,
  deckglCharts,
  experimentalCharts,
  DECKGL_MESSAGE,
  DEPRECATED_CHART_TYPES,
  CHART_DEFS
} from "constants/charts"
import { chartShape } from "constants/prop-types"
import ChartTypeButton from "components/chart-type-button/chart-type-button"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
const {
  ENABLE_NEW_COMBO_CHART,
  ENABLE_DECKGL_CHART,
  ENABLE_EXPERIMENTAL_CHARTS,
  ENABLE_CHART_TYPE_BUTTON_SCROLLING,
  HIDE_DEPRECATED_CHART_TYPES,
  DISABLE_BE_RENDERING
} = available_feature_flags

export function shouldDisable(selectedChart, buttonType) {
  const currentLayer = selectedChart.currentLayer
  const isLayeredChart = selectedChart.layers && selectedChart.layers.length > 1
  const isLayeredComboChart =
    (selectedChart.dataSelections && selectedChart.dataSelections.length > 1) ||
    (selectedChart.type === "line2" &&
      Object.keys(selectedChart.multiSources || {}).length > 1)
  const comboChartTypes = ["line2", "vega-combo"]

  const selectedChartDef = CHART_DEFS[selectedChart.type]
  const buttonChartDef = CHART_DEFS[buttonType]

  // If the button type we're rendering doesn't support the selected
  // chart type, disable it
  const buttonTypeIncompatible =
    buttonChartDef.compatibleLayerTypes &&
    !buttonChartDef.compatibleLayerTypes.includes(selectedChart.type)

  // Disable this chart button if the selectedChart has layers
  // and the button type is not a layer chart type.
  const filterToLayered =
    isLayeredChart &&
    (!LAYER_CHART_TYPES.includes(buttonType) ||
      currentLayer === "master" ||
      buttonTypeIncompatible)

  const disableLayeredCombo =
    isLayeredComboChart && !comboChartTypes.includes(buttonType)

  let selectedChartIncompatible = false
  if (selectedChartDef.compatibleLayerTypes) {
    selectedChartIncompatible =
      isLayeredChart &&
      !selectedChartDef.compatibleLayerTypes.includes(buttonType)
  }
  return Boolean(
    selectedChart.type !== buttonType &&
      (disableLayeredCombo || filterToLayered || selectedChartIncompatible)
  )
}

export const createReqString = (min, max) => {
  const infiniteOrClosedRange = max === Infinity ? `${min}+` : `${min}-${max}`
  return min === max ? `${min}` : infiniteOrClosedRange
}

export const orderChartTypes = (a, b) =>
  CHARTS_ORDER.indexOf(a.type) - CHARTS_ORDER.indexOf(b.type)

export const countNumberOfValidSelections = (dimOrMeasureArray) =>
  dimOrMeasureArray.filter((s) => s.value).length

export function selectorHasCorrectCount(selectors, min, max) {
  const numSelectors = countNumberOfValidSelections(selectors)
  return min <= numSelectors && numSelectors <= max
}

export function formatMessage(dReqs, mReqs, type) {
  const specialMessage = type === CHART_TYPES.DECKGL ? DECKGL_MESSAGE : null
  return (
    <div>
      <div className="tooltip-section-title">Require:</div>
      <div>
        {dReqs} dimension{dReqs === "1" ? "" : "s"} and
      </div>
      <div>
        {mReqs} measure{mReqs === "1" ? "" : "s"}
      </div>
      {specialMessage && (
        <>
          <div className="tooltip-section-title">Info:</div>
          <div>{specialMessage}</div>
        </>
      )}
    </div>
  )
}

export const selectorsAreCorrectType = (SELECTORS, selectors) =>
  SELECTORS.reduce((allValid, SELECTOR, index) => {
    const selector = selectors[index]
    if (SELECTOR.type && selector && selector.type) {
      return allValid && Boolean(SELECTOR.type[selector.type])
    }
    return allValid
  }, true)

export const dimensionsAreValid = (CHART, dimensions) =>
  selectorHasCorrectCount(
    dimensions,
    CHART.minDimensions,
    CHART.maxDimensions
  ) && selectorsAreCorrectType(CHART.dimensions, dimensions)

export const measuresAreValid = (CHART, measures) =>
  selectorHasCorrectCount(measures, CHART.minMeasures, CHART.maxMeasures) &&
  selectorsAreCorrectType(CHART.measures, measures)

export const isEnabled = (type, { dimensions, measures }) =>
  dimensionsAreValid(CHARTS[type], dimensions) &&
  measuresAreValid(CHARTS[type], measures)

export const filterChartTypes = (
  isPolyRasterEnabled,
  isRenderingEnabled,
  distributed
) => {
  const enableDeckGLCharts =
    !distributed &&
    (!isRenderingEnabled || getFeatureFlag(ENABLE_DECKGL_CHART))

  const hiddenNonBEChartTypes = [
    NOT_BE_RENDERED_CHART_TYPES.LINE,
    ...(getFeatureFlag(ENABLE_NEW_COMBO_CHART) ? [] : vegaCharts),
    ...(enableDeckGLCharts ? [] : deckglCharts),
    ...(getFeatureFlag(ENABLE_EXPERIMENTAL_CHARTS) ? [] : experimentalCharts)
  ]
  const notBERenderedTypes = Object.values(NOT_BE_RENDERED_CHART_TYPES).filter(
    (type) => !hiddenNonBEChartTypes.includes(type)
  )

  const BERenderedTypes = Object.values(BACKEND_RENDERED_CHART_TYPES)

  const excludeDeprecated = getFeatureFlag(HIDE_DEPRECATED_CHART_TYPES)

  const isRenderingEnabledAndNotOverridden =
    isRenderingEnabled && !getFeatureFlag(DISABLE_BE_RENDERING)
  return [
    ...notBERenderedTypes,
    ...(isRenderingEnabledAndNotOverridden ? BERenderedTypes : [])
  ]
    .filter((type) =>
      excludeDeprecated
        ? !Object.values(DEPRECATED_CHART_TYPES).includes(type)
        : true
    )
    .filter((type) => {
      // choropleth is a special case. because OF COURSE it's a special case.
      // so for the choropleth chart, we only only include it if BE rendering is off
      // OR poly raster is not enabled.
      if (type === CHART_TYPES.CHOROPLETH) {
        return !isRenderingEnabledAndNotOverridden || !isPolyRasterEnabled
      } else if (type === CHART_TYPES.BACKEND_CHOROPLETH) {
        // but we keep be choropleth if they're both on.
        return isRenderingEnabledAndNotOverridden && isPolyRasterEnabled
      } else {
        // otherwise, we keep it, since it's not a stupid choropleth special case
        return true
      }
    })
}

export const calculateChartTypeButtons = ({ chartTypes, chart }) =>
  chartTypes.map((type) => ({
    type,
    reqs: [
      createReqString(CHARTS[type].minDimensions, CHARTS[type].maxDimensions),
      createReqString(CHARTS[type].minMeasures, CHARTS[type].maxMeasures)
    ],
    disabled: shouldDisable(chart, type)
  }))

export const mapStateToProps = ({
  connection: { isPolyRasterEnabled, isRenderingEnabled, hardwareInfo }
}) => ({
  isPolyRasterEnabled,
  isRenderingEnabled,
  distributed: hardwareInfo && hardwareInfo.length > 1
})

export const ChartTypePanel = (props) => {
  const wrapperRef = useRef(null)
  const { isPolyRasterEnabled, isRenderingEnabled, chart, distributed } = props

  const chartTypeButtons = calculateChartTypeButtons({
    ...props,
    chartTypes: filterChartTypes(
      isPolyRasterEnabled,
      isRenderingEnabled,
      distributed
    )
  })
  const classes = cx("chart-type-wrapper", {
    "enable-chart-type-wrapper-scrolling": getFeatureFlag(
      ENABLE_CHART_TYPE_BUTTON_SCROLLING
    )
  })

  return (
    <div className={classes} data-testid="chart-type-wrapper" ref={wrapperRef}>
      <div className="chart-type-wrapper-overflow">
        {chartTypeButtons
          .filter((c) => CHARTS_ORDER.some((type) => type === c.type))
          .sort(orderChartTypes)
          .map(({ type, reqs, disabled }, index) => (
            <ChartTypeButton
              {...{
                chartType: type,
                className: cx(`${type}-btn`, {
                  "beta-chart-type-btn": type === "deckgl"
                }),
                disabled,
                iconId: `chart-${type}`,
                isEnabled: isEnabled(type, chart),
                reqMsg: formatMessage(reqs[0], reqs[1], type),
                ...props
              }}
              key={index}
            />
          ))}
      </div>
    </div>
  )
}

ChartTypePanel.propTypes = {
  chart: chartShape.isRequired,
  ChartTypeButtons: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      reqs: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  distributed: PropTypes.bool.isRequired,
  isPolyRasterEnabled: PropTypes.bool.isRequired,
  isRenderingEnabled: PropTypes.bool.isRequired,
  id: PropTypes.string,
  updateChart: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(ChartTypePanel)
