// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { QuerySpec } from "./line2-container"
import PropTypes from "prop-types"
import { DcAdapter } from "./line2-dc-adapter"

export interface Config {
  palette: any[]
  dirtyPalettes: object
  chartType: string
  topN: any[]
  rangeChartIsVisible: boolean
  xAxisLabel: string
  yAxisLabel: string
  y2AxisLabel: string
  timeBin: string
  extract: boolean
  autoBin: boolean
  brushExtent: any[]
  rangeBrushExtent: any[]
  binExtent: any[]
  keyType: string
  legendTitle: string
  legendIsEnabled: boolean
  binningIsEnabled: boolean
  shouldTransformPercentage: boolean
  xDomain: any[] | string
  yDomain: any[] | string
  y2Domain: any[] | string
  xLock: boolean
  yLock: boolean
  y2Lock: boolean
  measures: any[]
  hasRightAxis: boolean
  hasLeftAxis: boolean
  showOther: boolean
  measureFormats: Array<{ key: string; format: string }>
  dimensionFormats: Array<{ key: string; format: string }>
  margin: { top: number; right: number; bottom: number; left: number }
  brushRangeIsEnabled: boolean
  yDomainEditorIsEnabled: boolean
  y2DomainEditorIsEnabled: boolean
  tooltipIsEnabled: boolean
  brushIsEnabled: boolean
  yTicks: number
}

export interface Crossfilter {
  dimension: (dim: string) => any
  getGlobalFilterString: Function
}
export interface Props {
  brushRangeChange: Function
  clearChartExtent: Function
  clearFilterExtent: Function
  clearChartFilterString: Function
  baseCrossfilter: {
    getCrossfilter: (dim: string) => Crossfilter
  }
  chart: any
  configSpec: Config
  crossfilter: Crossfilter
  data: any[]
  rangeData: any[]
  dataSources: string[]
  dataSource: string
  destroyChart: Function
  fetchData: Function
  fetchFocusData: Function
  fetchRangeData: Function
  id: string
  isLoadingData: boolean
  querySpec: QuerySpec
  rangeQuerySpec: QuerySpec
  setAutoBin: Function
  setBinning: Function
  setChartExtent: Function
  setFilterExtent: Function
  setFilterString: Function
  setXAxisDomain: Function
  setXAxisLabel: Function
  setY2AxisDomain: Function
  setY2AxisLabel: Function
  setYAxisDomain: Function
  setYAxisLabel: Function
  toggleXDomainLockAndRefresh: Function
  toggleY2DomainLock: Function
  toggleYDomainLock: Function
  containerRef: HTMLElement
  filterExtent: object[]
  rangeExtent: object[]
  heightRatio: number
  height: number
  width: number
  panelIsVisible: boolean
  addLineChart: Function
  removeLineChart: Function
  onFilterExtentChange: Function
  onRangeBrushExtentChange: Function
  bindings: object
  dcAdapter: DcAdapter
  hideTooltip: Function
  moveTooltip: Function
  legendCollapsed: boolean
  toggleChartLegend: () => void
}

export const configSpecShape = {
  margin: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number
  }),
  palette: PropTypes.array,
  dirtyPalettes: PropTypes.object,
  paletteIsDirty: PropTypes.bool,
  chartType: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  rangeChartIsVisible: PropTypes.bool,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
  y2AxisLabel: PropTypes.string,
  timeBin: PropTypes.string,
  extract: PropTypes.bool,
  autoBin: PropTypes.bool,
  brushExtent: PropTypes.array,
  rangeBrushExtent: PropTypes.array,
  binExtent: PropTypes.array,
  keyType: PropTypes.string,
  legendTitle: PropTypes.string,
  legendIsEnabled: PropTypes.bool,
  binningIsEnabled: PropTypes.bool,
  xDomain: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string // can be "auto"
  ]),
  yDomain: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string // can be "auto"
  ]),
  y2Domain: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string // can be "auto"
  ]),
  shouldTransformPercentage: PropTypes.bool,
  xLock: PropTypes.bool,
  yLock: PropTypes.bool,
  y2Lock: PropTypes.bool,
  measures: PropTypes.array,
  dimensions: PropTypes.array,
  hasRightAxis: PropTypes.bool,
  hasLeftAxis: PropTypes.bool,
  showOther: PropTypes.bool,
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
