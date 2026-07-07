// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Chart } from "import-shims/heavyai-d3-combo-chart"
import { dispatch } from "d3-dispatch"

import { Y_AXIS_ORIENTATIONS } from "constants/charts"
import { percentageTransform } from "charts/utils/data-transforms"
import {
  getXAxisDimension,
  getCurrentXAxisDomainForChart
} from "reducers/charts/helpers/multi-source-helpers"
import { getLabel, getSeriesID } from "./utils"
import { determineAutoBinInterval, filterTimeBinOption } from "./sql-utils"
import { BIN_TRANSLATION } from "utils/time-helpers"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { immerseAutoFormatter } from "utils/auto-formatter"

const { ENABLE_BRUSH_FILTER_EDITS } = available_feature_flags

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value)
}

// TODO: Please Gawd turn this into an ES6 class at some point
export default function lineChart2(parentNode) {
  let cfg = {
    parentNode,
    margin: {
      top: 32,
      right: 32,
      bottom: 64,
      left: 70
    },
    width: "auto",
    height: "auto",
    palette: null,
    chartType: "line",
    xAxisLabel: "",
    yAxisLabel: "",
    y2AxisLabel: "",
    yDomainEditorIsEnabled: true,
    y2DomainEditorIsEnabled: true,
    shouldTransformPercentage: false,
    legendIsEnabled: false,
    tooltipIsEnabled: true,
    legendTitle: "",
    brushIsEnabled: true,
    // zoom is enabled if we haven't set shift to zoom OR if we have set it and the user is holding the shift key.
    zoomIsEnabled: (e) =>
      !getFeatureFlag(available_feature_flags.UI_SHIFT_TO_ZOOM) || e.shiftKey,
    binExtent: [],
    rangeBrushExtent: [],
    timeBin: null,
    extract: null,
    autoBin: null,
    brushExtent: [],
    keyType: "time",
    yTicks: "auto",
    xDomain: "auto",
    yDomain: "auto",
    y2Domain: "auto",
    xLock: false,
    yLock: false,
    y2Lock: false,
    hasRightAxis: false,
    hasLeftAxis: false,
    yAxisFormat: "auto",
    y2AxisFormat: "auto",
    tooltipFormat: "auto",
    tooltipTitleFormat: "auto",
    xAxisFormat: "auto",
    measureFormats: [],
    dimensionFormats: [],
    forceGroupedBars: true
  }

  const cache = {
    chart: null,
    data: null,
    tooltip: null,
    brush: null,
    binning: null
  }

  const events = dispatch(
    "brushMove",
    "brushEnd",
    "brushStart",
    "brushClear",
    "binChange",
    "axisLabelChange",
    "domainChange",
    "autoBinToggle",
    "domainLockToggle",
    "brushRangeChange",
    "zoom",
    "zoomClear",
    "tooltipHide",
    "tooltipMove"
  )

  const binTranslation = {
    ...BIN_TRANSLATION
  }

  function setConfig(_config) {
    cfg = Object.assign({}, cfg, _config)
    let height = cfg.height || "auto"
    let width = cfg.width || "auto"
    const chartExtent = cfg.rangeBrushExtent || cfg.binExtent

    if (cfg.width === "auto") {
      width = cfg.parentNode.offsetWidth
    }
    if (cfg.height === "auto") {
      height = cfg.parentNode.offsetHeight
    }

    const isBinnedByTime = cfg.timeBin && !cfg.extract
    if (isBinnedByTime) {
      binTranslation.auto = selectAutoTimeBin(chartExtent)
    }

    const percentage = cfg.shouldTransformPercentage
    const shouldLockDomain = percentage && cfg.chartType === "stackedArea"

    const yDomain = shouldLockDomain ? [0, 1] : cfg.yDomain
    const yDomainEditorIsEnabled = shouldLockDomain
      ? false
      : cfg.yDomainEditorIsEnabled && cfg.hasLeftAxis

    const xAxisFormat = immerseAutoFormatter(cfg.dimensionFormats) || "auto"
    const yAxisFormat = immerseAutoFormatter(cfg.measureFormats) || "auto"
    const y2AxisFormat = yAxisFormat

    if (!cache.chart) {
      cache.chart = Chart(cfg.parentNode)
    }

    const timeBin = cfg.timeBin === "auto" ? "isodow" : cfg.timeBin
    const extractType = cfg.extract ? timeBin : null

    let binningToggles = []
    if (chartExtent[0] instanceof Date) {
      binningToggles = filterTimeBinOption(chartExtent)
        .map((op) => binTranslation[op])
        .reverse()
    }

    /* wallpaper over the bugs.
      the "auto" value for xDomain simply doesn't work, and we need to go back and repair/refactor/remove it.

      But we can call setConfig via clearFocusChartExtent (in line2-component), which'll set "auto" here, which will
      break the max x axis. So we intercept an "auto" here and set it to the
      binExtent instead, which *looks* like the right set of values.

    */

    const fullXDomain = getCurrentXAxisDomainForChart(cfg.dimensions)

    if (cfg.xDomain === "auto" && !cfg.extract) {
      cfg.xDomain = cfg.binExtent
    }

    cache.chart.setConfig({
      // common
      margin: {
        top: cfg.margin.top,
        right: cfg.hasRightAxis ? cfg.margin.right * 2 : cfg.margin.right,
        bottom: cfg.margin.bottom,
        left: cfg.margin.left
      },
      width,
      height,
      keyType: cfg.keyType, // time, number, string
      chartType: cfg.chartType, // line, area, stackedArea, bar, stackedBar
      extractType, // isodow, month, quarter, hour, minute

      // intro animation
      isAnimated: false,
      animationDuration: 1500,

      // scale
      colorSchema: cfg.palette,
      defaultColor: "skyblue",
      xDomain: cfg.xDomain,
      fullXDomain,
      yDomain,
      y2Domain: cfg.y2Domain,

      // axis
      tickSizes: 6,
      yTicks: cfg.yTicks,
      y2Ticks: cfg.yTicks,
      xTickSkip: "auto",
      xAxisFormat,
      yAxisFormat,
      y2AxisFormat,
      grid: "horizontal",
      yAxisPercentageFormat: percentage ? "auto" : null,

      // tooltip
      tooltipIsEnabled: false,

      // format
      dateFormat: "%b %d, %Y",
      numberFormat: ".2f",

      // legend
      legendIsEnabled: false,

      // binning
      binningResolution: binTranslation[cfg.timeBin],
      binningIsAuto: cfg.autoBin,
      binningToggles,
      binningIsEnabled: cfg.binningIsEnabled,

      // domain
      xLock: cfg.xLock,
      yLock: cfg.yLock,
      y2Lock: cfg.y2Lock,
      // xAxis domain editing disabled for extract types
      xDomainEditorIsEnabled: !cfg.extract,
      yDomainEditorIsEnabled,
      y2DomainEditorIsEnabled: cfg.y2DomainEditorIsEnabled && cfg.hasRightAxis,

      // brush range
      brushRangeMin: cfg.brushExtent ? cfg.brushExtent[0] : null,
      brushRangeMax: cfg.brushExtent ? cfg.brushExtent[1] : null,
      brushRangeIsEnabled: cfg.binningIsEnabled,
      brushRangeLabelIsEditable: getFeatureFlag(ENABLE_BRUSH_FILTER_EDITS),

      // zoom range
      zoomRangeMin: cfg.rangeBrushExtent ? cfg.rangeBrushExtent[0] : null,
      zoomRangeMax: cfg.rangeBrushExtent ? cfg.rangeBrushExtent[1] : null,

      binExtent: cfg.binExtent,

      // brush
      brushIsEnabled: cfg.brushIsEnabled,
      zoomIsEnabled: cfg.zoomIsEnabled,

      // label
      xLabel: cfg.xAxisLabel,
      yLabel: cfg.hasLeftAxis ? cfg.yAxisLabel : "",
      y2Label: cfg.hasRightAxis ? cfg.y2AxisLabel : "",

      // line
      dotsToShow: "isolated",
      stackOffset: "stackOffsetDiverging",
      forceGroupedBars: true
    })

    return this
  }

  function setEvents() {
    cache.chart
      .getEvents()
      .onBrush("brushMove", (...args) => {
        events.call("brushMove", this, ...args)
      })
      .onBrush("brushEnd", (...args) => events.call("brushEnd", this, ...args))
      .onBrush("brushClear", (...args) =>
        events.call("brushClear", this, ...args)
      )
      .onBinning("change", (d) => {
        if (d.name === "auto") {
          events.call("autoBinToggle", this, { isSelected: d.isSelected })
        } else {
          const bin = getKeyByValue(binTranslation, d.name)
          events.call("binChange", this, bin)
        }
      })
      .onDomainEditor("domainChange", (...args) =>
        events.call("domainChange", this, ...args)
      )
      .onDomainEditor("domainLockToggle", (...args) =>
        events.call("domainLockToggle", this, ...args)
      )
      .onBrushRangeEditor("rangeChange", (...args) =>
        events.call("brushRangeChange", this, ...args)
      )
      .onLabel("axisLabelChange", (...args) =>
        events.call("axisLabelChange", this, ...args)
      )
      /* the zoom events are consumed by line2-focus-chart, and just respectively set
         either setFocusChartExtent or clearFocusChartExtent. This is equivalent to brushing
         on the range chart, and fires the same event.
      */
      .onBrush("zoom", (...args) => events.call("zoom", this, ...args))

      .onBrush("zoomClear", (...args) =>
        events.call("zoomClear", this, ...args)
      )
      .onPanel("mouseOutPanel", (...args) =>
        events.call("tooltipHide", this, ...args)
      )
      .onPanel("mouseMovePanel", (...args) =>
        events.call("tooltipMove", this, ...args)
      )
    return this
  }

  function render() {
    cache.chart.render()
    return this
  }

  function selectAutoTimeBin([currentLowValue, currentHighValue]) {
    return binTranslation[
      determineAutoBinInterval(currentLowValue, currentHighValue)
    ]
  }

  function setData(_data, configSpec) {
    cache.data = {
      series: transformDataMulti(
        _data.length ? { 0: _data } : _data,
        configSpec
      )
    }
    setTransformedData(cache.data)

    return this
  }

  function setTransformedData(_transformedData) {
    cache.chart.setData(_transformedData)

    if (cache.brush) {
      cache.brush.update()
    }
    return this
  }

  function colorDimensionValueMap(dataPoint) {
    return {
      x: Array.isArray(dataPoint.key0) ? dataPoint.key0[0] : dataPoint.key0,
      y: dataPoint.val,
      ...(typeof dataPoint.absoluteval !== "undefined" && {
        absoluteval: dataPoint.absoluteval
      })
    }
  }

  const createMultiMeasureValueMapper = (valueKey) => (dataPoint) => ({
    x: Array.isArray(dataPoint.key0) ? dataPoint.key0[0] : dataPoint.key0,
    y: dataPoint[valueKey]
  })

  const colorToSeriesDatum = (
    dataByColorKey,
    multiSourceIndex,
    dimensionNames,
    measureName,
    yAxisOrientation
  ) => (colorObject, colorIndex) => ({
    group: yAxisOrientation === Y_AXIS_ORIENTATIONS.RIGHT ? 1 : 0,
    id: getSeriesID(multiSourceIndex, colorIndex),
    sourceIndex: multiSourceIndex,
    label: colorObject.key,
    dimensionName: dimensionNames[multiSourceIndex],
    measureName,
    values: (dataByColorKey[colorObject.key] || [])
      .map(colorDimensionValueMap)
      .reverse()
  })

  const measureToSeriesDatum = (multiSourceIndex, dimensionNames, dataSets) => (
    measure,
    measureIndex
  ) => ({
    group: measure.yAxisOrientation === Y_AXIS_ORIENTATIONS.RIGHT ? 1 : 0, // will be non-zero for 2nd axis
    id: getSeriesID(multiSourceIndex, measureIndex),
    sourceIndex: multiSourceIndex,
    label: getLabel(measure),
    dimensionName: dimensionNames[multiSourceIndex],
    measureName: measure.name,
    dataSourceName: measure.table,
    values: dataSets[multiSourceIndex]
      .map(
        createMultiMeasureValueMapper(
          `val${measureIndex === 0 ? "" : measureIndex}`
        )
      )
      .reverse()
  })

  const groupListByKey = (list, key) =>
    list.reduce((groups, item) => {
      groups[item[key]] = groups[item[key]]
        ? [...groups[item[key]], ...[item]]
        : [item]
      return groups
    }, [])

  // - Get the data series for each source
  // - If there's a color dimension, split up the data by color group
  const getDataSeriesForSource = (
    dataSets,
    configSpec,
    dimensionNamesByMDSI
  ) => (measures) => {
    const multiSourceIndex = (measures && measures[0].multiSourceIndex) || 0

    const dataForSource = dataSets[multiSourceIndex]
    if (!dataForSource) {
      return []
    }

    const hasColorDimension = dataForSource[0] && dataForSource[0].key1

    if (hasColorDimension) {
      const transformedData = configSpec.shouldTransformPercentage
        ? percentageTransform(dataForSource)
        : dataForSource
      const dataGroupedByColorKey = transformedData.reduce(
        (result, d) => ({
          ...result,
          [d.key1]: result[d.key1] ? [...result[d.key1], ...[d]] : [d]
        }),
        {}
      )

      // If there is a color dimension, there will only be one measure
      const measureName = measures[0].name
      const yAxisOrientation = measures[0].yAxisOrientation
      const colorSet = configSpec.palette
        .filter((c) => c.multiSourceIndex === multiSourceIndex)
        .map(
          colorToSeriesDatum(
            dataGroupedByColorKey,
            multiSourceIndex,
            dimensionNamesByMDSI,
            measureName,
            yAxisOrientation
          )
        )
      return colorSet
    } else {
      return measures.map(
        measureToSeriesDatum(multiSourceIndex, dimensionNamesByMDSI, dataSets)
      )
    }
  }

  function transformDataMulti(dataSets, configSpec) {
    // Index dimensions by multiSourceIndex
    const dimensionsByMDSI = groupListByKey(
      configSpec.dimensions,
      "multiSourceIndex"
    )
    // For each multiSourceIndex, get the dimension associated with the X Axis
    // label (non-color dimensions)
    const dimensionNamesByMDSI = dimensionsByMDSI.map(
      (dimensions) => getXAxisDimension(dimensions).label
    )
    // Get measures by multiSourceIndex
    const measuresBySource = groupListByKey(
      configSpec.measures,
      "multiSourceIndex"
    )
    // Get data series for each source
    const dataSeriesBySource = measuresBySource.map(
      getDataSeriesForSource(dataSets, configSpec, dimensionNamesByMDSI)
    )
    return dataSeriesBySource.reduce(
      (result, sourceDataSeries) => [...result, ...sourceDataSeries],
      []
    )
  }

  function getData() {
    return cache.data
  }

  function destroy() {
    cache.chart.destroy()
    return this
  }

  return {
    render,
    setConfig,
    setEvents,
    setData,
    setTransformedData,
    getData,
    destroy,
    events
  }
}
