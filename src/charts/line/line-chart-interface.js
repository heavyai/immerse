// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createLineChart, updateColor } from "./line"
import {
  DEFAULT_CHART_MARGINS,
  DEFAULT_CHART_MARGINS_W_RANGE,
  DEFAULT_RANGE_MARGINS,
  FOCUS_CHART_HEIGHT_RATIO,
  FOCUS_MARGIN,
  MAX_RANGE_HEIGHT_IN_PX,
  MIN_RANGE_HEIGHT_IN_PX,
  RANGE_CHART_HEIGHT_RATIO,
  SERIES_ENCODING_INDEX,
  X_ENCODING_INDEX,
  Y_ENCODING_INDEX
} from "./line-chart-constants"
import {
  xAxisTickFormat,
  xDomain,
  xScale
} from "charts/utils/coordinate-helpers"
import { toAggMode } from "utils/selector-helpers"
import Services from "services/immerse"
import { registry } from "./line-chart-registry"

export default function createLineChartInterface(
  _focusChart,
  _rangeChart = null
) {
  const focus = _focusChart
  let range = _rangeChart

  const chartInterface = {
    // eslint-disable-next-line no-underscore-dangle
    __dcFlag__: focus.__dcFlag__,
    focus: getFocus,
    range: getRange,
    renderAsync,
    redrawAsync,
    on,
    filter: setFilter,
    filters,
    resize,
    setState,
    updateColorSolid: updateColorSolidHandler,
    disableRangeChart,
    enableRangeChart,
    setExtractInterval,
    setDateTruncInterval,
    setSeriesDimension,
    updateGroupAggregation,
    updateBinExtent,
    renderArea,
    destroyChart,
    toggleBinning
  }

  // eslint-disable-next-line no-underscore-dangle
  registry[focus.__dcFlag__] = chartInterface

  function setFilter(rangeFilter) {
    if (range && rangeFilter.length === 0) {
      range.filter(rangeFilter)
    }

    focus.filter(rangeFilter)
    focus.redrawGroup()
  }

  function filters() {
    return focus.filters()
  }

  function on(...listeners) {
    focus.on(...listeners)
  }

  function getFocus() {
    return focus
  }

  function getRange(chart) {
    if (!arguments.length) {
      return range
    }
    range = chart

    return chartInterface
  }

  function renderAsync() {
    return range
      ? Promise.all([range.renderAsync(), focus.renderAsync()])
      : focus.renderAsync()
  }

  function redrawAsync() {
    return range
      ? Promise.all([range.redrawAsync(), focus.redrawAsync()])
      : focus.redrawAsync()
  }

  function resize(width, height) {
    if (range) {
      focus.height(height * FOCUS_CHART_HEIGHT_RATIO - FOCUS_MARGIN)
      focus.width(width)
      range.height(
        Math.min(
          Math.max(height * RANGE_CHART_HEIGHT_RATIO, MIN_RANGE_HEIGHT_IN_PX)
        ),
        MAX_RANGE_HEIGHT_IN_PX
      )
      range.width(width)
    } else {
      focus.height(height)
      focus.width(width)
    }

    return renderAsync()
  }

  function setState(state) {
    focus.setState(state)
    if (range) {
      range.setState(state)
    }
  }

  function updateColorSolidHandler(color) {
    updateColor(focus, { color })
    if (range) {
      updateColor(range, { color })
    }
  }

  function disableRangeChart() {
    focus.rangeChart(null)
    range.destroyChart()
    focus.height(focus.height() * (4 / 3))
    focus.margins(DEFAULT_CHART_MARGINS)
    focus.renderHorizontalGridLines(false)
    range = null
  }

  function enableRangeChart(spec) {
    const height = focus.height()
    const rangeChartSpec = {
      ...spec,
      filters: [],
      height: height * RANGE_CHART_HEIGHT_RATIO,
      margins: DEFAULT_RANGE_MARGINS,
      showGrid: false,
      isRange: true,
      yAxisLabel: ""
    }

    const rangeChart = createLineChart(
      spec.id,
      document.getElementById(`chart${spec.id}-range`),
      focus.dimension(),
      rangeChartSpec
    )

    focus.rangeChart(rangeChart)
    focus.height(height * FOCUS_CHART_HEIGHT_RATIO)
    focus.margins(DEFAULT_CHART_MARGINS_W_RANGE)
    focus.renderHorizontalGridLines(true)
    updateColor(rangeChart, rangeChartSpec)
    range = rangeChart
  }

  function updateBinParams(xField, binParams) {
    if ((range && !range.filters().length) || !range) {
      focus.binParams(binParams)
      focus.timeBinInputVal(xField.timeBin)

      focus.x(xScale(xField).domain(xDomain(xField)))
      focus.xAxis().scale(focus.x()).tickFormat(xAxisTickFormat(xField))

      if (xField.timeBin && !xField.extract) {
        focus.rangeInput(true).binInput(true)
      }
    }

    if (range) {
      if (xField.extract || !xField.timeBin) {
        focus.binParams(binParams)
        focus.timeBinInputVal(xField.timeBin)

        focus.x(xScale(xField).domain(xDomain(xField)))

        range.binParams(binParams)
        range.timeBinInputVal(xField.timeBin)
        range.x(xScale(xField).domain(xDomain(xField)))
        range.xAxis().scale(range.x()).tickFormat(xAxisTickFormat(xField))
      } else if (range.group().binParams()[X_ENCODING_INDEX].extract) {
        focus.binParams({
          timeBin: "auto",
          binBounds: [xField.currentLowValue, xField.currentHighValue],
          numBins: xField.numOfBins,
          extract: false
        })
        focus.timeBinInputVal(binParams.timeBin)

        focus.x(xScale(xField).domain(xDomain(xField)))

        range.binParams({
          timeBin: "auto",
          binBounds: [xField.currentLowValue, xField.currentHighValue],
          numBins: xField.numOfBins,
          extract: false
        })
        range.timeBinInputVal(xField.timeBin)
        range.x(xScale(xField).domain(xDomain(xField)))
        range.xAxis().scale(range.x()).tickFormat(xAxisTickFormat(xField))
      }
    }
  }

  function setExtractInterval(xField) {
    focus.rangeInput(false)
    focus.binInput(false)
    if (range) {
      range.rangeInput(false)
      range.binInput(false)
    }

    const binParams = focus.group().binParams()
    binParams[X_ENCODING_INDEX].timeBin = xField.timeBin
    binParams[X_ENCODING_INDEX].extract = true
    updateBinParams(xField, binParams)
  }

  function setDateTruncInterval(xField) {
    const binParams = focus.group().binParams()
    binParams[X_ENCODING_INDEX].timeBin = xField.timeBin
    binParams[X_ENCODING_INDEX].extract = false
    binParams[X_ENCODING_INDEX].auto = false
    updateBinParams(xField, binParams)
  }

  function setSeriesDimension(chartId, spec, [focusFilter, rangeFilter]) {
    setFilter([])
    const crossfilter = Services.get("crossfilter").getCrossfilter(
      spec.dataSource,
      chartId
    )
    const xField = spec.dimensions[X_ENCODING_INDEX]
    const seriesField = spec.dimensions[SERIES_ENCODING_INDEX]
    const projections = spec.dimensions.map((dimension) => dimension.value)
    const dimension = crossfilter.dimension(projections)
    const measure = spec.measures[Y_ENCODING_INDEX]

    focus.dimension(dimension).group(dimension.group().reduceCount())

    if (measure.value === "*") {
      focus.group(dimension.group().reduceCount())
    } else {
      focus.group(
        dimension.group().reduce([
          {
            expression: measure.value,
            agg_mode: toAggMode(measure.aggType),
            name: "val",
            isComposite:
              measure.aggType === "# Unique" ? true : Boolean(measure.custom)
          }
        ])
      )
    }

    focus.binParams({
      timeBin: xField.timeBin,
      binBounds: [xField.currentLowValue, xField.currentHighValue],
      numBins: xField.numOfBins,
      extract: xField.extract
    })

    if (seriesField) {
      focus.dimension().multiDim(false)
      focus.series().selected(null)
      focus.series().group(crossfilter.dimension(seriesField.value).group())
    }

    focus.filter(focusFilter || [])

    if (range) {
      const binParams = range.group().binParams()[X_ENCODING_INDEX]

      range.dimension(dimension).group(dimension.group().reduceCount())

      if (measure.value === "*") {
        range.group(dimension.group().reduceCount())
      } else {
        range.group(
          dimension.group().reduce([
            {
              expression: measure.value,
              agg_mode: toAggMode(measure.aggType),
              name: "val",
              isComposite:
                measure.aggType === "# Unique" ? true : Boolean(measure.custom)
            }
          ])
        )
      }

      if (xField.extract) {
        range.binParams({
          timeBin: xField.timeBin,
          binBounds: [xField.currentLowValue, xField.currentHighValue],
          numBins: xField.numOfBins,
          extract: xField.extract
        })
      } else {
        range.binParams(binParams)
      }

      if (seriesField) {
        range.dimension().multiDim(false)
        range.series().selected(null)

        range.series().group(crossfilter.dimension(seriesField.value).group())
      }

      range.filter(rangeFilter || [])
      if (rangeFilter) {
        focus.x().domain([...rangeFilter])
      }
    }
  }

  function updateGroupAggregation(spec) {
    const measure = spec.measures[Y_ENCODING_INDEX]
    const dimension = focus.dimension()
    const xField = spec.dimensions[X_ENCODING_INDEX]

    if (measure.value === "*") {
      focus.group(dimension.group().reduceCount())
    } else {
      focus.group(
        dimension.group().reduce([
          {
            expression: measure.value,
            agg_mode: toAggMode(measure.aggType),
            name: "val",
            isComposite:
              measure.aggType === "# Unique" ? true : Boolean(measure.custom)
          }
        ])
      )
    }

    focus.binParams({
      timeBin: xField.timeBin,
      binBounds: [xField.currentLowValue, xField.currentHighValue],
      numBins: xField.numOfBins,
      extract: xField.extract
    })

    if (range) {
      const binParams = range.group().binParams()[X_ENCODING_INDEX]

      if (measure.value === "*") {
        range.group(dimension.group().reduceCount())
      } else {
        range.group(
          dimension.group().reduce([
            {
              expression: measure.value,
              agg_mode: toAggMode(measure.aggType),
              name: "val",
              isComposite:
                measure.aggType === "# Unique" ? true : Boolean(measure.custom)
            }
          ])
        )
      }

      if (xField.extract) {
        range.binParams({
          timeBin: xField.timeBin,
          binBounds: [xField.currentLowValue, xField.currentHighValue],
          numBins: xField.numOfBins,
          extract: xField.extract
        })
      } else {
        range.binParams(binParams)
      }
    }
  }

  function toggleBinning(spec) {
    const xField = spec.dimensions[X_ENCODING_INDEX]
    if (xField.isBinned) {
      focus.binParams({
        timeBin: xField.timeBin,
        binBounds: [xField.currentLowValue, xField.currentHighValue],
        numBins: xField.numOfBins,
        extract: xField.extract
      })
      if (range) {
        range.binParams({
          timeBin: xField.timeBin,
          binBounds: [xField.currentLowValue, xField.currentHighValue],
          numBins: xField.numOfBins,
          extract: xField.extract
        })
      }
    } else {
      focus.binParams(null)
      if (range) {
        range.binParams(null)
      }
    }
  }

  function updateBinExtent(spec) {
    const binParams = [...focus.group().binParams()]
    const xField = spec.dimensions[X_ENCODING_INDEX]
    binParams[X_ENCODING_INDEX] = {
      ...binParams[X_ENCODING_INDEX],
      binBounds: [xField.currentLowValue, xField.currentHighValue],
      numBins: xField.numOfBins
    }

    updateBinParams(xField, binParams)
  }

  function destroyChart() {
    // eslint-disable-next-line no-underscore-dangle
    delete registry[chartInterface.__dcFlag__]
    if (range) {
      disableRangeChart()
    }
    focus.destroyChart()
  }

  function renderArea(area) {
    focus.renderArea(area)
    if (range) {
      range.renderArea(area)
    }
  }

  return chartInterface
}
