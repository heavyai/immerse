// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Line2ChartRenderer from "./line2-chart-render"
import React, { PureComponent } from "react"
import { noop } from "utils/helpers"
import { Config, Props } from "./line2-prop-types"
import { values } from "ramda"
import FloatingChartLegend from "components/chart-legend/floating-chart-legend"
import ChartLegend from "components/chart-legend"
import { isChartMultiSource } from "reducers/charts/helpers/multi-source-helpers"
import { determineAutoBinInterval } from "./sql-utils"
import SourceList from "components/chart-legend/source-list"
import { BIN_TRANSLATION } from "utils/time-helpers"

const SMALL_BOTTOM_MARGIN = 24
const TALL_BOTTOM_MARGIN = 64
const defaultBinTranslations = {
  ...BIN_TRANSLATION
}

const fetchData = (
  {
    baseCrossfilter = {},
    fetchFocusData = noop,
    querySpec = {},
    configSpec = {},
    id = null,
    dataSource = {},
    dataSources = {}
  }: Readonly<Line2FocusChartProps>,
  sourcesNeedingColorGroupReset: boolean
): void => {
  const multiGlobalFilterStrings = values(dataSources).map(({ table }) =>
    baseCrossfilter.getCrossfilter(table, id).getGlobalFilterString()
  )
  // Map and pass in list of globalfilterstrings
  fetchFocusData(
    {
      ...querySpec,
      multiGlobalFilterStrings
    },
    configSpec,
    id,
    !dataSource,
    sourcesNeedingColorGroupReset
  )
}

const onFilterExtentChange = (
  dcAdapter,
  filterExtent: any[],
  { timeBin, extract }: Config
) => {
  dcAdapter.filter(filterExtent, timeBin, extract)
  dcAdapter.redrawGroup()
}

const getBindings = (
  {
    setFilterExtent,
    setFocusChartExtentAndClearFilter,
    clearFocusChartExtent,
    clearFilterExtent,
    setXAxisLabel,
    setYAxisLabel,
    setY2AxisLabel,
    setBinning,
    setAutoBin,
    setXAxisDomain,
    setYAxisDomain,
    setY2AxisDomain,
    toggleXDomainLockAndRefresh,
    toggleYDomainLock,
    toggleY2DomainLock,
    brushRangeChange,
    hideTooltip,
    moveTooltip
  },
  { props: { id: chartId } = {} }
) => {
  return {
    "brushMove.component brushEnd.component": (...args) =>
      setFilterExtent(chartId, ...args),
    "brushClear.component": (...args) => clearFilterExtent(chartId, ...args),
    "axisLabelChange.component": ({ type, value }) => {
      if (type === "x") {
        setXAxisLabel(chartId, value)
      } else if (type === "y") {
        setYAxisLabel(chartId, value)
      } else if (type === "y2") {
        setY2AxisLabel(chartId, value)
      }
    },
    "binChange.component": (...args) => setBinning(chartId, ...args),
    "autoBinToggle.component": (...args) => setAutoBin(chartId, ...args),
    "domainChange.component": ({ axis, extent }) => {
      if (axis === "x") {
        setXAxisDomain(chartId, extent)
      } else if (axis === "y") {
        setYAxisDomain(chartId, extent)
      } else if (axis === "y2") {
        setY2AxisDomain(chartId, extent)
      }
    },
    "domainLockToggle.component": ({ axis, isLocked, extent }) => {
      if (axis === "x") {
        toggleXDomainLockAndRefresh(chartId, isLocked, extent)
      } else if (axis === "y") {
        toggleYDomainLock(chartId, isLocked, extent)
      } else {
        toggleY2DomainLock(chartId, isLocked, extent)
      }
    },
    "brushRangeChange.component": (...args) =>
      brushRangeChange(chartId, ...args),
    "tooltipHide.component": hideTooltip,
    "tooltipMove.component": moveTooltip,
    "zoom.component": setFocusChartExtentAndClearFilter,
    "zoomClear.component": clearFocusChartExtent
  }
}

interface Line2FocusChartProps extends Props {
  rangeChartIsVisible: boolean
  legendCollapsed: boolean
  toggleChartLegend: () => {}
}

class Line2FocusChart extends PureComponent<Line2FocusChartProps, {}> {
  constructor(props) {
    super(props)

    this.toggleChartLegend = this.toggleChartLegend.bind(this)

    this.state = { ...Line2FocusChart.initialState }
    this.bindings = {
      ...getBindings(this.props, this),
      "tooltipMove.component": this.moveFloatingLegend,
      "tooltipHide.component": this.hideFloatingLegend
    }
  }

  static initialState = {
    floatingLegend: {
      show: false,
      position: null,
      dataPoint: null,
      mousePosition: {
        clientX: null,
        clientY: null
      }
    }
  }

  bindings = null
  binTranslations = {
    ...defaultBinTranslations
  }

  get isBinnedByTime(): boolean {
    const { timeBin, extract } = this.props.configSpec || {}
    return timeBin && !extract
  }

  selectAutoTimeBin = ([currentLowValue, currentHighValue]) =>
    this.binTranslations[
      determineAutoBinInterval(currentLowValue, currentHighValue)
    ]

  moveFloatingLegend = (
    dataPoint,
    dataPointXPosition,
    mouseY,
    panelXPosition
  ) =>
    this.setState({
      floatingLegend: {
        show: true,
        position: { x: panelXPosition, y: mouseY },
        dataPoint
      }
    })

  onMouseMove = (e) =>
    this.setState({
      floatingLegend: {
        ...this.state.floatingLegend,
        mousePosition: {
          clientX: e.clientX,
          clientY: e.clientY
        }
      }
    })

  hideFloatingLegend = () =>
    this.setState({
      floatingLegend: {
        ...Line2FocusChart.initialState.floatingLegend
      }
    })

  toggleChartLegend() {
    return this.props.toggleChartLegend(this.props.id)
  }

  render() {
    const {
      configSpec: {
        palette = [],
        chartType = "",
        dimensionFormats = [],
        measureFormats = [],
        timeBin = null,
        rangeBrushExtent,
        binExtent,
        shouldTransformPercentage,
        rangeChartIsVisible
      } = {},
      configSpec = {},
      querySpec,
      chart: { multiSources = {}, dataSource = "" },
      chart,
      isLoadingData,
      hasRightAxisMeasure,
      height: focusChartHeight,
      containerRef,
      legendCollapsed
    } = this.props
    const { floatingLegend } = this.state
    const chartIsMultiSource = isChartMultiSource(chart)
    const chartExtent = rangeBrushExtent || binExtent
    if (this.isBinnedByTime) {
      this.binTranslations.auto = this.selectAutoTimeBin(chartExtent)
    }
    const dataSources = chartIsMultiSource
      ? multiSources
      : // Because well, we still haven't refactored out "switching to multisource mode" yet.
        { 0: { index: 0, table: dataSource } }

    return (
      <React.Fragment>
        {!isLoadingData && (
          <ChartLegend
            {...{
              hasRightAxisMeasure,
              maxHeight: focusChartHeight - 70, // Absolute positioning offset of legend,
              onHeaderClick: this.toggleChartLegend,
              collapsed: legendCollapsed
            }}
          >
            <SourceList {...{ dataSources, palette, chartType }} />
          </ChartLegend>
        )}
        <Line2ChartRenderer
          {...{
            ...this.props,
            fetchData,
            onFilterExtentChange,
            bindings: this.bindings,
            querySpec,
            configSpec: {
              ...configSpec,
              legendIsEnabled: false,
              xAxisLabel: rangeChartIsVisible ? "" : configSpec.xAxisLabel,
              margin: {
                top: 32,
                right: 32,
                bottom: rangeChartIsVisible
                  ? SMALL_BOTTOM_MARGIN
                  : TALL_BOTTOM_MARGIN,
                left: 70
              }
            },
            onMouseMove: this.onMouseMove
          }}
        />
        {floatingLegend.show && (
          <FloatingChartLegend
            {...{
              palette,
              chartType,
              dataSources: chartIsMultiSource
                ? multiSources
                : { 0: { index: 0, table: dataSource } },
              dataPoint: floatingLegend.dataPoint,
              dimensionFormats,
              measureFormats,
              binningResolution: this.binTranslations[timeBin],
              yAxisPercentageFormat: shouldTransformPercentage ? "auto" : null,
              mousePosition: floatingLegend.mousePosition,
              collisionCoordinates: containerRef.getBoundingClientRect()
            }}
          />
        )}
      </React.Fragment>
    )
  }
}

export default Line2FocusChart
