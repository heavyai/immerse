// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SCALE_TYPES } from "./visualization/chart-settings/constants"
import moment from "moment"

export enum CellType {
  RESULT_TABLE = "result-table",
  RESULT_SQL = "result-sql",
  RESULT_ANALYSIS = "result-analysis",
  INPUT_SQL = "input-sql",
  INPUT_ANALYSIS = "input-analysis",
  STATUS = "status"
}

export type TablesBrowserRow = {
  value: string
}

type BaseCell = {
  type: CellType
  input: string
  loading?: boolean
  error?: string
  isVega?: boolean
}

export type NotebookCell =
  | ResultTableCell
  | InputSqlCell
  | ResultSqlCell
  | ResultAnalysisCell
  | InputAnalysisCell
  | StatusCell

export type InputCell = InputSqlCell | InputAnalysisCell

type StatusCell = {
  type: CellType.STATUS
  loading?: boolean
  error?: string
  sql?: string
}

export type ResultTableCell = BaseCell & {
  type: CellType.RESULT_TABLE
  results?: ResultData
}

export type ResultSqlCell = BaseCell & {
  type: CellType.RESULT_SQL
  lastRunSql?: string
  activeTab?: ResultTabKey
  results?: ResultData
}

export type ResultData = {
  fields?: ResultDataField[]
  results: { [key: string]: any }[]
  table?: string
  query?: string
  timing: { execution_time: number; total_time_ms: number }
  numBins: number
  image?: string
}

export type ResultDataField = {
  name: string
  type: string
  is_array: boolean
}

export type FieldsByType = { [key in VegaTypeMap]: ChartField[] }

export type BaseInputCell = BaseCell & {
  autodetectSql?: boolean // Allow auto-toggling to SQL input if SQL is detected
  autodetectedType?: boolean
}

export type InputSqlCell = BaseInputCell & {
  type: CellType.INPUT_SQL
}

// HeavyIQ input
export type InputAnalysisCell = BaseInputCell & {
  type: CellType.INPUT_ANALYSIS
  sources: string[]
  autoTables?: string[] // IQ autoselected tables
  usedSnippets?: UsedSnippet[]
}

// HeavyIQ result
export type ResultAnalysisCell = BaseCell & {
  type: CellType.RESULT_ANALYSIS
  answer: string
  generatedSql: string
  // If anaylsis result, not sql result
  sqlComplexity?: number
  feedbackId?: string
  tables?: Array<String>
  lastRunSql?: string
  activeTab?: ResultTabKey
  results?: ResultData
  hideAnalysis?: boolean
  iqError?: string | null
}

// Visualization Chart Gen Types
export type ChartDef = {
  type: ChartTypes
  spec?: any
  data?: any[]
  fields?: ChartField[]
  settings?: ChartSettings
  table?: string
  query?: string
  update?: (
    chartUpdates: ChartTypeState,
    data?: any,
    settings?: ChartSettings
  ) => ChartDef
}

export type ChartField = {
  field: string
  type: VegaTypeMap
  required: boolean
  active: boolean
  binning?: boolean
  numBins?: number
  assignedTo?: string
  static?: boolean
  joinField?: string
  joinDataset?: string
}

export type ChartSettings = {
  pointSize?: number
  binnableFields?: string[]
  binned?: boolean
  availableScales?: SCALE_TYPES[]
  scaleType?: string
  dotDensity?: boolean
  sizeRange?: number[] | null | undefined
  border?: boolean
  strokeWidth?: number
  clamp?: boolean
  renderLimit?: number
}

export enum ChartTypes {
  HISTOGRAM = "Histogram",
  BAR = "Bar Chart",
  LAYERED_BAR = "Multi-Series Bar Chart",
  PIE = "Pie Chart",
  LINE = "Line Chart",
  LAYERED_LINE = "Multi-Series Line Chart",
  SCATTER = "Scatterplot",
  HEATMAP = "Heatmap",
  VEGA_CHOROPLETH = "Choropleth",
  POINT_MAP = "Pointmap",
  POLYGON_MAP = "Polygon Map",
  LINE_MAP = "Line Map"
}
export type ChartType = keyof typeof ChartTypes

export enum VegaTypeMap {
  STRING = "nominal", // do we need to differentiate btw. nominal and ordinal?
  NUMBER = "quantitative",
  DATE = "temporal",
  LATITUDE = "latitude",
  LONGITUDE = "longitude",
  POINT = "point",
  POLYGON = "polygon",
  LINE = "line",
  NON_LOCATION_NUMBER = "non-location-number"
}

export const VALID_NUMBER_TYPES = [
  VegaTypeMap.NUMBER,
  VegaTypeMap.NON_LOCATION_NUMBER
]

export enum ChartFieldAssignment {
  X = "x",
  X_OFFSET = "xOffset",
  Y = "y",
  Y1 = "y1",
  X2 = "x2",
  Y2 = "y2",
  Y3 = "y3",
  Y4 = "y4",
  Y5 = "y5",
  THETA = "theta",
  COLOR = "color",
  SIZE = "size",
  LAT = "latitude",
  LON = "longitude",
  POINT = "point",
  POLYGON = "polygon",
  LINE = "line",
  GEOM = "geom",
  JOIN = "join"
}

export type ChartTypeSchema = {
  [ChartTypes.HISTOGRAM]: ChartFieldAssignment[]
  [ChartTypes.BAR]: ChartFieldAssignment[]
  [ChartTypes.LAYERED_BAR]: ChartFieldAssignment[]
  [ChartTypes.PIE]: ChartFieldAssignment[]
  [ChartTypes.LINE]: ChartFieldAssignment[]
  [ChartTypes.LAYERED_LINE]: ChartFieldAssignment[]
  [ChartTypes.SCATTER]: ChartFieldAssignment[]
  [ChartTypes.HEATMAP]: ChartFieldAssignment[]
  [ChartTypes.VEGA_CHOROPLETH]: ChartFieldAssignment[]
  [ChartTypes.POINT_MAP]: ChartFieldAssignment[]
  [ChartTypes.POLYGON_MAP]: ChartFieldAssignment[]
  [ChartTypes.LINE_MAP]: ChartFieldAssignment[]
}

export const CHART_TYPE_SCHEMA: ChartTypeSchema = {
  [ChartTypes.HISTOGRAM]: [ChartFieldAssignment.X],
  [ChartTypes.BAR]: [
    ChartFieldAssignment.X,
    ChartFieldAssignment.Y,
    ChartFieldAssignment.COLOR
  ],
  [ChartTypes.LAYERED_BAR]: [
    ChartFieldAssignment.X,
    ChartFieldAssignment.Y1,
    ChartFieldAssignment.Y2,
    ChartFieldAssignment.Y3,
    ChartFieldAssignment.Y4,
    ChartFieldAssignment.Y5
  ],
  [ChartTypes.PIE]: [ChartFieldAssignment.THETA, ChartFieldAssignment.COLOR],
  [ChartTypes.LINE]: [
    ChartFieldAssignment.X,
    ChartFieldAssignment.Y,
    ChartFieldAssignment.COLOR
  ],
  [ChartTypes.LAYERED_LINE]: [
    ChartFieldAssignment.X,
    ChartFieldAssignment.Y1,
    ChartFieldAssignment.Y2,
    ChartFieldAssignment.Y3,
    ChartFieldAssignment.Y4,
    ChartFieldAssignment.Y5
  ],
  [ChartTypes.SCATTER]: [
    ChartFieldAssignment.X,
    ChartFieldAssignment.Y,
    ChartFieldAssignment.COLOR,
    ChartFieldAssignment.SIZE
  ],
  [ChartTypes.HEATMAP]: [
    ChartFieldAssignment.X,
    ChartFieldAssignment.Y,
    ChartFieldAssignment.COLOR
  ],
  [ChartTypes.VEGA_CHOROPLETH]: [
    ChartFieldAssignment.JOIN,
    ChartFieldAssignment.COLOR
  ],
  [ChartTypes.POINT_MAP]: [
    ChartFieldAssignment.POINT,
    ChartFieldAssignment.LAT,
    ChartFieldAssignment.LON,
    ChartFieldAssignment.COLOR,
    ChartFieldAssignment.SIZE
  ],
  [ChartTypes.POLYGON_MAP]: [
    ChartFieldAssignment.GEOM,
    ChartFieldAssignment.COLOR
  ],
  [ChartTypes.LINE_MAP]: [
    ChartFieldAssignment.GEOM,
    ChartFieldAssignment.COLOR,
    ChartFieldAssignment.SIZE
  ]
}

export type ChartTypeState = {
  [field: string]: ChartField
}

export enum ResultTabKey {
  DETAILS = "DETAILS",
  ANALYSIS = "ANALYSIS",
  VISUALIZATION = "VISUALIZATION"
}

export enum LeftPanelTabKey {
  DATA = "DATA",
  GUIDANCE = "GUIDANCE"
}

export enum GuidanceSnippetSortOptionKey {
  OLDEST = "OLDEST",
  NEWEST = "NEWEST",
  NAME = "NAME"
}

export enum SortDirectionOption {
  DESC = "DESC",
  ASC = "ASC"
}

// Snippet object directly from IQ
export type GuidanceSnippet = {
  snippet_id: string
  snippet: string
  created_at: string
  updated_at: string
}

export type UsedSnippet = {
  id: string
  snippet: string
}

// Snippet with created/updated strings replaced by moment objects for sorting
export type GuidanceSnippetWithMoment = Omit<
  GuidanceSnippet,
  "created_at" | "updated_at"
> & {
  created_at: moment.Moment
  updated_at: moment.Moment
}

export type GuidanceSnippetSortOption = {
  key: GuidanceSnippetSortOptionKey
  label: string
  order: SortDirectionOption
  property: keyof GuidanceSnippet
}
