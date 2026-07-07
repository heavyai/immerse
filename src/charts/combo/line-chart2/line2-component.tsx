// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"
import cx from "classnames"

import {
  getXAxisDimension,
  isChartMultiSource
} from "reducers/charts/helpers/multi-source-helpers"
import MapDCChartAxisOverlay from "components/chart-axis-overlay"
import Line2FocusChart from "./line2-focus-chart"
import Line2RangeChart from "./line2-range-chart"
import { Props } from "./line2-prop-types"
import { any, isNil } from "ramda"
import { RANGE_CHART_HEIGHT_RATIO } from "./line2-consts"
import { DcAdapter } from "./line2-dc-adapter"
import { filterTimeBinOption } from "./sql-utils"

import {
  setChartAdapterDimensionMapping,
  removeChartAdapterDimensionMapping,
  registerDCAdapter,
  deregisterDCAdapter
} from "utils/chart-adapter-mappings"

type ContainerHeightAndWidth = {
  height: number
  width: number
}

const getRangeChartSize = (
  containerRef = {
    offsetHeight: 0,
    offsetWidth: 0
  }
): ContainerHeightAndWidth => {
  const height = containerRef ? containerRef.offsetHeight : 0
  const width = containerRef ? containerRef.offsetWidth : 0
  return {
    height: height * RANGE_CHART_HEIGHT_RATIO,
    width
  }
}

const getFocusChartSize = (
  containerRef = {
    offsetHeight: 0,
    offsetWidth: 0
  },
  rangeChartIsVisible
) => {
  const height = containerRef ? containerRef.offsetHeight : 0
  const width = containerRef ? containerRef.offsetWidth : 0
  return {
    height: rangeChartIsVisible
      ? height - height * RANGE_CHART_HEIGHT_RATIO
      : height,
    width
  }
}

export default class Line2Component extends PureComponent<Props, {}> {
  constructor(props) {
    super(props)
    this.addLineChart = this.addLineChart.bind(this)
    this.removeLineChart = this.removeLineChart.bind(this)
    this.clearLineCharts = this.clearLineCharts.bind(this)
    // only the focus chart has a DcAdapter
    this.focusChartDcAdapter = new DcAdapter(this.props.id)
    setChartAdapterDimensionMapping(this.props.id, this.focusChartDcAdapter)
    registerDCAdapter(this.props.id, this.focusChartDcAdapter)
  }

  state = {
    lineCharts: []
  }

  componentWillUnmount(): void {
    this.clearLineCharts()
    removeChartAdapterDimensionMapping(this.props.id)
    deregisterDCAdapter(this.props.id)
  }

  containerRef: HTMLDivElement = React.createRef()
  focusChartDcAdapter: DcAdapter

  addLineChart(lineChart) {
    this.setState({
      lineCharts: [...this.state.lineCharts, ...[lineChart]]
    })
  }

  removeLineChart(lineChart) {
    this.setState({
      lineCharts: this.state.lineCharts.filter((chart) => chart !== lineChart)
    })
  }

  clearLineCharts() {
    this.setState({
      lineCharts: []
    })
  }

  shouldSwitchToAutoBin = (extent) => {
    const { querySpec, chart } = this.props
    const dimensions = (isChartMultiSource(chart)
      ? Object.values(chart.multiSources).map((ms) =>
          getXAxisDimension(querySpec.dimensions, ms.index)
        )
      : [getXAxisDimension(querySpec.dimensions)]
    ).filter((d) => !d.autobin && !d.extract)
    if (dimensions.length === 0) {
      // autobinning already; no need to switch to it
      return false
    }

    if (!extent) {
      // if not provided an extent, assume we're clearing the extent instead
      extent = dimensions
        .map((d) => [
          d.currentLowValue || d.min_val,
          d.currentHighValue || d.max_val
        ])
        .reduce((acc, e) => [Math.min(acc[0], e[0]), Math.max(acc[1], e[1])])
    }

    if (extent && extent[0] instanceof Date) {
      const binningToggles = filterTimeBinOption(extent)
      return !dimensions.every((d) => binningToggles.includes(d.timeBin))
    }
    return false
  }

  setFocusChartExtent = (d): void => {
    const hasNaNValues = (value) => isNil(value) || isNaN(value)
    const shouldUpdateFilter = d && !any(hasNaNValues)(d)

    if (shouldUpdateFilter) {
      if (d && this.shouldSwitchToAutoBin(d)) {
        this.props.setAutoBin(this.props.id, { isSelected: true }) // to do: should be done from a reducer
      }
      this.props.setChartExtent(this.props.id, d)
    }
  }

  setFocusChartExtentAndClearFilter = (d): void => {
    this.setFocusChartExtent(d)

    const config = this.props.configSpec
    if (config.brushExtent && config.brushExtent.length >= 2) {
      if (
        config.brushExtent[0] < config.rangeBrushExtent[0] ||
        config.brushExtent[1] > config.rangeBrushExtent[1]
      ) {
        this.props.clearFilterExtent(this.props.id, d)
      }
    }
  }

  clearFocusChartExtent = (d): void => {
    if (this.shouldSwitchToAutoBin()) {
      this.props.setAutoBin(this.props.id, { isSelected: true })
    }
    this.props.clearChartExtent(this.props.id, d)
  }

  get isVisible() {
    return Boolean(
      this.containerRef.current && this.containerRef.current.offsetParent
    )
  }

  get rangeChartIsVisible() {
    const { configSpec: { rangeChartIsVisible = false } = {} } = this.props
    return Boolean(rangeChartIsVisible && this.isVisible)
  }

  render() {
    const {
      isLoadingData,
      chart: { measures },
      id,
      legendCollapsed,
      toggleChartLegend,
      unlockColors
    } = this.props

    const focusChartSize = getFocusChartSize(
      this.containerRef.current,
      this.rangeChartIsVisible
    )

    const rangeChartSize = getRangeChartSize(this.containerRef.current)

    return (
      <div
        {...{
          className: cx("chart-type-line2", "chart-container", {
            loading: isLoadingData
          }),
          id: `chart${id}`,
          ref: this.containerRef
        }}
      >
        <MapDCChartAxisOverlay
          chartId={this.props.id}
          yAxisLabel={
            this.props.configSpec.hasLeftAxis
              ? this.props.configSpec.yAxisLabel
              : ""
          }
          y2AxisLabel={
            this.props.configSpec.hasRightAxis
              ? this.props.configSpec.y2AxisLabel
              : ""
          }
          xAxisLabel={this.props.configSpec.xAxisLabel}
          updateXAxisLabel={(value) =>
            this.props.setXAxisLabel(this.props.id, value)
          }
          updateYAxisLabel={(value) =>
            this.props.setYAxisLabel(this.props.id, value)
          }
          updateY2AxisLabel={(value) =>
            this.props.setY2AxisLabel(this.props.id, value)
          }
        />

        <Line2FocusChart
          {...{
            ...this.props,
            ...focusChartSize,
            rangeChartIsVisible: this.rangeChartIsVisible,
            addLineChart: this.addLineChart,
            removeLineChart: this.removeLineChart,
            containerRef: this.containerRef.current,
            dcAdapter: this.focusChartDcAdapter,
            setFocusChartExtent: this.setFocusChartExtent,
            setFocusChartExtentAndClearFilter: this
              .setFocusChartExtentAndClearFilter,
            clearFocusChartExtent: this.clearFocusChartExtent,
            hasRightAxisMeasure: Boolean(
              measures.find((m) => m.yAxisOrientation === "right")
            ),
            legendCollapsed,
            toggleChartLegend,
            unlockColors
          }}
        />
        {/*
          Sorry, this is riddled with magic numbers. The RefreshButton here appears to clear the range brush extent.
          It's to give the user a more obvious way to clear it (without clearing the focus brush filter!), especially
          since we now allow a user to zoom/pan on a chart w/o the range chart present.

          The magic numbers just make for a nice position.
        */}
        {!this.props.isLoadingData && this.props.configSpec.rangeBrushExtent && (
          <div
            className="button line2-reset-button"
            onClick={this.clearFocusChartExtent}
          >
            Reset
          </div>
        )}
        {this.rangeChartIsVisible && (
          <Line2RangeChart
            {...{
              ...this.props,
              ...rangeChartSize,
              addLineChart: this.addLineChart,
              removeLineChart: this.removeLineChart,
              containerRef: this.containerRef.current,
              setFocusChartExtent: this.setFocusChartExtent,
              clearFocusChartExtent: this.clearFocusChartExtent,
              setFocusChartExtentAndClearFilter: this
                .setFocusChartExtentAndClearFilter
            }}
          />
        )}

        {this.props.isLoadingData && (
          <div className="loading-spinner">
            <div className="loading-spinner-icon" />
          </div>
        )}
      </div>
    )
  }
}
