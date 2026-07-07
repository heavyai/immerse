// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { curry, omit, pick } from "ramda"
import barChart, { dcAdapter } from "./bar-adapter"
import React, { Component } from "react"
import PropTypes from "prop-types"
import deepEquals from "fast-deep-equal"
import cx from "classnames"
import {
  setChartAdapterDimensionMapping,
  removeChartAdapterDimensionMapping,
  registerDCAdapter,
  deregisterDCAdapter
} from "utils/chart-adapter-mappings"
import MapDCChartAxisOverlay from "components/chart-axis-overlay"
import { autoSetMarginBottom, getMaxCharsForAxisLength } from "./utils"
import { SHORT_BOTTOM_MARGIN, BAR_SPACING_PERCENT } from "./bar-constants"
import { varExtractRegex } from "components/parameters/validation"

const configSpecShape = {
  palette: PropTypes.array,
  topN: PropTypes.array,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
  timeBin: PropTypes.string,
  extract: PropTypes.bool,
  autoBin: PropTypes.bool,
  binExtent: PropTypes.array,
  keyType: PropTypes.string,
  legendTitle: PropTypes.string,
  legendIsEnabled: PropTypes.bool,
  yDomain: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string // can be "auto"
  ]),
  percentageViewEnabled: PropTypes.bool,
  xLock: PropTypes.bool,
  yLock: PropTypes.bool,
  measures: PropTypes.array,
  hasLeftAxis: PropTypes.bool,
  sortBy: PropTypes.string,
  measureFormats: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      format: PropTypes.string
    })
  ),
  dimensionFormats: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      format: PropTypes.string
    })
  )
}

// Returns true if the value of a parameter that is used as a dimension has changed
const hasChangedDimensionParameterValues = (
  { parameterValues },
  { parameterValues: nextParameterValues, querySpec }
) => {
  const changedParameterValues = new Set()
  Object.keys(nextParameterValues).forEach((name) => {
    if (parameterValues[name] !== nextParameterValues[name]) {
      changedParameterValues.add(name)
    }
  })

  return querySpec.dimensions.some((dimension) => {
    const paramsInDimension =
      (dimension.value && dimension.value.match(varExtractRegex)) || []
    return paramsInDimension.some((paramName) =>
      changedParameterValues.has(paramName)
    )
  })
}

export default class BarChartComponent extends Component {
  static propTypes = {
    addChartFilter: PropTypes.func.isRequired,
    removeChartFilter: PropTypes.func.isRequired,
    clearChartFilterString: PropTypes.func.isRequired,
    configSpec: PropTypes.shape(configSpecShape),
    crossfilter: PropTypes.object,
    data: PropTypes.array,
    dataSource: PropTypes.string.isRequired,
    destroyChart: PropTypes.func.isRequired,
    fetchData: PropTypes.func.isRequired,
    filters: PropTypes.arrayOf(PropTypes.string),
    last_streaming_request: PropTypes.number,
    id: PropTypes.string.isRequired,
    isLoadingData: PropTypes.bool,
    querySpec: PropTypes.object,
    userConfiguredAxisLength: PropTypes.number,
    userConfiguredAxisFontSize: PropTypes.number,
    setAutoBin: PropTypes.func.isRequired,
    setBinning: PropTypes.func.isRequired,
    setFilterString: PropTypes.func.isRequired,
    setXAxisDomain: PropTypes.func.isRequired,
    setXAxisLabel: PropTypes.func.isRequired,
    setYAxisDomain: PropTypes.func.isRequired,
    setYAxisLabel: PropTypes.func.isRequired,
    toggleXDomainLock: PropTypes.func.isRequired,
    toggleYDomainLock: PropTypes.func.isRequired
  }

  componentDidMount() {
    const cfg = this.props.configSpec
    this.hasChanges = false

    this.barChart = barChart(this.chartRef)

    this.dcAdapter = this.setAdapter(
      this.props.dataSource,
      this.props.crossfilter.dimension(this.props.querySpec.dimensions[0].value)
    )

    const { w, h } = this.getSize()
    this.width = w
    this.height = h
    this.margin = {
      top: 32,
      right: 32,
      bottom: SHORT_BOTTOM_MARGIN,
      left: 70
    }

    this.setChartConfig({
      margin: this.margin,
      width: w,
      height: h,
      palette: cfg.palette,
      xAxisLabel: cfg.xAxisLabel,
      yAxisLabel: cfg.yAxisLabel,
      autoBin: cfg.autoBin,
      binExtent: cfg.binExtent,
      timeBin: cfg.timeBin,
      binningIsEnabled: Boolean(cfg.timeBin && !cfg.extract),
      extract: cfg.extract,
      keyType: cfg.keyType,
      legendIsEnabled: cfg.legendIsEnabled,
      legendTitle: cfg.legendTitle,
      yDomain: cfg.yDomain,
      xLock: cfg.xLock,
      yLock: cfg.yLock,
      percentageViewEnabled: cfg.percentageViewEnabled,
      hasLeftAxis: cfg.hasLeftAxis,
      sortBy: cfg.sortBy,
      measureFormats: cfg.measureFormats,
      dimensionFormats: cfg.dimensionFormats,
      maxXLabelCharCount: getMaxCharsForAxisLength(
        this.props.userConfiguredAxisLength,
        this.props.userConfiguredAxisFontSize
      ),
      barSpacingPercent: BAR_SPACING_PERCENT,
      topN: cfg.topN,
      selectedKeys: this.props.filters || null
    })

    this.setEvents()
    this.bindListeners()

    // this checks for an existing filterString from a crossfilter applied before the chart existed
    this.dcAdapter.renderRedraw()

    this.fetchData(this.props)

    if (this.props.filters.length > 0) {
      // fire crossfiltering on other charts
      this.dcAdapter.filter(this.props.filters)
    }
  }

  shouldComponentUpdate() {
    return this.isVisible
  }

  UNSAFE_componentWillUpdate(_nextProps) {
    this.hasChanges = false
    const hasChanged = this.isDifferent(_nextProps, this.props)
    const hasChangedFromKeys = this.isDifferentFromKeys(_nextProps, this.props)

    const hasDimensionChanges = hasChanged((d) =>
      // Omit the auto-detected topN property - it is derived from the other props
      // also axisLabel, because that shouldn't trigger fetching new data
      d.querySpec.dimensions.map((dimension) =>
        omit(["topN", "axisLabel"], dimension)
      )
    )

    const hasQuerySpecChanges =
      hasChanged((d) => d.last_streaming_request) ||
      hasChangedFromKeys(
        [
          "measures",
          "dataSource",
          "filterString",
          "showOther",
          "sortColumn",
          "showNullDimensions",
          "numberGroups",
          "customColorAssignment"
        ],
        (d) => d.querySpec
      )

    if (
      hasQuerySpecChanges ||
      hasDimensionChanges ||
      // Parameter values don't modify the chart spec; they're only processed
      // when a query is fired.
      hasChanged((d) => d.parameterValues)
    ) {
      const colorGroupsShouldReset =
        hasChanged((d) =>
          // Any dimension changes except those to the derived topN, showOther and axisLabel should
          // trigger a new top N preflight query and reset of the color groups with the results
          d.querySpec.dimensions.map((dimension) =>
            omit(["topN", "showOther", "axisLabel"], dimension)
          )
        ) || hasChangedDimensionParameterValues(this.props, _nextProps)

      this.fetchData(_nextProps, colorGroupsShouldReset)
    }

    if (hasChanged((d) => d.filters)) {
      // fire crossfiltering on other charts
      this.dcAdapter.filter(_nextProps.filters)
      // update styling of bars so only selected bars have color
      this.setChartConfig({ selectedKeys: _nextProps.filters })
    }

    if (hasChanged((d) => d.omnifilters)) {
      this.dcAdapter.redrawGroup()
    }

    const { w, h } = this.getSize()
    if (this.width !== w) {
      this.width = w
      this.setChartConfig({ width: w })
      this.setChartConfig(
        autoSetMarginBottom(
          _nextProps.data,
          this.margin,
          this.width,
          _nextProps.querySpec.numberGroups,
          _nextProps.userConfiguredAxisLength,
          _nextProps.userConfiguredAxisFontSize
        )
      )
    }
    if (this.height !== h) {
      this.height = h
      this.setChartConfig({ height: h })
      this.setChartConfig(
        autoSetMarginBottom(
          _nextProps.data,
          this.margin,
          this.width,
          _nextProps.querySpec.numberGroups,
          _nextProps.userConfiguredAxisLength,
          _nextProps.userConfiguredAxisFontSize
        )
      )
    }

    if (
      hasChanged((d) => d.userConfiguredAxisLength) ||
      hasChanged((d) => d.userConfiguredAxisFontSize)
    ) {
      this.setChartConfig(
        autoSetMarginBottom(
          _nextProps.data,
          this.margin,
          this.width,
          _nextProps.querySpec.numberGroups,
          _nextProps.userConfiguredAxisLength,
          _nextProps.userConfiguredAxisFontSize
        )
      )
      this.setChartConfig({
        maxXLabelCharCount: getMaxCharsForAxisLength(
          _nextProps.userConfiguredAxisLength,
          _nextProps.userConfiguredAxisFontSize
        )
      })
    }

    const configSpecKeys = Object.keys(configSpecShape)
    const configSpecProps = pick(configSpecKeys, this.props.configSpec)
    const configSpecNextProps = pick(configSpecKeys, _nextProps.configSpec)
    const hasSpecChanges = !deepEquals(configSpecProps, configSpecNextProps)
    if (hasSpecChanges) {
      this.setChartConfig(configSpecNextProps)
      this.setChartConfig({ xAxisLabel: _nextProps.configSpec.xAxisLabel })
    }

    if (hasChanged((d) => d.configSpec.timeBin)) {
      this.setChartConfig({
        binningIsEnabled: Boolean(
          _nextProps.configSpec.timeBin && !_nextProps.configSpec.extract
        )
      })
    }

    if (
      hasChanged((d) => d.data) ||
      (hasChanged((d) => d.isLoadingData) && !_nextProps.isLoadingData) ||
      this.props.configSpec.percentageViewEnabled !==
        _nextProps.configSpec.percentageViewEnabled
    ) {
      this.setChartConfig(
        autoSetMarginBottom(
          _nextProps.data,
          this.margin,
          this.width,
          _nextProps.querySpec.numberGroups,
          _nextProps.userConfiguredAxisLength,
          _nextProps.userConfiguredAxisFontSize
        )
      )
      this.setData(_nextProps.data, _nextProps.configSpec)
    } else if (this.hasChanges) {
      this.renderChart()
    }

    if (hasChanged((d) => d.dataSource)) {
      window.setTimeout(() => {
        if (this.dcAdapter) {
          this.dcAdapter.destroy()
        }
        this.dcAdapter = this.setAdapter(
          _nextProps.dataSource,
          _nextProps.crossfilter.dimension(
            _nextProps.querySpec.dimensions[0].value
          )
        )
      })
    }
  }

  componentWillUnmount() {
    this.barChart.destroy()
    this.props.destroyChart(this.props.id)
    // when switching data sources in chart editor make sure to clear any crossfilter
    this.props.clearChartFilterString(this.props.id)
    this.dcAdapter.destroy()
    removeChartAdapterDimensionMapping(this.props.id)
    deregisterDCAdapter(this.props.id)
  }

  dataCache = null
  barChart = null
  dcAdapter = null

  isDifferent = curry(
    (_nextProps, _props, _accessor) =>
      !deepEquals(_accessor(_nextProps), _accessor(_props))
  )

  isDifferentFromKeys = curry((_next, _current, _list, _accessor) => {
    const currentProps = pick(_list, _accessor(_current))
    const nextProps = pick(_list, _accessor(_next))
    return !deepEquals(currentProps, nextProps)
  })

  get isVisible() {
    return Boolean(this.containerRef && this.containerRef.offsetParent)
  }

  getSize = () => ({
    w: this.containerRef.offsetWidth,
    h: this.containerRef.offsetHeight
  })

  setupChartRef = (_node) => {
    this.chartRef = _node
  }

  setupContainerRef = (_node) => {
    this.containerRef = _node
  }

  bindListeners() {
    const chartId = this.props.id
    this.barChart.events
      .on("binChange.component", (...args) =>
        this.props.setBinning(chartId, ...args)
      )
      .on("autoBinToggle.component", (...args) =>
        this.props.setAutoBin(chartId, ...args)
      )
      .on("domainChange.component", (d) => {
        if (d.axis === "x") {
          this.props.setXAxisDomain(chartId, d.extent)
        } else if (d.axis === "y") {
          this.props.setYAxisDomain(chartId, d.extent)
        }
      })
      .on("domainLockToggle.component", (d) => {
        if (d.axis === "x") {
          this.props.toggleXDomainLock(chartId, d.isLocked, d.extent)
        } else if (d.axis === "y") {
          this.props.toggleYDomainLock(chartId, d.isLocked, d.extent)
        }
      })
      .on("mouseClickPanel.component", (d) => {
        const { filters } = this.props
        if (d && d.x && filters) {
          if (filters.includes(d.x)) {
            this.props.removeChartFilter(chartId, d.x)
          } else {
            this.props.addChartFilter(chartId, d.x)
          }
        }
      })
  }

  fetchData = (props, colorGroupsShouldReset) => {
    const globalFilterString = this.props.crossfilter.getGlobalFilterString()
    this.props.fetchData(
      { globalFilterString, ...props.querySpec },
      props.configSpec,
      props.id,
      colorGroupsShouldReset
    )
  }

  updateChart = (_config) => {
    this.barChart.setConfig(_config).render()
  }

  renderChart = () => {
    this.barChart.render()
  }

  setChartConfig = (_config) => {
    this.barChart.setConfig(_config)
    this.hasChanges = true
  }

  setData = (_data, configSpec) => {
    this.barChart.setData(_data, configSpec)
  }

  setEvents = () => {
    this.barChart.setEvents()
  }

  setAdapter = (dataSource, cfDimension) => {
    const adapter = dcAdapter(dataSource)
    adapter.setDimension(cfDimension)
    adapter.events.on("redrawGroup.component", (...args) =>
      this.props.setFilterString(this.props.id, ...args)
    )

    setChartAdapterDimensionMapping(this.props.id, cfDimension)
    registerDCAdapter(this.props.id, adapter)

    return adapter
  }

  render() {
    return (
      <div
        className={cx("bar-component", { loading: this.props.isLoadingData })}
        id={`chart${this.props.id}`}
        ref={this.setupContainerRef}
      >
        <MapDCChartAxisOverlay
          chartId={this.props.id}
          yAxisLabel={this.props.configSpec.yAxisLabel}
          xAxisLabel={this.props.configSpec.xAxisLabel}
          updateXAxisLabel={(value) =>
            this.props.setXAxisLabel(this.props.id, value)
          }
          updateYAxisLabel={(value) =>
            this.props.setYAxisLabel(this.props.id, value)
          }
        />
        <div className="bar-chart" ref={this.setupChartRef} />
        {this.props.isLoadingData && (
          <div className="loading-spinner">
            <div className="loading-spinner-icon" />
          </div>
        )}
      </div>
    )
  }
}
