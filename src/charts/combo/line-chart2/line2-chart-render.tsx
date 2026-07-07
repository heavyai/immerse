// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode, PureComponent } from "react"
import { Props, configSpecShape } from "./line2-prop-types"
import lineChart2 from "./line2-adapter"
import { DcAdapter } from "./line2-dc-adapter"
import { curry, pick } from "ramda"
import deepEquals from "fast-deep-equal"
import { diff, noop } from "utils/helpers"
import { isColorDimension } from "reducers/charts/helpers/multi-source-helpers"
import { valueContainsParameter } from "components/parameters/utils"

const isDifferent = curry(
  (objA, objB, accessor) => !deepEquals(accessor(objA), accessor(objB))
)

const differencesFromKeys = curry((_next, _current, _list, _accessor) => {
  const currVal = _accessor(_current)
  const nextVal = _accessor(_next)
  return _list.reduce(
    (changed, k) =>
      deepEquals(currVal[k], nextVal[k]) ? changed : [...changed, k],
    []
  )
})

export default class Line2ChartRenderer extends PureComponent<Props, {}> {
  constructor(props) {
    super(props)
    this.setFilterString = this.setFilterString.bind(this)
  }

  componentDidMount(): void {
    const {
      data,
      dataSources,
      baseCrossfilter,
      querySpec,
      configSpec,
      height = 0,
      width = 0,
      fetchData,
      addLineChart,
      dcAdapter = null,
      filterExtent,
      rangeExtent,
      onFilterExtentChange
    } = this.props

    this.hasChanges = false
    this.lineChart = lineChart2(this.chartRef.current)
    addLineChart(this.lineChart)

    // We use  Line2ChartRenderer as child components of the focus chart and
    // the range chart, but the range chart doesn't have it's own dcAdapter.
    // So only init() if Line2ChartRenderer has the dcAdapter prop

    this.dcAdapter =
      dcAdapter &&
      dcAdapter.init(
        dataSources,
        baseCrossfilter,
        querySpec,
        this.setFilterString
      )

    this.lineChart.dcAdapter = this.dcAdapter

    this.width = width
    this.height = height
    this.setChartConfig({ ...configSpec, width, height })

    this.lineChart.setEvents()
    this.bindListeners()
    if (data && data.length) {
      this.lineChart.setData(data, configSpec)
    }

    if (this.dcAdapter) {
      this.dcAdapter.renderRedraw()
    }

    if (dataSources) {
      fetchData(this.props)
    }

    // Filter right away if a filter extent or range filter was saved onto the chart
    if (
      (filterExtent || rangeExtent) &&
      this.dcAdapter &&
      typeof onFilterExtentChange === "function"
    ) {
      onFilterExtentChange(
        this.dcAdapter,
        filterExtent.length ? filterExtent : rangeExtent,
        configSpec
      )
    }
  }
  // TODO: This method needs to be further iterated on and made clearer.
  // For now, the idea is, we watch the properties on the querySpec and configSpec.
  // If we see changes there, we fire off a new query request for new data and pass that through
  // the redux flow, causing another update. We also use this to call setChartConfig() on the
  // underlying charts, as well as some callbacks up to the parent to have some cross-communication between
  // the "focus" and "range" charts.
  UNSAFE_componentWillUpdate = (nextProps: Readonly<Props>): void => {
    const hasChanged = isDifferent(nextProps, this.props)
    const hasChangedFromKeys = differencesFromKeys(nextProps, this.props)
    this.hasChanges = false

    const querySpecChangedKeys = hasChangedFromKeys(
      [
        "dimensions",
        "measures",
        "dataSources",
        "filterString",
        "rangeFilter",
        "showOther"
      ],
      (d) => d.querySpec
    )
    const configSpecChangedKeys = hasChangedFromKeys(
      ["timeBin", "extract", "autoBin", "binExtent", "palette"],
      (d) => d.configSpec
    )
    const { configSpec } = this.props
    const {
      configSpec: nextConfigSpec,
      height: nextHeight = 0,
      width: nextWidth = 0,
      fetchData: nextFetchData = noop,
      onFilterExtentChange: nextOnFilterExtentChange = noop,
      onRangeBrushExtentChange: nextOnRangeBrushExtentChange = noop
    } = nextProps

    const onlyPaletteConfigChange =
      configSpecChangedKeys.length === 1 &&
      configSpecChangedKeys[0] === "palette"
    const paletteLengthDelta =
      nextConfigSpec.palette.length - configSpec.palette.length
    const paletteKeysChanged =
      configSpecChangedKeys.includes("palette") &&
      hasChangedFromKeys(Object.keys(configSpec.palette), (d) =>
        d.configSpec.palette.map((p) => p.key)
      ).length > 0

    const changedParamNames = Object.keys(
      diff(this.props.parameterValues, nextProps.parameterValues)
    )

    const shouldFetchData =
      querySpecChangedKeys.length ||
      (configSpecChangedKeys.length &&
        !querySpecChangedKeys.includes("showOther") &&
        (!onlyPaletteConfigChange ||
          (onlyPaletteConfigChange &&
            (Math.abs(paletteLengthDelta) || paletteKeysChanged)))) ||
      changedParamNames.length

    if (shouldFetchData && typeof nextFetchData === "function") {
      // Any dimension changes for a source - except those to showOther and axisLabel - should
      // trigger a new top N preflight query and reset of the color groups with the results
      const sourcesNeedingColorGroupReset = {}

      nextProps.querySpec.dimensions.forEach((dimension, index) => {
        if (isColorDimension(dimension)) {
          // Omit these properties from being included in the deepEquals comparison
          const { showOther: _1, axisLabel: _2, ...nextDimension } =
            dimension || {}
          const { showOther: _3, axisLabel: _4, ...prevDimension } =
            this.props.querySpec.dimensions[index] || {}

          const dimensionParamValueChanged = changedParamNames.some(
            (paramName) => valueContainsParameter(dimension.value, paramName)
          )

          const changed =
            !deepEquals(nextDimension, prevDimension) ||
            dimensionParamValueChanged

          if (changed) {
            sourcesNeedingColorGroupReset[dimension.multiSourceIndex] = true
          }

          if (dimensionParamValueChanged) {
            this.props.unlockColors(this.props.id, dimension.multiSourceIndex)
          }
        }
      })

      nextFetchData(nextProps, sourcesNeedingColorGroupReset)
    }

    if (
      hasChanged((d) => d.configSpec.rangeBrushExtent) &&
      typeof nextOnRangeBrushExtentChange === "function"
    ) {
      nextOnRangeBrushExtentChange(nextConfigSpec, this.setChartConfig)
    }

    // trigger crossfilter w/ filter extent or range filter extent
    if (
      (hasChanged((d) => d.filterExtent) || hasChanged((d) => d.rangeExtent)) &&
      typeof nextOnFilterExtentChange === "function"
    ) {
      nextOnFilterExtentChange(
        this.dcAdapter,
        nextProps.filterExtent.length
          ? nextProps.filterExtent
          : nextProps.configSpec.rangeBrushExtent,
        nextConfigSpec
      )
    }

    if (this.width !== nextWidth) {
      this.width = nextWidth
      this.setChartConfig({ width: nextWidth })
    }
    if (this.height !== nextHeight) {
      this.height = nextHeight
      this.setChartConfig({
        height: nextHeight
      })
    }

    const configSpecKeys = Object.keys(configSpecShape)
    const configSpecProps = pick(configSpecKeys, configSpec)
    const configSpecNextProps = pick(configSpecKeys, nextConfigSpec)

    if (!deepEquals(configSpecProps, configSpecNextProps)) {
      this.setChartConfig(configSpecNextProps)
    }

    // detect change of y axis orientation
    const currentOrientations = this.props.configSpec.measures.map(
      (d) => d.yAxisOrientation
    )
    const nextOrientations = nextConfigSpec.measures.map(
      (d) => d.yAxisOrientation
    )
    const yAxisOrientationChanged = !deepEquals(
      currentOrientations,
      nextOrientations
    )

    if (
      hasChanged((d) => d.data) ||
      (hasChanged((d) => d.isLoadingData) && !nextProps.isLoadingData) ||
      yAxisOrientationChanged ||
      configSpec.shouldTransformPercentage !==
        nextConfigSpec.shouldTransformPercentage
    ) {
      this.lineChart.setData(nextProps.data, nextConfigSpec)
    } else if (this.hasChanges) {
      this.lineChart.render()
    }

    if (hasChanged((d) => d.dataSources) && this.dcAdapter) {
      //
      window.setTimeout(() => {
        if (this.dcAdapter) {
          this.dcAdapter.destroy()
        }
        const { dataSources, baseCrossfilter, querySpec } = nextProps
        this.dcAdapter.init(
          dataSources,
          baseCrossfilter,
          querySpec,
          this.setFilterString
        )
      })
    }
  }

  componentWillUnmount() {
    const { clearChartFilterString, destroyChart, removeLineChart } = this.props

    removeLineChart(this.lineChart)

    if (this.lineChart) {
      this.lineChart.destroy()
    }

    if (this.dcAdapter) {
      this.dcAdapter.destroy()
    }

    clearChartFilterString(this.props.id)
    destroyChart(this.props.id)
  }

  chartRef: ReactNode = React.createRef()
  dcAdapter: DcAdapter = null
  lineChart = null
  hasChanges = false
  width = 0
  height = 0

  /* setFilterString can be called multiple times in rapid succession.
     ...but, if we're calling it with the same filter string that we already have,
     then we actually just want to bow out and not do anything. Only if the filterString
     has changed do we care and fall through to the action.
  */

  setFilterString(multiSourceIndex, filterString) {
    const oldFilterString = this.props.chart.filterString
    if (
      typeof oldFilterString === "object" &&
      oldFilterString !== null &&
      oldFilterString[multiSourceIndex] === filterString
    ) {
      return
    }

    this.props.setFilterString(this.props.id, multiSourceIndex, filterString)
  }

  setupChartRef = (node) => {
    this.chartRef.current = node
  }

  setChartConfig = (config) => {
    this.lineChart.setConfig(config)
    this.hasChanges = true
  }

  bindListeners(): void {
    const { bindings = {} } = this.props
    Object.keys(bindings).forEach((key) =>
      this.lineChart.events.on(key, bindings[key])
    )
  }

  onMouseMove = (e) =>
    typeof this.props.onMouseMove === "function" && this.props.onMouseMove(e)

  render() {
    return (
      <div
        className="line2-chart"
        onMouseMove={this.onMouseMove}
        ref={this.chartRef}
      />
    )
  }
}
