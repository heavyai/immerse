// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  DEFAULT_CHART_MARGINS,
  DEFAULT_CHART_MARGINS_W_RANGE,
  DEFAULT_RANGE_MARGINS,
  FOCUS_CHART_HEIGHT_RATIO,
  FOCUS_MARGIN,
  RANGE_CHART_HEIGHT_RATIO,
  SERIES_ENCODING_INDEX,
  X_ENCODING_INDEX,
  Y_ENCODING_INDEX
} from "./line-chart-constants"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import defaultListeners, {
  binEventListenerForLine,
  createAxisDomainUpdateFunction,
  elasticXListener,
  elasticYListener,
  updateBinBoundsListener,
  xAxisDomainListener
} from "charts/utils/event-listeners"
import {
  formatNumber,
  xAxisTickFormat,
  xDomain,
  xScale
} from "charts/utils/coordinate-helpers"
import addChartEventListeners from "charts/utils/add-chart-event-listeners"
import { CHARTS_DEFAULT_OTHER_ALIASES } from "constants/charts"
import composeMeasures from "charts/utils/compose-measures"
import createLineChartInterface from "./line-chart-interface"
import { createSetter } from "utils/helpers"
import { toAggMode } from "utils/selector-helpers"
import d3 from "services/d3"
import dc from "services/dc"
import { last } from "ramda"
import { mapBinnedDimensions } from "utils/map-binned-dimensions"
import Services from "services/immerse"
import { TRANSITION_DURATION } from "constants/magic-variables"
import {
  setDateFormatter,
  setValueFormatter
} from "actions/charts-action-creators"
import { getTablesForDataSource } from "components/join-manager/utils"

export function createLineChart(chartId, node, dimension, spec) {
  let chart = null
  const tables = getTablesForDataSource(spec.dataSource)
  if (spec.type === "histogram") {
    chart = dc.barChart(node, tables)
  } else {
    chart = dc.lineChart(node, tables)
  }
  const crossfilter = Services.get("crossfilter").getCrossfilter(
    spec.dataSource,
    chartId
  )
  const xField = spec.dimensions[X_ENCODING_INDEX]
  const yField = spec.measures[Y_ENCODING_INDEX]
  const seriesField = spec.dimensions[SERIES_ENCODING_INDEX]
  const group = dimension.group().reduceCount()
  if (yField.value === "*") {
    group.reduceCount()
  } else {
    group.reduce([
      {
        expression: yField.value,
        agg_mode: toAggMode(yField.aggType),
        name: "val",
        isComposite:
          yField.aggType === "# Unique" ? true : Boolean(yField.custom)
      }
    ])
  }
  chart.dimension(dimension).group(group)

  if (xField.timeBin && !xField.extract) {
    chart
      .rangeInput(spec.rangeInput)
      .binInput(spec.binInput)
      .timeBinInputVal(xField.timeBin)
  }

  const binExtent =
    !spec.isRange && spec.rangeFilter.length
      ? [...last(spec.rangeFilter)]
      : [xField.currentLowValue, xField.currentHighValue]

  if (xField.isBinned) {
    chart.binParams({
      timeBin: spec.isRange && xField.timeBin ? "auto" : xField.timeBin,
      binBounds: binExtent,
      numBins: xField.numOfBins,
      extract: xField.extract
    })
  } else {
    chart.binParams(null)
  }

  chart
    .width(spec.width)
    .height(spec.height)
    .margins({ ...spec.margins })
    .transitionDuration(TRANSITION_DURATION)
    .colorByLayerId(true)
    .elasticX(spec.elasticX)
    .elasticY(spec.elasticY)
    .xAxisLabel(xField.axisLabel || xField.label)
    .yAxisLabel(
      typeof spec.yAxisLabel === "string"
        ? spec.yAxisLabel
        : yField.axisLabel || yField.label
    )
    .brushOn(true)
    .renderHorizontalGridLines(spec.showGrid)
    .enablePopup(!spec.isRange)

  chart.x(xScale(xField).domain(xDomain(xField)))
  chart.xAxis().scale(chart.x()).tickFormat(xAxisTickFormat(xField))
  chart.yAxis().tickFormat(formatNumber)
  if (yField.minMax) {
    chart.y(d3.scale.linear().domain(yField.minMax))
  }

  if (seriesField) {
    chart.dimension().multiDim(false)
    chart.series().group(crossfilter.dimension(seriesField.value).group())
    if (spec.color.customDomain) {
      chart.series().selected(spec.color.customDomain)
    }
  }

  chart.setState = setState.bind(chart)

  if (spec.type === "line") {
    chart
      .renderArea(spec.renderArea)
      .interpolate("linear")
      .defined((d) => d.y !== null)
  }

  if (!spec.isRange && spec.rangeFilter.length) {
    chart.x().domain([...last(spec.rangeFilter)])
  }

  spec.filters.forEach((fltr) => chart.filter(fltr, spec.areFiltersInverse))

  setValueFormatter(chart, spec.measures, spec.type)
  setDateFormatter(chart, spec.dimensions, spec.type)

  return chart
}

export function updateColor(chart, { color, showOther, dimensions }) {
  if (color.type === "solid") {
    chart.ordinalColors(color.val)
    chart.colorAccessor(function getIdx() {
      return this.idx
    })
  } else {
    chart.showOther(showOther)
    chart.series().selected(color.customDomain)
    const colorScale = d3.scale
      .ordinal()
      .domain(color.customDomain)
      .range(
        showOther
          ? color.customRange.concat([color.defaultOtherRange])
          : color.customRange
      )

    chart
      .colorAccessor(customMultiLineAccessor(chart, color))
      .colors(colorScale)

    if (chart.rangeChart() || (!chart.focusChart() && !chart.rangeChart())) {
      const legend = chart.legend(dc.legend()).legend().setKey(color.customKey)

      legend.setTitle(
        process(dimensions[SERIES_ENCODING_INDEX].value, {
          useDisplayName: true
        })
      )
    }
  }
}

export function createLineChartAsync(chartId, chartSpec, node, rangeNode) {
  return new Promise((resolve) => {
    const crossfilter = Services.get("crossfilter").getCrossfilter(
      chartSpec.dataSource,
      chartId
    )
    const projections = chartSpec.dimensions.map((dimension) => dimension.value)
    const dimension = crossfilter.dimension(projections)

    const LineChart = createLineChart(chartId, node, dimension, {
      ...chartSpec,
      isRange: false,
      height: chartSpec.rangeChartEnabled
        ? chartSpec.height * FOCUS_CHART_HEIGHT_RATIO - FOCUS_MARGIN
        : chartSpec.height,
      margins: chartSpec.rangeChartEnabled
        ? DEFAULT_CHART_MARGINS_W_RANGE
        : DEFAULT_CHART_MARGINS,
      filters: chartSpec.filters || [],
      showGrid: true,
      rangeInput: true,
      binInput: true
    })

    if (chartSpec.rangeChartEnabled) {
      const RangeChart = createLineChart(chartId, rangeNode, dimension, {
        ...chartSpec,
        isRange: true,
        height: chartSpec.height * RANGE_CHART_HEIGHT_RATIO,
        margins: DEFAULT_RANGE_MARGINS,
        filters: chartSpec.rangeFilter || [],
        showGrid: false,
        yAxisLabel: ""
      })

      RangeChart.rangeChartEnabled = () => true

      LineChart.rangeChart(RangeChart)

      updateColor(LineChart, chartSpec)
      updateColor(RangeChart, chartSpec)
      const chartInterface = createLineChartInterface(LineChart, RangeChart)
      resolve(chartInterface)
    } else {
      updateColor(LineChart, chartSpec)
      const chartInterface = createLineChartInterface(LineChart)
      resolve(chartInterface)
    }
  })
}

function customMultiLineAccessor(chart, color) {
  function aliasDefaultOtherDomain(defaultOtherDomain, numDomains, isMulti) {
    if (isMulti) {
      return CHARTS_DEFAULT_OTHER_ALIASES.other
    }
    return numDomains
      ? CHARTS_DEFAULT_OTHER_ALIASES.default
      : defaultOtherDomain
  }
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

// eslint-disable-next-line consistent-return
function setState(
  chartSpec,
  { updateRange = false, updateFocus = false } = {}
) {
  if (this.isMulti()) {
    this.showOther(chartSpec.showOther)

    const colorScale = d3.scale
      .ordinal()
      .domain(chartSpec.color.customDomain)
      .range(
        chartSpec.showOther
          ? chartSpec.color.customRange.concat([
              chartSpec.color.defaultOtherRange
            ])
          : chartSpec.color.customRange
      )

    this.colorAccessor(customMultiLineAccessor(this, chartSpec.color)).colors(
      colorScale
    )

    this.series().selected(chartSpec.color.customDomain)

    if (this.rangeChart() || (!this.focusChart() && !this.rangeChart())) {
      const legend = this.legend(dc.legend())
        .legend()
        .setKey(chartSpec.color.customKey)

      legend.setTitle(
        process(chartSpec.dimensions[SERIES_ENCODING_INDEX].value, {
          useDisplayName: true
        })
      )
    }
  }

  const allBinParams = mapBinnedDimensions(chartSpec.dimensions)
  if (updateFocus) {
    const measures = composeMeasures(
      this.dimension(),
      chartSpec.measures,
      chartSpec.type,
      chartSpec
    )

    this.group(measures)
    this.binParams(allBinParams)
  }

  const RangeChart = this.rangeChart()
  if (updateRange && RangeChart) {
    const rangeMeasures = composeMeasures(
      this.dimension(),
      chartSpec.measures,
      chartSpec.type,
      chartSpec
    )

    RangeChart.group(rangeMeasures)
    RangeChart.binParams(allBinParams)
    RangeChart.renderAsync()
  }

  if (updateFocus || this.isMulti()) {
    return this.renderAsync()
  }
}

export const addLineChartEventListeners = (props, dcChart) => {
  const chartListeners = {
    bin: binEventListenerForLine,
    updateBinBounds: updateBinBoundsListener,
    elasticY: elasticYListener,
    elasticX: elasticXListener,
    yBounds: createAxisDomainUpdateFunction(
      "yDomain",
      "measures",
      0,
      createSetter("minMax")
    ),
    xBounds: xAxisDomainListener
  }

  const subscribe = addChartEventListeners(
    Object.assign({}, defaultListeners, chartListeners)
  )
  subscribe(props)(dcChart)
}
