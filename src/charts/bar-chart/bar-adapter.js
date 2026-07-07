// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Chart } from "import-shims/heavyai-d3-combo-chart"
import dc from "services/dc"
import { dispatch } from "d3-dispatch"
import { getLabel } from "./utils"
import { percentageTransform } from "charts/utils/data-transforms"
import { Y_AXIS_ORIENTATIONS } from "constants/charts"
import { BIN_TRANSLATION } from "utils/time-helpers"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { immerseAutoFormatter } from "utils/auto-formatter"

export function dcAdapter(groupName) {
  let _dimension = null // eslint-disable-line no-underscore-dangle
  const _groupName = groupName // eslint-disable-line no-underscore-dangle
  const events = dispatch("redrawGroup")

  function setDimension(dim) {
    _dimension = dim
  }

  function getDimension() {
    return _dimension
  }

  function getFilterString() {
    if (!_dimension) {
      throw new Error(
        "Calling getfilterString before setting a dimension is not allowed."
      )
    }

    return _dimension.group().writeFilter()
  }

  function filter(_filters) {
    if (!_filters || !_filters.length) {
      filterAll()
      return
    }

    _dimension.filterMulti(_filters, undefined, false, [null])
  }

  function filterAll() {
    _dimension.filterAll()
  }

  // create a chart that will allow us to hook into a dc render & redraw calls.
  let dummyChart = dc.baseMixin({})
  // dataAsync is a potential hook for introducing a loading state for the chart
  dummyChart.dataAsync = (callback) => callback()
  dummyChart._doRender = renderRedraw // eslint-disable-line no-underscore-dangle
  dummyChart._doRedraw = renderRedraw // eslint-disable-line no-underscore-dangle
  dummyChart.dimension({})
  dummyChart.group({})
  dummyChart.generatePopup = () => null
  dc.registerChart(dummyChart, groupName)

  function renderRedraw() {
    events.call("redrawGroup", this, getFilterString())
  }

  function redrawGroup() {
    if (dc.startRenderTime()) {
      dc.redrawAllAsync(groupName)
    } else {
      dc.renderAllAsync(groupName)
    }
  }

  function destroy() {
    filterAll()
    events.on("redrawGroup", null)
    dc.deregisterChart(dummyChart, _groupName)
    _dimension.dispose()
    dummyChart = null
  }

  return {
    setDimension,
    getDimension,
    filter,
    filterAll,
    redrawGroup,
    renderRedraw,
    events,
    destroy
  }
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value)
}

export default function barChart(parentNode) {
  let cfg = {
    parentNode,
    margin: {
      top: 32,
      right: 32,
      bottom: 120,
      left: 0
    },
    width: "auto",
    height: "auto",
    palette: null,
    xAxisLabel: "",
    yAxisLabel: "",
    yDomainEditorIsEnabled: false,
    y2DomainEditorIsEnabled: false,
    percentageViewEnabled: false,
    maxXLabelCharCount: null,
    maxYLabelCharCount: null,
    labelsAreRotated: "auto",
    legendIsEnabled: false,
    tooltipIsEnabled: true,
    tooltipFormat: "auto",
    legendTitle: "",
    brushIsEnabled: false,
    binExtent: [],
    timeBin: null,
    extract: null,
    autoBin: null,
    sortBy: null,
    brushExtent: [],
    keyType: "string",
    yTicks: "auto",
    xDomain: "auto",
    yDomain: "auto",
    xLock: false,
    yLock: false,
    hasLeftAxis: false,
    selectedKeys: [],
    measureFormats: [],
    dimensionFormats: []
  }

  const cache = {
    chart: null,
    data: null,
    tooltip: null,
    brush: null,
    binning: null
  }

  // [SCAFFOLDING]: register correct dispatch events
  const events = dispatch(
    "binChange",
    "axisLabelChange",
    "domainChange",
    "autoBinToggle",
    "domainLockToggle",
    "mouseClickPanel"
  )

  // [SCAFFOLDING]: remove binTranslation and binning?
  const binTranslation = {
    ...BIN_TRANSLATION
  }

  function setConfig(_config) {
    cfg = Object.assign({}, cfg, _config)
    let height = cfg.height || "auto"
    let width = cfg.width || "auto"

    if (cfg.width === "auto") {
      width = cfg.parentNode.offsetWidth
    }
    if (cfg.height === "auto") {
      height = cfg.parentNode.offsetHeight
    }

    const percentage = shouldTransformPercentage(cfg)

    const yDomain = percentage ? [0, 1] : cfg.yDomain
    const yDomainEditorIsEnabled = percentage
      ? false
      : cfg.yDomainEditorIsEnabled && cfg.hasLeftAxis

    const extractType = cfg.extract ? cfg.timeBin : null

    const xAxisFormat = immerseAutoFormatter(cfg.dimensionFormats) || "auto"
    const yAxisFormat = immerseAutoFormatter(cfg.measureFormats) || "auto"
    const tooltipFormat = yAxisFormat

    // instantiate the chart if it doesn't exist
    if (!cache.chart) {
      cache.chart = Chart(cfg.parentNode)
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
      chartType: "stackedBar",
      extractType, // isodow, month, quarter, hour, minute
      useScrolling: true,

      // intro animation
      isAnimated: false,
      animationDuration: 1500,

      // scale
      colorSchema: cfg.palette,
      defaultColor: "skyblue",
      xDomain: cfg.xDomain,
      yDomain,
      y2Domain: cfg.y2Domain,
      percentageViewEnabled: cfg.percentageViewEnabled,

      // axis
      tickSizes: 6,
      yTicks: cfg.yTicks,
      y2Ticks: cfg.yTicks,
      xTickSkip: false,
      xAxisFormat,
      yAxisFormat,
      grid: "horizontal",
      yAxisPercentageFormat: percentage ? "auto" : null,
      labelsAreRotated: cfg.labelsAreRotated,
      maxXLabelCharCount: cfg.maxXLabelCharCount,
      maxYLabelCharCount: cfg.maxYLabelCharCount,

      // tooltip
      tooltipIsEnabled: cfg.tooltipIsEnabled,
      tooltipFormat,
      tooltipTitleFormat: xAxisFormat,

      // format
      dateFormat: "%b %d, %Y",
      numberFormat: ".2f",

      // legend
      legendXPosition: "auto",
      legendYPosition: "auto",
      legendTitle: cfg.legendTitle,
      legendIsEnabled: cfg.legendIsEnabled,

      // binning
      binningResolution: binTranslation[cfg.timeBin],
      binningIsAuto: cfg.autoBin,
      binningIsEnabled: cfg.binningIsEnabled,

      // bars/data ordering/sorting
      sortBy: cfg.sortBy,

      // domain
      xLock: cfg.xLock,
      yLock: cfg.yLock,
      xDomainEditorIsEnabled: false, // [SCAFFOLDING] TO DO: enable for numeric & date-time
      yDomainEditorIsEnabled,
      y2DomainEditorIsEnabled: cfg.y2DomainEditorIsEnabled,

      // brush
      brushIsEnabled: false,
      brushRangeIsEnabled: false,

      // label
      xLabel: cfg.xAxisLabel,
      yLabel: cfg.hasLeftAxis ? cfg.yAxisLabel : "",

      // stackedBar specific
      barSpacingPercent: cfg.barSpacingPercent,
      selectedKeys: cfg.selectedKeys,
      stackOffset: "stackOffsetDiverging"
    })

    return this
  }

  function setEvents() {
    // [SCAFFOLDING]: TO DO: get correct events for bar chart, do we include binning?
    cache.chart
      .getEvents()
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
      .onLabel("axisLabelChange", (...args) =>
        events.call("axisLabelChange", this, ...args)
      )
      .onPanel("mouseClickPanel", (...args) =>
        events.call("mouseClickPanel", this, ...args)
      )

    return this
  }

  function render() {
    cache.chart.render()
    return this
  }

  function setData(_data, configSpec) {
    cache.data = transformData(_data, configSpec)
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

  function groupBy(xs, key, groupNulls = false) {
    return xs.reduce((accum, x) => {
      if (x[key] === null && !groupNulls) {
        return accum
      }
      accum[x[key]] = accum[x[key]] || []
      accum[x[key]].push(x)
      return accum
    }, {})
  }

  function mapKey(key) {
    if (Array.isArray(key)) {
      return key[0]
    } else if (key === null) {
      return "NULL"
    }
    return key
  }

  function shouldTransformPercentage(configSpec) {
    return Boolean(
      configSpec.percentageViewEnabled &&
        (configSpec.chartType === "stackedBar" ||
          (configSpec.topN && configSpec.topN.length > 0))
    )
  }

  // [SCAFFOLDING]: TO DO: verify data transformation for bar chart
  function transformData(_data, configSpec) {
    if (_data[0] && _data[0].key1 && configSpec.topN) {
      const cleanedData = _data.filter(
        (d) =>
          typeof d.key1 !== "undefined" &&
          d.key1 !== "undefined" &&
          d.key1 !== null
      )

      const transformedData = shouldTransformPercentage(configSpec)
        ? percentageTransform(cleanedData)
        : cleanedData

      const groups = groupBy(transformedData, "key1")
      // to do: validate configSpec.topN with groups and color palette

      const series = configSpec.topN.map((d, i) => ({
        group: 0, // will always be zero as there's no 2nd axis with series
        id: i,
        label: process(d, { useDisplayName: true }),
        values: groups[d]
          ? groups[d]
              .map((dB) => ({
                x: mapKey(dB.key0),
                y: dB.val,
                ...(dB.countval && { countval: dB.countval }),
                ...(dB.absoluteval && { absoluteval: dB.absoluteval })
              }))
              .reverse()
          : []
      }))

      return { series }
    } else {
      const series = []
      configSpec.measures.forEach((measure, i) => {
        series[i] = {
          group: measure.yAxisOrientation === Y_AXIS_ORIENTATIONS.RIGHT ? 1 : 0, // will be non-zero for 2nd axis
          id: i,
          label: process(getLabel(measure), { useDisplayName: true }),
          values: _data
            .map((d) => ({
              x: mapKey(d.key0),
              y: d[`val${i ? i : ""}`],
              ...(d.countval && { countval: d.countval })
            }))
            .reverse()
        }
      })
      return { series }
    }
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
    setData,
    setEvents,
    setTransformedData,
    getData,
    destroy,
    events,
    transformData
  }
}
