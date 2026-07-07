// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MarkSettings } from "vega/constants/data-selection-types"

export type ValueType = string | number | Date | null

export type RangeValues = {
  start: NonNullable<ValueType>
  end: NonNullable<ValueType>
}

export type MeasureDomain = {
  min: number
  max: number
  minLocked: boolean
  maxLocked: boolean
  computedMin?: number
  computedMax?: number
}

export type SelectedValue = {
  value: string
  negated?: boolean
}

export type RangeFilterValue = {
  /** values */
  values: NonNullable<ValueType>[]
}

export type ZoomFilterValue = {
  start: NonNullable<ValueType>
  end: NonNullable<ValueType>
}

export type ValueWithOp = {
  value: ValueType
  op: SimpleOperator
}

export type TransformedDatum = {
  dataSelectionIndex: number
  measureIndex: number
  dimension: string
  dimensions: ValueType[]
  dimensionFormatted: string
  measureKey: string
  measure: number
  rawMeasure: number
  measureColor?: number
  categoricalColor?: string
  categoricalMeasureValue?: string | number
  annotationKey: SerializedAnnotationKey
  sortableVal?: number
}

export type Datum = TransformedDatum & {
  gap?: boolean
  measureMin: number
  measureMax: number
  axis: string
}

export type DataByVisualization = {
  bar?: Array<Datum>
  line?: Array<Datum>
  area?: Array<Datum>
}

export type DataByAxisAndVisualization = {
  primary?: DataByVisualization
  secondary?: DataByVisualization
}

export type MeasureSettings = {
  visualizeAs: NonNullable<MarkSettings["markType"]>
}

export type ExtentsByAxis = {
  primary?: [number, number]
  secondary?: [number, number]
}

export interface BoxPlotData {
  dimension0: string
  measure0_avg: number
  measure0_max: number
  measure0_median: number
  measure0_min: number
  measure0_q1: number
  measure0_q3: number
  measure0_mode: number
  measure0_count: number
}

interface OutliersData {
  dimension0: string
  measure0: number
}

export interface SortedOutliersData {
  top: OutliersData[]
  bottom: OutliersData[]
}

export type TooltipStats = {
  avg: number
  max: number
  median: number
  min: number
  q1: number
  q3: number
  iqr: number | null
  mode: number
  count: number
  topOutliers?: string
  bottomOutliers?: string
}

export interface TooltipTable {
  dimension: string
  key: string
  color: string
  stats: TooltipStats
}
