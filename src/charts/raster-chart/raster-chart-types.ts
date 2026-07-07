// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dimension, Measure, PopupColumnType } from "constants/prop-types"

export type GeoHeatState = {
  opacity: string | number
  areFiltersInverse: boolean
  autoSize: boolean
  basemap: {
    value: string
  }
  cap: number
  color: {
    type: "quantitative"
    key: string
    val: string[]
  }
  colorDomain?: [number, number]
  dataSource: string
  dcFlag?: number
  densityAccumulatorEnabled: boolean
  dimensions: [Record<string, any>, Record<string, any>]
  elasticX: boolean
  elasticY: boolean
  filters: any[]
  geoJson?: Record<string, any>
  hasError: boolean
  height: number
  loading: boolean
  mapZoomCenter: {
    zoom: number
    center: {
      lng: number
      lat: number
    }
  }
  measures: [Record<string, any>]
  rangeChartEnabled: boolean
  rangeFilter: any[]
  renderArea: false
  savedColors: Record<string, any>
  showNullDimensions: boolean
  showOther: boolean
  rasterShowOther: boolean
  sortColumn: Record<string, any>
  ticks: number
  title: string
  type: "geoheat" | "pointmap" | "backendChoropleth" | "contour"
  width: number
  mapboxToken: string
  popupEnabled: boolean
  majorContourSettings: {
    intervalSize: number
    borderWidth: number
    borderOpacity: string
  }
  minorContourSettings: {
    borderWidth: number
    borderOpacity: string
  }
}

export type SelectorFragment = {
  axisLabel: null
  custom: false
  is_array: false
  is_dict: false
  label: string
  name_is_ambiguous: boolean
  table: string
  type: "FLOAT"
  value: string
}

export type MeasureFragment = SelectorFragment & {
  minMax?: [number, number]
  categories?: string[]
}

export type ColorPayload = {
  color: {
    reverse: boolean
    type: string
    val: string[]
  }
}

export interface LayerState {
  rasterLayerId: string
  measures: Measure[] | [{}]
  dimensions: Dimension[] | [{}]
  color: any
  dataSource?: string
  type: string
  densityAccumulatorEnabled: boolean
  autoSize: boolean
  sizeRange: number[]
  cap: number
  hoverSelectedColumns: PopupColumnType[]
  geoJoin: any
  popupEnabled: boolean
  rasterShowOther: boolean
  active: boolean
  postFilters: any
  activeZoomLevel: boolean
  opacity?: string
  zoomMinThreshold?: number
  zoomMaxThreshold?: number
  pixelSize?: number
  mark?: string
  borderWidth?: number
  borderColor?: string
  hasBorderColorFromFill?: boolean
  labelText?: string
}
