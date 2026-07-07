// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * This is actually bubble chart. If you're looking for scatter chart, look in
 * src/charts/raster-chart
 */

import { createProjectMeasures, createSetter, setScales } from "utils/helpers"
import { TRANSITION_DURATION } from "constants/magic-variables"
import defaultListeners, {
  createAxisDomainUpdateFunction,
  elasticXListener,
  elasticYListener,
  createD3CustomDomainRangeUpdateListener
} from "charts/utils/event-listeners"
import { formatNumber, xAxisTickFormat } from "charts/utils/coordinate-helpers"
import addChartEventListeners from "charts/utils/add-chart-event-listeners"
import colorChart from "charts/utils/color-chart"
import composeDimensions from "charts/utils/compose-dimensions"
import composeMeasures from "charts/utils/compose-measures"
import createUpdateFunctionForChart from "charts/utils/create-update-function-for-chart"
import d3 from "services/d3"
import dc from "services/dc"
import generalChartUpdate from "charts/utils/general-chart-update"
import { isEmpty } from "utils/selector-helpers"
import { mapBinnedDimensions } from "utils/map-binned-dimensions"
import { merge } from "lodash"
import promisifyChartCreation from "charts/utils/promisify-chart-creation"
import specificChartUpdates from "charts/utils/specific-chart-updates"
import { setDateFormatter } from "actions/charts-action-creators"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { getTablesForDataSource } from "components/join-manager/utils"
import { importableStore as store } from "store/importableStore"
import { immerseAutoFormatter } from "utils/auto-formatter"

// When the bubble chart doesn't have a size measure, bubble sizes are
// constrained to a fixed radius. These are the min / max pixel radii that the
// user can set:
export const MIN_BUBBLE_RADIUS = 2
export const MAX_BUBBLE_RADIUS = 100
export const DEFAULT_BUBBLE_RADIUS = 10

// When the bubble chart has a size measure defined, bubble radii are scaled
// according to the width of the chart, like this (in heavyai-charting)
//  - [x axis width in pixels] * [size multiplier]
//  - We allow the user to change the upper and lower size *multipliers* that
//    determine the range of bubble sizes that appear in the chart
//
// Lower bound
//  - default size multiplier is DEFAULT_SMALLEST_BUBBLE_RELATIVE_SIZE
//  - minimum possible size multiploer is BUBBLE_RELATIVE_SIZE_MINIMUM
//    - Absolute minimum is 2px, should the above value become equal to less
//      than two pixels. This logic is in heavyai-charting, in bubble-chart.js /
//      plotData()
//
// Upper bound
//  - default size multiplier is DEFAULT_LARGEST_BUBBLE_RELATIVE_SIZE
//  - maximum possible size multiplier = BUBBLE_RELATIVE_SIZE_MAXIMUM
export const DEFAULT_SMALLEST_BUBBLE_RELATIVE_SIZE = 0.004
export const DEFAULT_LARGEST_BUBBLE_RELATIVE_SIZE = 0.04
export const BUBBLE_RELATIVE_SIZE_MINIMUM = 0.001
export const BUBBLE_RELATIVE_SIZE_MAXIMUM = 0.25

// If the user has a "size" measure - which is the measure that determines the
// size of the bubbles in the bubble chart based on the column selected
export const hasSizeMeasure = (chartSpec) => {
  return chartSpec.measures.some(
    (measure) => measure.name === "size" && !measure.isError && measure.value
  )
}

export function mapSpecToHeader({ measures, dimensions }) {
  const popupHeader = []

  popupHeader.push({
    type: "dimension",
    label: process(
      dimensions.map((d) => d.label).reduce((a, b) => `${a} / ${b}`),
      { useDisplayName: true }
    )
  })

  measures.forEach((measure) => {
    if (measure.value) {
      popupHeader.push({
        type: "measure",
        label: process(measure.label, { useDisplayName: true }),
        alias: measure.name
      })
    }
  })
  return popupHeader
}

export function createScatterChart(crossFilter) {
  return function Scatter(chartSpec, node, callback) {
    try {
      const tables = getTablesForDataSource(chartSpec.dataSource)
      const ScatterChart = dc.bubbleChart(node, tables)
      const popupHeader = mapSpecToHeader(chartSpec)
      const sizeMeasureSet = hasSizeMeasure(chartSpec)

      const [smallestBubbleRelativeSize, largestBubbleRelativeSize] =
        chartSpec.sizedBubbleRelativeSizeRange || []

      ScatterChart.width(chartSpec.width)
        .height(chartSpec.height)
        .margins({ top: 16, right: 24, bottom: 40, left: 48 })
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .cap(chartSpec.cap)
        .othersGrouper(false)
        .keyAccessor((d) => d.x)
        .valueAccessor((d) => d.y)
        .radiusValueAccessor(radiusValueAccessor)
        .colorAccessor((d) => d.key0)
        .transitionDuration(TRANSITION_DURATION)
        .xAxisLabel(
          chartSpec.measures[0].axisLabel || chartSpec.measures[0].label
        )
        .yAxisLabel(
          chartSpec.measures[1].axisLabel || chartSpec.measures[1].label
        )
        .elasticX(chartSpec.elasticX)
        .elasticY(chartSpec.elasticY)
        .xAxisPadding("4%")
        .yAxisPadding("4%")
        .setPopupHeader(popupHeader)
        .hasSizeMeasure(sizeMeasureSet)
        .minRadius(chartSpec.unsizedBubbleRadius || DEFAULT_BUBBLE_RADIUS)
        .minBubbleRelativeSize(
          smallestBubbleRelativeSize || DEFAULT_SMALLEST_BUBBLE_RELATIVE_SIZE
        )
        .maxBubbleRelativeSize(
          largestBubbleRelativeSize || DEFAULT_LARGEST_BUBBLE_RELATIVE_SIZE
        )

      const mapping = store
        .getState()
        .sharedSettings.mappings.find(
          (m) => m.id === chartSpec.color?.paletteMappingId
        )?.mapping
      if (
        (mapping ??
          (chartSpec.color?.customDomain && chartSpec.color?.customRange)) &&
        chartSpec.dimensions.length === 1
      ) {
        ScatterChart.customDomain(
          mapping?.customDomain ?? chartSpec.color.customDomain
        )
        ScatterChart.customRange(
          mapping?.customRange ?? chartSpec.color.customRange
        )
      }

      if (mapping) {
        ScatterChart.colorMappingDomain(mapping.customDomain)
        ScatterChart.colorMappingRange(mapping.customRange)
      }

      const dimensions = composeDimensions(crossFilter, chartSpec)
      const measures = composeMeasures(
        dimensions,
        chartSpec.measures,
        "scatter",
        chartSpec
      )

      setScales(ScatterChart, "preRender", true)
      setScales(ScatterChart, "preRedraw", true)
      ScatterChart.dimension(dimensions).group(measures)
      ScatterChart.showNullDimensions(chartSpec.showNullDimensions)

      const allBinParams = mapBinnedDimensions(chartSpec.dimensions)
      ScatterChart.binParams(allBinParams)

      if (chartSpec.measures[0].minMax) {
        ScatterChart.x(d3.scale.linear().domain(chartSpec.measures[0].minMax))
        ScatterChart.xAxis()
          .scale(ScatterChart.x())
          .tickFormat(xAxisTickFormat({}))
      }

      if (chartSpec.measures[1].minMax) {
        ScatterChart.y(d3.scale.linear().domain(chartSpec.measures[1].minMax))
        ScatterChart.yAxis().scale(ScatterChart.y()).tickFormat(formatNumber)
      }

      const measureFormats = chartSpec.measures
        .filter((d) => d.numberFormat)
        .map((d) => ({
          key: process(d.label, { trackUsage: false }),
          format: d.numberFormat
        }))

      ScatterChart.valueFormatter(immerseAutoFormatter(measureFormats))
      setDateFormatter(ScatterChart, chartSpec.dimensions, chartSpec.type)

      colorChart(
        ScatterChart,
        chartSpec,
        () => callback(null, ScatterChart),
        mapping
      )
    } catch (e) {
      return callback(e)
    }
  }
}

export const createScatterChartAsync = promisifyChartCreation(
  createScatterChart
)

// These are actions that fire in response to specific changes in the chartSpec
// (matched on object key)
const scatterUpdateMethods = {
  // e.g. When the user changes a bubble chart's measures, run this function to
  // update the heavyai-charting chart accordingly
  measures(chart, updates, chartSpec) {
    let measures = composeMeasures(
      chart.dimension(),
      updates.measures,
      chartSpec.type,
      chartSpec
    )

    if (isEmpty(chartSpec.dimensions)) {
      chart.dimension().projectOn(createProjectMeasures(updates.measures))

      measures = () => 0
    }

    chart
      .xAxisLabel(
        chartSpec.measures[0].axisLabel || chartSpec.measures[0].label
      )
      .yAxisLabel(
        chartSpec.measures[1].axisLabel || chartSpec.measures[1].label
      )

    const popupHeader = mapSpecToHeader(chartSpec)

    chart.group(measures).setPopupHeader(popupHeader)

    const allBinParams = mapBinnedDimensions(chartSpec.dimensions)
    chart.binParams(allBinParams)

    // Set different bubble sizing parameters depending on whether or not the
    // chart has a size measure
    const sizeMeasureSet = hasSizeMeasure(chartSpec)
    chart.hasSizeMeasure(sizeMeasureSet)
    if (sizeMeasureSet) {
      const [smallestBubbleRelativeSize, largestBubbleRelativeSize] =
        chartSpec.sizedBubbleRelativeSizeRange || []
      chart.minBubbleRelativeSize(
        smallestBubbleRelativeSize || DEFAULT_SMALLEST_BUBBLE_RELATIVE_SIZE
      )
      chart.maxBubbleRelativeSize(
        largestBubbleRelativeSize || DEFAULT_LARGEST_BUBBLE_RELATIVE_SIZE
      )
    } else {
      chart.minRadius(chartSpec.unsizedBubbleRadius || DEFAULT_BUBBLE_RADIUS)
    }
  },
  // This gets called when the user doesn't have a size measure on their bubble
  // chart and they update the bubble size
  unsizedBubbleRadius(chart, updates) {
    chart.minRadius(updates.unsizedBubbleRadius || DEFAULT_BUBBLE_RADIUS)
  },
  // This gets called when the user has a size measure on their bubble chart and
  // they update the bubble size range
  sizedBubbleRelativeSizeRange(chart, updates) {
    const [smallestBubbleRelativeSize, largestBubbleRelativeSize] =
      updates.sizedBubbleRelativeSizeRange || []
    chart.minBubbleRelativeSize(
      smallestBubbleRelativeSize || DEFAULT_SMALLEST_BUBBLE_RELATIVE_SIZE
    )
    chart.maxBubbleRelativeSize(
      largestBubbleRelativeSize || DEFAULT_LARGEST_BUBBLE_RELATIVE_SIZE
    )
  }
}

function radiusValueAccessor(d) {
  return typeof d.size === "undefined" ? DEFAULT_BUBBLE_RADIUS : d.size
}

const allUpdates = merge({}, specificChartUpdates, scatterUpdateMethods)
export const updateScatterChart = createUpdateFunctionForChart(
  generalChartUpdate,
  allUpdates
)
export const addScatterChartEventListeners = addChartEventListeners(
  Object.assign({}, defaultListeners, {
    elasticX: elasticXListener,
    elasticY: elasticYListener,
    xBounds: createAxisDomainUpdateFunction(
      "xDomain",
      "measures",
      0,
      createSetter("minMax")
    ),
    yBounds: createAxisDomainUpdateFunction(
      "yDomain",
      "measures",
      1,
      createSetter("minMax")
    ),
    postRedraw: createD3CustomDomainRangeUpdateListener([
      "postRender",
      "postRedraw"
    ])
  })
)
