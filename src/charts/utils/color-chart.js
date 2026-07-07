// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHARTS, CHARTS_DEFAULT_OTHER_ALIASES } from "constants/charts"
import d3 from "services/d3"
import dc from "services/dc"
import { CHARTS_DEFAULT_COLORS, getColors } from "services/colors"
import { isD3ChartWithCustomDomainRange } from "reducers/charts/helpers/color-helpers"
import { importableStore as store } from "store/importableStore"

const defaultQuantitativeVal = () =>
  getColors(CHARTS_DEFAULT_COLORS).defaultQuantitative.val

function basicColorAccessor(d) {
  if ((d || d === 0) && !d.isAllOthers) {
    return d.color || d.color === 0 ? d.color : d.val || d
  }

  return null
}

export function findMeasureByName(measures, type) {
  const varType =
    type === "choropleth" || type === "backendChoropleth" ? "val" : "color"
  return measures.filter((measure) => measure.name === varType)[0]
}

export function aliasDefaultOtherDomain(
  defaultOtherDomain,
  numDomains,
  isMulti
) {
  if (isMulti) {
    return CHARTS_DEFAULT_OTHER_ALIASES.other
  }

  return numDomains ? CHARTS_DEFAULT_OTHER_ALIASES.default : defaultOtherDomain
}

function customColorDimIndex(key) {
  return parseInt(key.replace(/[^0-9.]/g, ""), 10)
}

function existingDataColorAccessor(type, colorValues) {
  return function colorAccessor(d, i) {
    if (type === "line" || type === "line2" || type === "histogram") {
      return i % colorValues.length
    } else if (Array.isArray(d.key0)) {
      return d.key0.map((data) => (data.value ? data.value : data))
    } else {
      return d.key0
    }
  }
}

function customColorAccessor(chart, color) {
  return function colorAccessor(d) {
    return chart.colorDomain().includes(d[color.customKey])
      ? d[color.customKey]
      : aliasDefaultOtherDomain(
          color.defaultOtherDomain,
          color.customDomain.length
        )
  }
}

function customMultiLineAccessor(chart, color) {
  return function colorAccessor(d) {
    return chart.colorDomain().includes(chart.series().keys()[d.layer])
      ? chart.series().keys()[d.layer]
      : aliasDefaultOtherDomain(
          color.defaultOtherDomain,
          color.customDomain.length,
          chart.isMulti()
        )
  }
}

export function shouldRemoveLegend(chart, color) {
  if (chart.legend().legendType() !== color.type) {
    return true
  } else if (color.type === "custom" && !color.customDomain.length) {
    return true
  } else {
    return false
  }
}

export function colorChartWithMeasure(
  chart,
  color,
  type,
  colorMeasure,
  data,
  colorDomain
) {
  if (isD3ChartWithCustomDomainRange(chart)) {
    chart.customDomain([])
    chart.customRange([])
  }

  const colorRange =
    color.type === "quantitative" ? color.val : defaultQuantitativeVal()
  const colorScale = d3.scale
    .quantize()
    .range(color.reverse ? colorRange.slice(0).reverse() : colorRange)

  if (data) {
    const sliceData = data.filter((datum) => !datum.isAllOthers)
    colorScale.domain(d3.extent(sliceData, basicColorAccessor))
  }

  if (chart) {
    return chart
      .colorAccessor(basicColorAccessor)
      .colors(colorScale)
      .legend(
        dc
          .legendCont()
          .isLocked(Boolean(colorDomain))
          .legendTitle(colorMeasure.label)
          .chartType(type)
      )
  } else {
    return colorScale
  }
}

function colorChartWithExistingData(chart, color, type) {
  const colorValues = color.reverse ? color.val.slice(0).reverse() : color.val
  if (type === "number") {
    chart.colors(colorValues)
  } else {
    chart
      .colorAccessor(existingDataColorAccessor(type, colorValues))
      .ordinalColors(colorValues)
  }
}

export function colorChartWithCustomColors(chart, color, dimensions) {
  /* eslint complexity: ["error", 25] */ // this function is too complex. Sorry.
  const colorScale = d3.scale
    .ordinal()
    .domain(color.customDomain || [])
    .range(color.customRange || [])

  const addDefaultOtherColor =
    (!chart && colorScale.domain().length) ||
    (chart && !chart.showOther) ||
    (chart && chart.showOther && chart.showOther())

  if (addDefaultOtherColor) {
    const defaultOtherDomainAlias = aliasDefaultOtherDomain(
      color.defaultOtherDomain ||
        getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherDomain,
      color.customDomain.length,
      chart && chart.isMulti()
    )
    colorScale
      .domain(color.customDomain.concat([defaultOtherDomainAlias]))
      .range(
        color.customRange.concat([
          color.defaultOtherRange ||
            getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange
        ])
      )
  }

  if (chart) {
    const multi = chart.isMulti()

    chart
      .colorAccessor(
        multi
          ? customMultiLineAccessor(chart, color)
          : customColorAccessor(chart, color)
      )
      .colors(colorScale)

    if (
      dimensions.length === 0 ||
      (dimensions.length > 1 &&
        (color.customRange.length || (color.showOther && color.showOther())))
    ) {
      const legend = chart.legend(dc.legend()).legend().setKey(color.customKey)

      if (dimensions.length) {
        legend.setTitle(dimensions[customColorDimIndex(color.customKey)].value)
      }
    }
  }

  return colorScale
}

export default function colorChart(
  chart,
  { type, color, measures, dimensions, colorDomain },
  callback,
  mapping
) {
  const colorMeasure = findMeasureByName(measures, type)
  const chartState = store.getState().charts[chart.id]
  const sharedSettings = store.getState().sharedSettings
  const foundMapping = sharedSettings?.mappings.find(
    (m) => m.id === chartState?.color?.paletteMappingId
  )?.mapping
  const paletteMapping = mapping ?? foundMapping ?? null

  color = paletteMapping || color || getColors(CHARTS_DEFAULT_COLORS)[type]

  if (chart && chart.legend() && shouldRemoveLegend(chart, color)) {
    chart.legend().removeLegend()
  }

  if (colorMeasure && type !== "pointmap" && type !== "backendScatter") {
    return chart.dataAsync((error, data) => {
      if (error) {
        return callback(error)
      } else {
        const colorData = colorDomain ? colorDomain : data
        colorChartWithMeasure(
          chart,
          color,
          type,
          colorMeasure,
          colorData,
          colorDomain
        )
        return callback(null, data)
      }
    })
  } else if (color.isCustom && CHARTS[type].customColorable) {
    colorChartWithCustomColors(chart, color, dimensions)
    return callback()
  } else {
    colorChartWithExistingData(chart, color, type)
    return callback()
  }
}
