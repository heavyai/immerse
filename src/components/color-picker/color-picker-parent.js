// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as GeoHeatActions from "charts/raster-chart/geoheat-actions"
import * as LineChartActions from "charts/line/line-chart-action-creators"
import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"
import { contains, lensProp, not, set, equals } from "ramda"
import { CHARTS, CHART_TYPES } from "constants/charts"
import { COLOR_PALETTE_TYPES } from "constants/colors"
import ColorPicker from "./color-picker"
import compose from "recompose/compose"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import setPropTypes from "recompose/setPropTypes"
import {
  updateChartColors,
  updateD3ChartColorPalette,
  clearD3ChartColor
} from "actions/charts-color-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import {
  isRasterChart,
  isRasterPointChart,
  isRasterChartButNotGeoheat
} from "../../charts/raster-chart/raster-utils"
import {
  isChartMultiSource,
  getSelectorsForSource,
  getColorDimension
} from "reducers/charts/helpers/multi-source-helpers"
import { getColors, QUANTITATIVE_COLORS } from "../../services/colors"
import {
  chartHasCategoricalColoring,
  isD3ChartWithCategoricalColoring,
  isD3ChartWithCustomDomainRange
} from "reducers/charts/helpers/color-helpers"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"

const propTypes = {
  id: PropTypes.string.isRequired,
  colorDimensionActive: PropTypes.bool.isRequired,
  lockedTopN: PropTypes.bool.isRequired,
  multiSourceIndex: PropTypes.string,
  onUnlockTopN: PropTypes.func,
  savedColors: PropTypes.object.isRequired
}

const isColorMeasureColunmAllNull = (minMax) => equals(minMax, [null, null]) // check if colorMeasure column is all null

function isCustomColorsOn(color, chart, colorMeasure) {
  const chartType = chart.type
  if (chartType === "line2" || chartType === "bar") {
    return true
  } else if (colorMeasure && isColorMeasureColunmAllNull(colorMeasure.minMax)) {
    // show custom color palette if color measure column all null
    return true
  } else if (
    isRasterChartButNotGeoheat(chartType) &&
    colorMeasure?.type === "STR"
  ) {
    return false
  } else if ([CHART_TYPES.PIE, CHART_TYPES.SCATTER].includes(chartType)) {
    return Boolean(color?.isCustom && !colorMeasure && chart.colorByDimension)
  } else {
    return Boolean(
      color?.isCustom &&
        CHARTS[chartType].customColorable &&
        (!colorMeasure ||
          (isRasterChartButNotGeoheat(chartType) &&
            colorMeasure.colorType === COLOR_PALETTE_TYPES.ORDINAL))
    )
  }
}

function dimensionCustomColorsOptions(dimensions) {
  return dimensions
    .filter((d) => d.value)
    .map((d, i) => ({
      value: `key${i}`,
      label: d.value
    }))
}

export function mapStateToProps(
  { charts, sharedSettings },
  { id, multiSourceIndex }
) {
  const chart = charts[id]
  const varType = chart.type === "choropleth" ? "val" : "color"

  const isMultiSource = isChartMultiSource(chart)

  const measures = getSelectorsForSource(chart.measures, multiSourceIndex)

  const dimensions = getSelectorsForSource(chart.dimensions, multiSourceIndex)

  const colorMeasure =
    measures.filter((d) => d.name === varType && d.value)[0] || null

  // all null color measure column color
  const nullDomain = chart.color?.defaultOtherDomain
    ? chart.color.defaultOtherDomain
    : "NULL"
  const nullDomainRange = chart.color?.defaultOtherRange
    ? chart.color.defaultOtherRange
    : getColors(QUANTITATIVE_COLORS).mapDScale[0]
  const nullColor = Object.assign({}, chart.color, {
    defaultOtherDomain: nullDomain,
    defaultOtherRange: nullDomainRange
  })

  const paletteMapping = sharedSettings.mappings?.find(
    (m) => m.id === chart.color?.paletteMappingId
  )?.mapping
  let color = paletteMapping ?? chart.color

  if (isMultiSource) {
    color = chart.color[multiSourceIndex]
  } else if (colorMeasure && isColorMeasureColunmAllNull(colorMeasure.minMax)) {
    color = nullColor
  }

  const colorSeriesDim =
    dimensions.filter((d) => d.name === "Series" && d.value)[0] || null
  const d3ColorDim = isD3ChartWithCategoricalColoring(chart)
    ? dimensions[0]
    : null
  const colorData = colorMeasure || colorSeriesDim || d3ColorDim
  const markTypes = chart.markTypes || []
  const typesThatCannotRemoveCustomColors = [
    "pointmap",
    "line",
    "line2",
    "bar",
    "histogram",
    "backendScatter",
    "backendChoropleth",
    "linemap"
  ]
  const numActiveDimensions = dimensions.filter((d) => d.value).length

  const colorDimension = getColorDimension(dimensions, multiSourceIndex)
  const hasColorDimension = Boolean(colorDimension && colorDimension.value)
  const showOther =
    chart.type === "line2" && hasColorDimension
      ? colorDimension.showOther
      : isRasterChart(chart.type)
      ? chart.rasterShowOther
      : chart.showOther

  // Bar chart and line chart have custom colors for multiple measures, but cannot add / remove / show others
  // They have full custom colors for color by dimension / color dimension
  const disableAdd =
    ((chart.type === "bar" || chart.type === "line2") && !hasColorDimension) ||
    isD3ChartWithCustomDomainRange(chart)
  const disableOthers =
    (chart.type === "bar" ||
      chart.type === "line2" ||
      chart.color?.defaultOtherDomain === null) &&
    !hasColorDimension
  const disableRemove =
    ((chart.type === "bar" || chart.type === "line2") && !hasColorDimension) ||
    isD3ChartWithCustomDomainRange(chart)

  return {
    buttonLabel: colorData?.name ?? "Color",
    canRemoveCustomColors: not(
      contains(chart.type, typesThatCannotRemoveCustomColors)
    ),
    chart,
    chartType: chart.type,
    chartId: id,
    currentLayer: chart.currentLayer, // raster chart layer index
    color,
    colorMeasure,
    customColorsOn: isCustomColorsOn(color, chart, colorMeasure),
    customColorsOptions:
      Boolean(colorMeasure) ||
      chart.type === "line" ||
      chart.type === "line2" ||
      chart.type === "histogram" ||
      chart.type === "bar"
        ? []
        : dimensionCustomColorsOptions(dimensions),
    customOrdinalColors: chartHasCategoricalColoring({
      chartType: chart.type,
      colorType: colorMeasure?.colorType || color?.type,
      colorMeasure,
      chart
    }),
    densityAccumulatorEnabled: chart.densityAccumulatorEnabled,
    disableAdd,
    disableOthers,
    disableRemove,
    disableToggle: chart.hasError,
    // only line2 charts can change the axis BUT the area chart doesn't support a second axis.
    // so only allow if it is line2, but is not area.
    hasAxisSelector:
      chart.type === "line2" && !chart.renderArea && !hasColorDimension,
    hasColorDimension,
    headerLabel: colorData?.label ?? null,
    isMultiSource,
    multiSourceIndex,
    showOther,
    id,
    isCustomColors: Boolean(color?.isCustom),
    keysColumns: dimensions.reduce(
      (agg, item, index) =>
        item.value
          ? Object.assign({}, agg, { [`key${index}`]: item.value })
          : agg,
      {}
    ),
    numActiveDimensions,
    paletteMapping,
    showColorPopup: Boolean(chart.showColorPopup),
    markTypes
  }
}

function savedColorKey(color) {
  return color.column ? `custom_${color.column}` : color.type
}

export function mapDispatchToProps(dispatch, { id, savedColors = {} }) {
  function createUpdateChartColor(actionCreator) {
    return function updateChartColor(color, chart) {
      const colorPayload = {
        color,
        savedColors: set(lensProp(savedColorKey(color)), color, savedColors)
      }
      if (color.column) {
        colorPayload.colorByDimension = color.column
      }
      if (isD3ChartWithCustomDomainRange(chart)) {
        dispatch(clearD3ChartColor(id))
      }
      dispatch(actionCreator(id, colorPayload))
    }
  }

  return {
    updateChartColor: createUpdateChartColor(updateChart),
    updateRasterColor: createUpdateChartColor(
      RasterChartActions.updateRasterChart
    ),
    updateCategoricalRasterColor: createUpdateChartColor(
      RasterChartActions.updateRasterChartColorPalette
    ),
    updateCategoricalD3Color: createUpdateChartColor(updateD3ChartColorPalette),
    updateGeoHeatColor: createUpdateChartColor(
      GeoHeatActions.updateGeoHeatColorRange
    ),
    updateLineColor: createUpdateChartColor(
      LineChartActions.updateLineSolidColor
    ),
    updateShowColorPopup: (showColorPopup) =>
      dispatch(updateChart(id, { showColorPopup })),
    updateColorByDimension: (columnName) =>
      dispatch(updateChart(id, { colorByDimension: columnName })),
    updateChartColors: () => dispatch(updateChartColors(id)),
    updateChart: (updates) => dispatch(updateChart(id, { ...updates }))
  }
}

export function mergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    updateChartColor(color) {
      if (
        isRasterChartButNotGeoheat(stateProps.chartType) &&
        color.type === COLOR_PALETTE_TYPES.ORDINAL
      ) {
        dispatchProps.updateCategoricalRasterColor(color)
      } else if (
        isRasterPointChart(stateProps.chartType) ||
        stateProps.chartType === CHART_TYPES.CONTOUR ||
        isCrossSectionType(stateProps.chartType)
      ) {
        dispatchProps.updateRasterColor(color)
      } else if (
        stateProps.chartType === "line" ||
        stateProps.chartType === "line2" ||
        stateProps.chartType === "histogram"
      ) {
        dispatchProps.updateLineColor(color)
      } else if (
        stateProps.chartType === "geoheat" ||
        stateProps.chartType === "backendChoropleth" ||
        stateProps.chartType === "linemap"
      ) {
        dispatchProps.updateGeoHeatColor(color)
      } else if (
        isD3ChartWithCategoricalColoring(stateProps.chart) &&
        color.type !== COLOR_PALETTE_TYPES.SOLID
      ) {
        dispatchProps.updateCategoricalD3Color(color)
      } else {
        dispatchProps.updateChartColor(color, stateProps.chart)
      }
    }
  }
}

const ColorPickerParent = compose(
  setPropTypes(propTypes),
  connect(mapStateToProps, mapDispatchToProps, mergeProps)
)(ColorPicker)

ColorPickerParent.defaultProps = {
  lockedTopN: false,
  colorDimensionActive: false
}

export default ColorPickerParent
