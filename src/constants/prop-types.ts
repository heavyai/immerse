// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { flatten, values } from "ramda"
import { AGG_TYPES } from "constants/agg-types"
import { ALL_TYPES, DataTypes } from "constants/data-types"
import { COLOR_TYPES } from "constants/colors"
import PropTypes from "prop-types"
import { Aggregate } from "./agg-types"
import { isChartMultiSource } from "reducers/charts/helpers/multi-source-helpers"

import { CUSTOM_COLORS, getColors } from "services/colors"

const {
  shape,
  object,
  bool,
  func,
  number,
  string,
  array,
  arrayOf,
  oneOf,
  oneOfType,
  instanceOf
} = PropTypes

export const crossfilterShape = object

export const reactRouterRouterShape = shape({
  childRoutes: arrayOf(object),
  Component: func,
  path: string
})

export const columnMetadataShape = shape({
  is_array: bool.isRequired,
  is_dict: bool.isRequired,
  name_is_ambiguous: bool.isRequired,
  table: string.isRequired,
  type: oneOf(Object.keys(ALL_TYPES)),
  value: string.isRequired,
  format: string
})

export type PopupColumnMetadataType = {
  is_array: boolean
  is_dict: boolean
  name_is_ambiguous: boolean
  table: string
  type: DataTypes
  value: string
  format?: string
}

export type PopupColumnType = PopupColumnMetadataType | Measure | Dimension

// Keys of TDatumType enum from Thrift - numbers are enum values
export type DataType =
  | "BOOL" // 10
  | "TINYINT" // 17
  | "SMALLINT" // 0
  | "INT" // 1
  | "BIGINT" // 2
  | "FLOAT" // 3
  | "DECIMAL" // 4
  | "DOUBLE" // 5
  | "STR" // 6
  | "TIME" // 7
  | "TIMESTAMP" // 8
  | "DATE" // 9
  | "POINT" // 13
  | "LINESTRING" // 14
  | "MULTILINESTRING" // 20
  | "POLYGON" // 15
  | "MULTIPOLYGON" // 16
  // Unused in Immerse
  | "INTERVAL_DAY_TIME" // 11
  | "INTERVAL_YEAR_MONTH" // 12
  | "GEOGRAPHY" // 19
  | "EMPTY_COHORT"
  | "UNKNOWN" // TODO: remove with old crossfilter

export interface ColumnMetadata {
  is_array: boolean
  is_dict: boolean
  is_join?: boolean | undefined
  name_is_ambiguous: boolean
  precision: number
  table: string
  column: string
  label: string
  type: DataType
  value: string
  parameter?: boolean
  sharedCustom?: boolean
  globalCustom?: boolean
  name?: string
}

export const colorSwatchShape = shape({
  type: string,
  val: arrayOf(string).isRequired,
  lineStyle: string
})

const nullColorShape = shape({
  type: oneOf(["none"])
})

const regularColorShape = shape({
  key: string.isRequired,
  type: string.isRequired,
  val: arrayOf(string).isRequired
})

const customColors = flatten([values(getColors(CUSTOM_COLORS))])

const customColorShape = shape({
  column: string.isRequired,
  customDomain: arrayOf(string).isRequired,
  customPalette: shape({
    red: arrayOf(oneOf(["#ea5545"])),
    lime: arrayOf(oneOf(["#bdcf32"])),
    purple: arrayOf(oneOf(["#b33dc6"])),
    orange: arrayOf(oneOf(["#ef9b20"])),
    green: arrayOf(oneOf(["#87bc45"])),
    pink: arrayOf(oneOf(["#f46a9b"])),
    silver: arrayOf(oneOf(["#ace5c7"])),
    yellow: arrayOf(oneOf(["#ede15b"])),
    purpleCool: arrayOf(oneOf(["#836dc5"])),
    greenPastel: arrayOf(oneOf(["#86d87f"])),
    blue: arrayOf(oneOf(["#27aeef"]))
  }),
  customKey: oneOf(["key0", "key1"]).isRequired,
  customRange: arrayOf(oneOf(customColors)).isRequired,
  defaultOtherDomain: oneOf(["Default", "Other", "other"]),
  defaultOtherRange: oneOf(customColors),
  isCustom: oneOf([true]).isRequired,
  type: oneOf(["custom"]).isRequired,
  val: arrayOf(oneOf(customColors))
})

export const colorShape = oneOfType([
  regularColorShape,
  customColorShape,
  nullColorShape
])

export const binValueShape = oneOfType([instanceOf(Date), number])

type BinValue = Date | number
export const chartTypeShape = PropTypes.string.isRequired

export type AggregateType = Aggregate | "Count" | "Custom"

export type MultiSourceIndex = string
export const aggTypeShape = oneOf(
  AGG_TYPES.concat(["Count", "Custom", "Sample"])
)

export const dimensionShape = shape({
  autobin: bool,
  currentHighValue: binValueShape,
  currentLowValue: binValueShape,
  multiSourceIndex: number,
  inactive: bool,
  isBinnable: bool,
  isBinned: bool,
  label: string,
  maxBinSize: number,
  max_val: binValueShape,
  min_val: binValueShape,
  numOfBins: number,
  type: string,
  value: string,
  isError: bool,
  isRequired: bool,
  loading: bool
})

export const measureShape = shape({
  aggType: aggTypeShape,
  custom: bool,
  multiSourceIndex: number,
  inactive: bool,
  isError: bool,
  isRequired: bool,
  is_dict: bool,
  label: string,
  name: string,
  originIndex: number,
  type: string,
  value: string,
  loading: bool,
  yAxisOrientation: string
})

interface BaseSelector {
  multiSourceIndex?: MultiSourceIndex
  name?: string
  inactive: boolean
  isError: boolean
  isRequired: boolean
  label: string
  type: string
  value: string
  loading: boolean
}

export interface Measure extends BaseSelector {
  aggType: AggregateType
  custom: boolean
  is_dict: boolean
  name: string
  originIndex: number
  yAxisOrientation: string
  axisLabel?: string
  aggregate?: Aggregate
  colorType?: string
}

export interface Dimension extends BaseSelector {
  newHeatMapDimension?: Boolean
  autobin: boolean
  extentsSet: boolean
  currentHighValue: BinValue
  currentLowValue: BinValue
  isBinnable: boolean
  isBinned: boolean
  maxBinSize: number
  max_val: BinValue
  min_val: BinValue
  numOfBins: number
  timeBin: string
  dateFormat: string
  axisLabel: string
  extract: string
}

export type Selector = Measure | Dimension

export type SelectorIndex = string | number

export const selectorShape = oneOfType([dimensionShape, measureShape, object])

export const customFilterShape = shape({
  expression: string.isRequired
})

export const lassoFilterShape = shape({
  id: string.isRequired,
  type: oneOf(["Feature"]).isRequired,
  properties: object.isRequired,
  geometry: shape({
    coordinates: array.isRequired,
    type: oneOf(["Polygon"]).isRequired,
    center: arrayOf(number),
    radius: number
  }).isRequired
})

export const chartFilterShape = oneOfType([
  number,
  string,
  arrayOf(string),
  arrayOf(number),
  arrayOf(arrayOf(number)),
  arrayOf(instanceOf(Date)),
  lassoFilterShape
])

const sortColumnShape = shape({
  col: oneOfType([
    shape({
      name: string.isRequired
    }),
    shape({
      expression: string.isRequired,
      name: string.isRequired,
      agg_mode: aggTypeShape.isRequired
    }),
    shape({
      expression: string.isRequired,
      name: string.isRequired,
      agg_mode: aggTypeShape.isRequired,
      label: string.isRequired
    })
  ]).isRequired,
  index: number.isRequired,
  order: oneOf(["asc", "desc"]).isRequired
})

const mapZoomCenterShape = shape({
  center: shape({
    lng: number.isRequired,
    lat: number.isRequired
  }),
  bounds: shape({
    lonMin: number.isRequired,
    lonMax: number.isRequired,
    latMin: number.isRequired,
    latMax: number.isRequired
  }),
  zoom: number.isRequired
})

const contourSettings = shape({
  borderWidth: number,
  borderColor: string,
  borderOpacity: number
})

// eslint-disable-next-line consistent-return
const geoJsonChecker = (props, propName, componentName) => {
  const prop = props[propName]
  if (prop !== null && !/json/.test(prop)) {
    return new Error(
      `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`
    )
  }
}

// eslint-disable-next-line consistent-return
const savedColorChecker = (props, propName, componentName) => {
  const savedColors = isChartMultiSource(props)
    ? values(props[propName])
    : [props[propName]]

  let error = false

  savedColors.forEach((savedColor) =>
    Object.keys(savedColor).forEach((key) => {
      if (
        (!COLOR_TYPES.includes(key) && key.indexOf("custom") === -1) ||
        typeof savedColor[key] !== "object"
      ) {
        error = true
      }
    })
  )

  if (error) {
    return new Error(
      `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`
    )
  }
}

const chartState = {
  areFiltersInverse: bool.isRequired,
  autoSize: bool.isRequired,
  cap: number.isRequired,
  color: colorShape,
  coloyByDimension: string,
  colorDomain: arrayOf(number),
  dcFlag: number,
  dimensions: arrayOf(dimensionShape).isRequired,
  elasticX: bool.isRequired,
  filters: arrayOf(chartFilterShape).isRequired,
  fullColorHashing: bool,
  geoJson: geoJsonChecker,
  hoverSelectedColumns: arrayOf(columnMetadataShape),
  linkedZoomEnabled: bool,
  loading: bool,
  mapZoomCenter: mapZoomCenterShape,
  measures: arrayOf(measureShape).isRequired,
  majorContourSettings: contourSettings,
  minorContourSettings: contourSettings,
  numberOfGroups: number,
  rangeChartEnabled: bool.isRequired,
  rangeFilter: arrayOf(oneOfType([number, array])),
  renderArea: bool.isRequired,
  savedColors: savedColorChecker,
  showOther: bool.isRequired,
  sizeDomain: arrayOf(number),
  sizeRange: arrayOf(number),
  sortColumn: sortColumnShape,
  ticks: number.isRequired,
  title: string.isRequired,
  type: string.isRequired,
  yAxisOrientation: string,
  vegaSortColumn: sortColumnShape
}

export const chartShape = shape(chartState)

export const chartSpecShape = shape(
  Object.assign({}, chartState, {
    height: number.isRequired,
    width: number.isRequired
  })
)

export const dashboardSaveStateShape = shape({
  error: bool.isRequired,
  request: bool.isRequired,
  isSaved: bool.isRequired,
  lastState: string
})

export const dashboardLoadStateShape = shape({
  error: bool.isRequired,
  request: bool.isRequired
})

export const reactGridLayoutShape = shape({
  h: number.isRequired,
  i: string.isRequired,
  moved: bool.isRequired,
  static: bool.isRequired,
  w: number.isRequired,
  x: number.isRequired,
  y: number.isRequired
})

export const dashboardSpecShape = shape({
  chartContainers: arrayOf(
    shape({
      id: string.isRequired
    })
  ),
  filtersId: array.isRequired,
  layout: arrayOf(reactGridLayoutShape),
  title: string
})

export const routerParamsShape = shape({
  path: string
})

export const frontEndViewShape = shape({
  image_hash: string.isRequired,
  update_time: string.isRequired,
  dashboard_name: string.isRequired,
  dashboard_state: string.isRequired
})

export const inputFilterShape = shape({
  expression: string,
  value: string,
  operator: string,
  operand: oneOfType([string, array]),
  shouldAutosuggest: bool,
  shouldAutoFill: bool,
  isRelative: bool,
  relativeLabel: string,
  size: shape({
    loading: bool,
    error: bool
  })
})

export const userShape = shape({
  database: string,
  host: string,
  master: bool,
  password: string,
  port: oneOfType([number, string]),
  protocol: string,
  url: string,
  username: string
})

export const highlightShape = shape({
  type: string.isRequired,
  index: number.isRequired,
  status: string.isRequired,
  name: string.isRequired
})

export const importSettingsShape = PropTypes.shape({
  array_begin: string,
  array_delim: string,
  array_end: string,
  delimiter: string,
  escape: string,
  has_header: number,
  line_delim: string,
  null_str: string,
  quote: string,
  quoted: bool,
  threads: number
})

export const importStatusShape = PropTypes.shape({
  elapsed: number,
  rows_completed: number,
  rows_rejected: number,
  rows_estimated: number
})

export const selectorPillHoverShape = PropTypes.shape({
  shouldShowPrompt: PropTypes.bool.isRequired,
  top: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired
})

export const tableShape = PropTypes.shape({
  name: PropTypes.string.isRequired
})

export const selectedPreviewTableShape = PropTypes.shape({
  index: PropTypes.number,
  name: PropTypes.string
})

export const tablePickerStateShape = PropTypes.shape({
  searchVal: PropTypes.string,
  selectedPreviewTable: selectedPreviewTableShape
})

export const tablesShape = PropTypes.shape({
  list: PropTypes.arrayOf(tableShape).isRequired,
  tablePickerState: tablePickerStateShape
})

export const tablesListShape = PropTypes.shape({
  list: PropTypes.array.isRequired,
  listWithMeta: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
  selectedPreviewTable: selectedPreviewTableShape.isRequired
})

export const basemapStyleSpec = PropTypes.shape({
  version: PropTypes.number.isRequired,
  sources: PropTypes.shape({}).isRequired,
  layers: PropTypes.arrayOf(PropTypes.shape({})).isRequired
})

export const basemapValue = PropTypes.oneOfType([
  PropTypes.string,
  basemapStyleSpec
])

export const basemapShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: basemapValue.isRequired
})

// anticipated shape of a user or role for dashboard sharing
export const dashboardSharingUserShape = PropTypes.shape({
  type: PropTypes.string,
  id: PropTypes.string
})

export const jsxPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.object,
  PropTypes.func,
  PropTypes.array
])

export const rowCountShape = PropTypes.shape({
  value: number.isRequired
})
