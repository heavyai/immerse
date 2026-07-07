// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"
import Line2ChartRenderer from "./line2-chart-render"
import { noop } from "utils/helpers"
import { Config, Props } from "./line2-prop-types"
import { getXDomain } from "./utils"

const getRangeConfigSpec = (configSpec: Config) => ({
  ...configSpec,
  margin: {
    top: 4,
    right: 32,
    bottom: 64,
    left: 70
  },
  xDomain: getXDomain(configSpec.dimensions, configSpec.extract),
  brushRangeIsEnabled: false,
  yDomainEditorIsEnabled: false,
  y2DomainEditorIsEnabled: false,
  binningIsEnabled: false,
  legendIsEnabled: false,
  tooltipIsEnabled: false,
  brushIsEnabled: true,
  zoomIsEnabled: () => false,
  yTicks: 2,
  brushExtent: configSpec.rangeBrushExtent,
  yAxisLabel: "",
  y2AxisLabel: ""
})

const fetchData = ({
  baseCrossfilter: { getCrossfilter = noop },
  fetchRangeData = noop,
  dataSources = {},
  configSpec = {},
  querySpec = {},
  id = null
}: Props) => {
  const multiGlobalFilterStrings = Object.values(dataSources).map(({ table }) =>
    getCrossfilter(table).getGlobalFilterString()
  )

  // Map and pass in list of globalfilterstrings
  fetchRangeData({ ...querySpec, multiGlobalFilterStrings }, configSpec, id)
}

const onRangeBrushExtentChange = (
  configSpec: Config,
  setChartConfig: Function
) => {
  setChartConfig({
    brushExtent: configSpec.rangeBrushExtent
  })
}

const getBindings = (
  {
    setXAxisDomain,
    toggleXDomainLockAndRefresh,
    setFocusChartExtent,
    setFocusChartExtentAndClearFilter,
    clearFocusChartExtent
  },
  { props: { id: chartId } = {} }
) => ({
  "brushMove.component": setFocusChartExtent,
  "brushEnd.component": setFocusChartExtentAndClearFilter,
  "brushClear.component": clearFocusChartExtent,
  "domainChange.component": ({ extent }) => setXAxisDomain(chartId, extent),
  "domainLockToggle.component": ({ isLocked, extent }) =>
    toggleXDomainLockAndRefresh(chartId, isLocked, extent)
})

interface Line2RangeChartProps extends Props {
  setFocusChartExtent: Function
  setFocusChartExtentAndClearFilter: Function
  clearFocusChartExtent: Function
}

export default class Line2RangeChart extends PureComponent<
  Line2RangeChartProps
> {
  constructor(props) {
    super(props)
    this.bindings = getBindings(this.props, this)
  }

  bindings = undefined

  render() {
    const { rangeData, rangeQuerySpec, configSpec } = this.props
    const rangeConfigSpec = getRangeConfigSpec(configSpec)
    return (
      <Line2ChartRenderer
        {...{
          ...this.props,
          fetchData,
          onRangeBrushExtentChange,
          data: rangeData,
          bindings: this.bindings,
          querySpec: rangeQuerySpec,
          configSpec: rangeConfigSpec
        }}
      />
    )
  }
}
