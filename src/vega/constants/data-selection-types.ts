// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  TDatumType,
  TTypeInfo
} from "@heavyai/connector/dist/browser-connector"
import { VegaCustomizableTopNOptions } from "vega/charts/types"
import {
  isIntegerType,
  isNumericType,
  isTimeType,
  TEXT_TYPES,
  BOOL_TYPES
} from "constants/data-types"
import { ColumnMetadata } from "constants/prop-types"

// Type coming from heavyai-connector. Note, not an original Thrift type -
// this kind of column descriptor object is built on the fly for the
// `fields` property of queryAsync as well as the `columns` returned
// in getFieldsAsync (get_table_details)
export type Column = ColumnMetadata & {
  name: string
}

// A mock 'column' that stands in for the "# Records" (count(*)) aggregate.
export type CountOption = {
  value: "# Records"
  label: "# Records"
  isCount: true
  type: "INT" // for data-column-selector#gettypecategory to read, for now
  filterType: "INT"
}

export const COUNT_OPTION: CountOption = {
  value: "# Records",
  label: "# Records",
  isCount: true,
  type: "INT",
  filterType: "INT"
}

// These appear as options for the user to select when selecting a measure.
// Basically, it's a type that's mostly columns coming straight from Connector
// but with a "# Records" option added
export type MeasureOption = Column | CountOption

export type Aggregate =
  | "Avg"
  | "Min"
  | "Max"
  | "Sum"
  | "# Unique"
  | "Stddev"
  | "Sample"
  | "Median"
  | "Mode"

export type TableProperties = {
  name: string
}

export type CountExpression = {
  type: "count"
  table: string
}

export type ColumnExpression = {
  type: "column"
  table: string
  column: Column
}

export type ColumnAggregateExpression = {
  type: "column_aggregate"
  table: string
  column: Column
  aggregate: Aggregate
}

export type TimeLagMode = "delta" | "actual"
export const TIME_LAG_EXPRESSION_TYPE = "time_lag"

export type TimeLagExpression = {
  id: string
  type: typeof TIME_LAG_EXPRESSION_TYPE
  mode: TimeLagMode
  measure: MeasureExpression
}

export const CUSTOM_SQL_SELECTOR_TYPE = "custom_sql" as const

export type CustomSqlExpression = {
  type: "custom_sql"
  name: string
  table: string
  sql: string
  column: Column | null
  sharedCustom?: boolean
  globalCustom?: boolean
}

export type DimensionExpression = ColumnExpression | CustomSqlExpression

type BaseMeasureExpression =
  | CountExpression
  | ColumnExpression
  | ColumnAggregateExpression
  | CustomSqlExpression
  | TimeLagExpression

export type ComboSizeMeasureExpression = BaseMeasureExpression & {
  linkedTimeLagId?: string
  markSettings: MarkSettings
  minMax?: number[]
}
export type ComboColorMeasureExpression = BaseMeasureExpression & {
  paletteMappingId?: string
  markSettings: MarkSettings
}

export type MeasureExpression =
  | BaseMeasureExpression
  | ComboSizeMeasureExpression
  | ComboColorMeasureExpression

export type Expression = DimensionExpression | MeasureExpression

export enum VegaMarkTypes {
  BAR = "bar",
  LINE = "line",
  BOX = "box",
  VIOLIN = "violin"
}

export type MarkSettings = {
  markType: VegaMarkTypes
  lineStyle: "solid" | "dashed" | "dotted"
  axis: "primary" | "secondary"
  markColor: string

  // Unused props, for now
  hideLine?: boolean
  lineThickness?: number
  lineShadow?: number
}

export type ComboDataSelection = {
  layerId: string
  table: TableProperties | null
  dimensions: {
    xAxis: DimensionExpression[]
    color: DimensionExpression | null
  }
  measures: {
    size: ComboSizeMeasureExpression[]
    color: MeasureExpression | null
  }
  measureTopNOptions?: VegaCustomizableTopNOptions
  topNoptions?: VegaCustomizableTopNOptions
  topNgroups?: string[]
  allOthersGroup?: boolean
  legendCollapsed?: boolean
  paletteMappingId?: string
  lastPaletteMappingId?: string
}

export type BoxPlotDataSelection = {
  layerId: string
  table: TableProperties | null
  dimensions: {
    xAxis: DimensionExpression[]
    // TODO: This is group by dim, add for v2
    // color: DimensionExpression | null
  }
  measures: {
    size: ComboSizeMeasureExpression[]
    color: MeasureExpression | null
  }
  paletteMappingId?: string
  // TODO: Will need to add this back for customizing colors/legend
  // measureTopNOptions?: VegaCustomizableTopNOptions
  // topNoptions?: VegaCustomizableTopNOptions
  // topNgroups?: string[]
  // allOthersGroup?: boolean
  // legendCollapsed?: boolean
}

export type BarDimensionName = "xAxis" | "color"
export type BarMeasureName = "size" | "color"

export type SortColumn = {
  col: {
    name: string
  }
  index: number
  order: "asc" | "desc"
}

// These 'groupable' types are all meant for data selections where the main use
// case is as GROUP BY columns or inputs to aggregate functions that expect
// either a numeric input or a COUNT(DISTINCT)-able type (similar to GROUP-ing).
// We lump them all up together in this notion of 'groupable', for now - the main
// difference from simply categorizing the types is excluding array columns
// and string columns that aren't dictionary-encoded.

export const isGroupableCategorical = (column: Column) =>
  // This fixes the problem of array columns being filtered out, but will there be other side effects?
  // !column.is_array &&
  (TEXT_TYPES[column.type] && column.is_dict) ||
  BOOL_TYPES[column.type] ||
  isIntegerType(column.type)

export const isGroupableNumeric = (column: Column) =>
  !column.is_array && isNumericType(column.type)

export const isGroupableTime = (column: Column) =>
  !column.is_array && isTimeType(column.type)

export const isGroupableQuantitative = (column: Column) =>
  isGroupableNumeric(column) || isGroupableTime(column)

export const isGroupable = (column: Column) =>
  isGroupableCategorical(column) || isGroupableQuantitative(column)

export const isGeo = ({ type }: TTypeInfo) =>
  [
    // TODO: Maybe reconcile these w/ https://github.com/heavyai/immerse/blob/9ee79a0845dd8da82787e4be969a9a51a6d03706/src/components/table-importer/table-importer-helpers.js#L154-L158
    //  and https://github.com/heavyai/immerse/blob/3b9ce8e43bd786cf4afbd280d5748f55e74f7a99/src/reducers/importer-reducer.ts#L461-L466
    //  at some point?
    TDatumType.POINT,
    TDatumType.POLYGON,
    TDatumType.MULTIPOLYGON,
    TDatumType.LINESTRING,
    TDatumType.MULTILINESTRING,
    TDatumType.GEOGRAPHY,
    TDatumType.GEOMETRY
  ].includes(type)

// TODO: this will probably need re-working. It is currently being used to
// determine whether to show PDF/CDF controls in the chart editor presentation
// panel, which requires that the x-axis dimension is quantitative and binned
export const isXAxisBinned = (selectedLayer: ComboDataSelection) =>
  selectedLayer.dimensions.xAxis.every((d) => d.isBinned)

export const DATA_SELECTION_PANEL_TEXT = {
  DIMENSION: "Add a dimension",
  MEASURE: "Add a measure",
  FILTER: "Add a chart-level filter"
}

export enum BoxPlotCenterLineType {
  MEDIAN = "median",
  MEAN = "mean"
}
