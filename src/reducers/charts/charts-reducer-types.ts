// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Style } from "mapbox-gl"

import { Dimension, Measure, PopupColumnType } from "constants/prop-types"
import { Filter } from "constants/filter-types"
import {
  ComboDataSelection,
  BoxPlotCenterLineType
} from "vega/constants/data-selection-types"
import { VegaComboPresentationSettings } from "vega/constants/presentation-settings-types"
import { Scales } from "vega/charts/types"

export type Domain = string[]
export type Range = string[]
export type ColorKey = string
export type ColorKeysList = ColorKey[]
export type ColorHex = string
export type ColorHexList = ColorHex[]
export type PaletteType = "ordinal" | "solid" | "quantitative"
export interface ColorDefinition {
  customDomain: Domain
  customRange: ColorHexList
  key?: string
  type?: string
  initialDomain?: Domain
  column?: string
  defaultOtherDomain?: string
  defaultOtherRange?: string
  hideOther?: boolean
  val?: ColorHexList
  isCustom?: boolean
  customKey?: string
  palette: {
    name: string
    val: string[]
    type: PaletteType
  }
}
export interface MultiSource {
  table: string | null
  index: number
}
export type Basemap = {
  label: string
  value: Style | string
}
export type RestrictedDimensionType = "Numeric" | "Time"
export interface ChartState {
  id: string
  autoSize: boolean
  areFiltersInverse: boolean
  cap: number
  renderArea: boolean
  color: any
  colorDomain: any
  colorRamps: any
  fullColorHashing: boolean

  // Vega integration
  dataSelections: ComboDataSelection[]
  selectedLayerId: string
  presentation: VegaComboPresentationSettings
  binSettings: object | null
  timeLagSettings: object | null
  scales: Scales
  layersLegendPinned?: boolean
  numberOfGroups: number
  violinDistributionPrecision: number
  centerLineType: BoxPlotCenterLineType
  defaultAggregation: string

  dcFlag: any
  densityAccumulatorEnabled: boolean
  dimensions: Dimension[] | [{}]
  elasticX: boolean
  elasticY: boolean
  filters: Filter[]
  geoJson: any
  loading: boolean
  legendCollapsed: boolean
  measures: Measure[] | [{}]
  rangeChartEnabled: boolean
  rangeFilter: any[]
  savedColors: any
  sortColumn: any
  columnAlignments?: ("left" | "center" | "right" | undefined)[] // "left" and undefined behave the same
  ticks: number
  title: string
  type: string
  showOther: boolean
  showNullDimensions: boolean
  markTypes: any[] // applies to dual y-axis charts only
  dataSource?: string

  // Multidata params
  multiSources: { [index: number]: MultiSource }
  restrictedDimensionType?: RestrictedDimensionType

  // showAbsoluteValues, showPercentValues, and showAllOthers are currently only used for Pie Chart
  showAbsoluteValues: boolean
  showPercentValues: boolean
  showPercentValuesInPopup: boolean
  showAllOthers: boolean
  vegaSortColumn: any
  linkedZoomEnabled: boolean
  quickFiltersExpanded: boolean
  hoverSelectedColumns: PopupColumnType[]
  active: boolean
  basemap?: Basemap
}
