// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Filter } from "vega/constants/filter-types"
import {
  ChartFilterMetadata,
  FilterAndCohort
} from "vega/constants/filter-metadata-types"
import {
  DimensionExpression,
  MeasureExpression,
  ComboDataSelection,
  BoxPlotDataSelection,
  SortColumn,
  BoxPlotCenterLineType
} from "vega/constants/data-selection-types"
import {
  VegaBoxPlotPresentationSettings,
  VegaComboPresentationSettings
} from "vega/constants/presentation-settings-types"
import { UserConfig, PreviewStyles } from "components/ui-config-panel/types"
import { OmniColorSchemes } from "services/colors"
import { ChartAnnotationSettings } from "constants/annotations"
import { ColumnMetadata } from "constants/prop-types"
import { ImporterState } from "reducers/importer-reducer"
import { JoinDataSource } from "components/join-manager/join-manager-types"
import { GuidanceSnippet, NotebookCell } from "components/sql-notebook/types"
import { SharedSettingsState } from "components/shared-settings/types"
import { SqlEditorState } from "components/sql-editor/types"
import { TransformedTopNData } from "./top-n-utils"

// Time units that core understands to DATE_TRUNC (binning) and EXTRACT:
// DATE_TRUNC [YEAR, QUARTER, MONTH, DAY, HOUR, MINUTE, SECOND, MILLISECOND,
//             MICROSECOND, NANOSECOND, MILLENNIUM, CENTURY, DECADE, WEEK,
//             QUARTERDAY]
// EXTRACT    [YEAR, QUARTER, MONTH, DAY, HOUR, MINUTE, SECOND, MILLISECOND,
//             MICROSECOND, NANOSECOND, DOW, ISODOW, DOY, EPOCH, QUARTERDAY,
//             WEEK, DATEEPOCH]

type DateTruncTimeUnit =
  | "nanosecond"
  | "microsecond"
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "quarterday"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "decade"
  | "century"
  | "millennium"

export type BinnedTimeUnit = DateTruncTimeUnit | "auto"

export const isBinnedTimeUnit = (str: string): str is BinnedTimeUnit =>
  [
    "auto",
    "nanosecond",
    "microsecond",
    "millisecond",
    "second",
    "minute",
    "hour",
    "quarterday",
    "day",
    "week",
    "month",
    "quarter",
    "year",
    "decade",
    "century",
    "millennium"
  ].includes(str)

export type ExtractTimeUnit =
  | "nanosecond"
  | "microsecond"
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "quarterday"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "doy" // Day of year
  | "dow" // Day of week
  | "isodow" // ISO Day of week
  | "epoch" // Unix epoch
  | "dateepoch" // Unix epoch to just date portion

export const isExtractTimeUnit = (str: string): str is ExtractTimeUnit =>
  [
    "nanosecond",
    "microsecond",
    "millisecond",
    "second",
    "minute",
    "hour",
    "quarterday",
    "day",
    "week",
    "month",
    "quarter",
    "year",
    "doy",
    "dow",
    "isodow",
    "epoch",
    "dateepoch"
  ].includes(str)

export type BinnedTimeDimensionScaleSettings = {
  dimensionType: "binned_time"
  manualMin: string | null
  manualMax: string | null
  timeUnit: BinnedTimeUnit
  format: string | null
}

export type ExtractTimeDimensionScaleSettings = {
  dimensionType: "extract_time"
  timeUnit: ExtractTimeUnit
}

export type BinnedNumericDimensionScaleSettings = {
  dimensionType: "binned_numeric"
  manualMin: number | null
  manualMax: number | null
  numOfBins: number
  format: string | null
}

export type UnbinnedDimensionScaleSettings = {
  dimensionType: "unbinned"
  format: string
}

export type BaseDimensionScaleSettings =
  | BinnedTimeDimensionScaleSettings
  | ExtractTimeDimensionScaleSettings
  | BinnedNumericDimensionScaleSettings
  | UnbinnedDimensionScaleSettings

type ColorMeasureScaleSettings = {
  palette: ColorPalette
  domain: [number, number] | null
  paletteReversed: boolean
}

/** Scale is data transform from domain to range */
export type Scales = {
  colorMeasure: ColorMeasureScaleSettings
}

export type TimeLagSettings = {
  binnedTimeUnit: BinnedTimeUnit
  label: string
  interval: string
  showDelta: boolean
}

export type Chart = {
  id: string
  type: string
  dataSource: string
  data: object
  isLoadingData: boolean
  width: number
  height: number
  binSettings: BaseDimensionScaleSettings | null
  timeLagSettings: TimeLagSettings | null
  annotations?: Record<string, ChartAnnotationSettings>
}

export type VegaTopNOptions = {
  measure: MeasureExpression
  sort: "ASC" | "DESC"
  allOthers: VegaCustomizableTopNItem
  n: number
  showAllOthersInLegend: boolean
  allowNullKeys: boolean
  defaultDeterministicColoring: boolean
  palette: ColorPalette
}

export type VegaCustomizableTopNItem = {
  key: any
  color: string
  disabled?: boolean
}

export type VegaCustomizableTopNAllOther = VegaCustomizableTopNItem & {
  isAllOther?: boolean
}

export type VegaCustomizableTopNOrderedItem = VegaCustomizableTopNItem & {
  order: number
}

export type VegaCustomizableTopNOptions = VegaTopNOptions & {
  staticValues?: VegaCustomizableTopNOrderedItem[]
  dynamicValues?: VegaCustomizableTopNItem[]
  allOthers?: VegaCustomizableTopNAllOther
}

type SolidColorPalette = {
  type: "solid"
  name: string
}

type OrdinalColorPalette = {
  type: "ordinal"
  name: string
}

export type CategoricalColorPalette = SolidColorPalette | OrdinalColorPalette

export type QuantitativeColorPalette = {
  type: "quantitative"
  name: string
}

export type ColorPalette = CategoricalColorPalette | QuantitativeColorPalette

// A single min/max result for a given layer (table + base dimension)
export type MinMaxData = [
  {
    dimensionMin: number | string | Date
    dimensionMax: number | string | Date
  }
]

// The computed min/max from the manually set min and/or max, with either value
// computed over all layers if not manually set. This can represent a timestamp
// min/max, in which case it is expected to only be epoch (numerical) timestamps
export type ComputedMinMax = {
  min: number
  max: number
}

// We store the data objects as a stream of running 'beats' (could also be
// 'epochs', 'cycles', 'flights', 'versions'. 'beats' just sounds more fun). One
// 'beat' represents a complete cycle of fetching data in response to a data
// selection or filter update, including all queries.
export type VegaComboLayerBeatData = {
  incomplete?: boolean
  minmaxQuery: string | null
  minmax: MinMaxData | null
  groupByDimensionQuery: string | null
  groupByDimension: Record<string, any>[] | null
  measureTopNData?: TransformedTopNData | null
  allOthersGroupEnabled?: boolean
  allOthersSentinel: any
  tableQuery: string | null
  table: Record<string, any>[] | null
  error?: string
  fullMinMax: MinMaxData
}

export type VegaBoxPlotLayerBeatData = {
  incomplete?: boolean
  minmaxQuery: string | null
  minmax: MinMaxData | null
  // groupByDimensionQuery: string | null
  // groupByDimension: Record<string, any>[] | null
  // measureTopNData?: TransformedTopNData | null
  // allOthersGroupEnabled?: boolean
  // allOthersSentinel: any
  tableQuery: string | null
  table: Record<string, any>[] | null
  error?: string
  violinData: Record<string, any>[] | null
  violinQuery: string
  outliersData: Record<string, any>[] | null
  outliersQuery: string
  // fullMinMax: MinMaxData
}

type BeatId = string
export type VegaComboLayerData = Record<BeatId, VegaComboLayerBeatData>
export type VegaBoxPlotLayerData = Record<BeatId, VegaBoxPlotLayerBeatData>

export type DataKey = "focus" | "range"

// type LayerId = string
export type VegaComboData = Record<DataKey, VegaComboLayerData[]>
export type VegaBoxPlotData = Record<DataKey, VegaComboLayerData[]>

export type VegaLayerBeatData =
  | VegaBoxPlotLayerBeatData
  | VegaComboLayerBeatData

export type VegaComboChart = Chart & {
  type: "vega-combo"

  // Data selection (pre-data) properties
  vegaSortColumn: SortColumn
  numberOfGroups: number
  showNullDimensions: boolean
  connectNullsAcrossGaps?: boolean
  dataSelections: ComboDataSelection[]
  selectedLayerId: string
  rangeChartEnabled: boolean
  legendEnabled?: boolean
  gridEnabled?: boolean
  barValuesEnabled?: boolean

  // Data (retrieved results)
  data: VegaComboData

  // Presentation (post-data) properties
  presentation: VegaComboPresentationSettings
  scales: Scales

  layersLegendPinned: boolean
  collapsedLegendLayers?: { [key: string]: boolean }
  shiftToZoom: boolean
}

export type VegaBoxPlotChart = Chart & {
  type: "box-plot"

  // Data selection (pre-data) properties
  vegaSortColumn: SortColumn
  numberOfGroups: number
  violinDistributionPrecision: number
  showNullDimensions: boolean
  dataSelections: BoxPlotDataSelection[]
  selectedLayerId: string
  legendEnabled?: boolean
  gridEnabled?: boolean
  barValuesEnabled?: boolean
  outliersEnabled: boolean
  defaultAggregation: string

  // Data (retrieved results)
  data: VegaBoxPlotData

  // Presentation (post-data) properties
  presentation: VegaBoxPlotPresentationSettings
  scales: Scales

  layersLegendPinned: boolean
  collapsedLegendLayers?: { [key: string]: boolean }
  shiftToZoom: boolean
  centerLineType: BoxPlotCenterLineType
}

// TODO: Stand-in for the `charts` state object, only accounting for Vega Combo, for
// the temporary benefit of Redux selectors / reducers on that state
export type ChartsState = Record<string, VegaChart>

/** These are the styles directly from servers.json, in the `customStyles` property */
export interface CustomStyles {
  logoURL?: string
  buttonPrimaryColor?: string
  colors?: {
    solid?: string[]
    custom?: string[]
    ordinal?: string[][]
    quantitative?: string[][]
  }
}

export type LayoutItem = {
  w: number
  h: number
  x: number
  y: number
  i: string
  moved: boolean
  static: boolean
}

type TableResult = { name: string }

// Response from getTables
type Tables = { list: TableResult[] }

export type TableRowDescription = {
  col_name: string
  col_type: {
    type: number
    encoding: number
    nullable: boolean
    is_array: boolean
    precision: number
    scale: number
    comp_param: number
    size: number
    dict_key: string
  }
  is_reserved_keyword: boolean
  src_name: string
  is_system: boolean
  is_physical: boolean
  col_id: number
  default_value: string
  comment: string
}

export type TableDetails = {
  row_desc: Array<TableRowDescription>
  fragment_size: number
  page_size: number
  max_rows: number
  view_sql: string
  shard_count: number
  key_metainfo: string
  is_temporary: false
  partition_detail: number
  table_type: number
  refresh_info: {
    update_type: number
    timing_type: number
    start_date_time: string
    interval_type: number
    interval_count: number
    last_refresh_time: string
    next_refresh_time: string
  }
  sharded_column_name: string
  comment: string
  columns: Array<ColumnMetadata>
}

export type TablePreview = {
  rowCount: { value: number } | null
  fields: any
  loading: boolean
  error: boolean
  tableName: string | null
  tableDetails: TableDetails
}

export type SqlNotebookState = {
  cells: NotebookCell[]
  loading: boolean
  fastforwardDefault: boolean
  scrollToCellIndex: number | null
  defaultAnalysisSources: Array<string>
  guidanceSnippets: {
    snippets: GuidanceSnippet[] | null
    loading: boolean
    getGuidanceSnippetsError?: string
    editingSnippetId?: string
    editModalOpen?: boolean
  }
  iqEnabled?: boolean
  deletedGuidanceSnippets: { [responseId: string]: GuidanceSnippet[] }
}

export type AppState = {
  charts: ChartsState
  userConfigurableUI: {
    serversJSONColors: OmniColorSchemes
    savedDatabaseStyles: UserConfig
    previewStyles: PreviewStyles
    themeTint: any
  }
  connection: {
    user: {
      customStyles: CustomStyles
      uiConfigRole?: string
      username: string
      database: string
    }
    isSuperuser: boolean
    roles: string[]
    privileges: {
      createDashboard: boolean
      createTable: boolean
      fetchComplete: boolean
      viewSqlEditor: boolean
    }
    sessionInfo: {
      database: string
    }
    isDemo: boolean
  }
  dashboard: {
    dataSources: Record<string, { columnMetadata: ColumnMetadata[] }>
    userConfigurableUI: UserConfig
    layout: LayoutItem[]
    privileges: {
      editDashboard: boolean
    }
    id: string
  }
  dashboards: {
    list: {
      dashboard_id: string
      dashboard_name: string
    }[]
    loading: boolean
    loaded: boolean
    error: boolean
  }
  ui: {
    modal: {
      migrationInProgress?: boolean
    }
    joinManagerProps: {
      chartId: string
      layerId?: string
      joinDefinition: JoinDataSource
    }
  }
  importer: ImporterState
  tablePreview: TablePreview
  tables: { list: Tables[] }
  joinDataSources?: JoinDataSource[]
  tablesReference: { list: { name: string; label: "obs" }[]; loading: boolean } // label is seemingly obsolete,
  sqlNotebook: SqlNotebookState
  sharedSettings: SharedSettingsState
  sharedSettingsImport: {
    sharedSettings: SharedSettingsState
    loading: boolean
    error: boolean
    selectedDashboardId?: string
  }
  sqlEditor: SqlEditorState
}

// Added to TopN spec purely to differentiate it when the static/dynamic values
// are enabled or disabled, which isn't represented elsewhere but requires us
// retrieving new data (so that those series get represented in All Others)
type CustomValue = {
  key: any
  disabled?: boolean
}

export type VegaComboTopNQuerySpec = {
  type: "vega-combo-top-n"
  table: string
  dataSource: string
  dimension?: DimensionExpression
  measure: MeasureExpression
  customValues: CustomValue[] | null
  appliedFilters: FilterAndCohort[]
  n: number
  sort: "ASC" | "DESC"
  allOthers: boolean
  allowNullKeys: boolean
  count: number
}

// TODO: Not sure if we need this for box plot
export type VegaBoxPlotTopNQuerySpec = {
  type: "vega-box-plot-top-n"
  table: string
  dataSource: string
  dimension?: DimensionExpression
  measure: MeasureExpression
  customValues: CustomValue[] | null
  appliedFilters: FilterAndCohort[]
  n: number
  sort: "ASC" | "DESC"
  allOthers: boolean
  allowNullKeys: boolean
  count: number
}

export type VegaComboChartQuerySpec = {
  type: "vega-combo-chart"
  table: string
  baseDimensions: DimensionExpression[]
  groupByDimension: DimensionExpression | null
  sizeMeasures: MeasureExpression[]
  colorMeasure: MeasureExpression | null
  groups?: string[]
  numberOfGroups: number
  nullDimensionsEnabled: boolean
  appliedFilters: FilterAndCohort[]
  sortColumn: SortColumn
  binSettings: BaseDimensionScaleSettings | null
  timeLagSettings: TimeLagSettings | null
  rangeFilter: ChartFilterMetadata | undefined
  joinFilters: string[]
}
export type VegaBoxPlotChartQuerySpec = {
  // This is used to determine the how to generate the query
  type: "vega-box-plot"
  table: string
  baseDimensions: DimensionExpression[]
  // Version 2 will have group by
  // groupByDimension: DimensionExpression | null
  // TODO: will we have size measures? seems to be just color
  sizeMeasures: MeasureExpression[]
  colorMeasure: MeasureExpression | null
  // TODO: Check this? enabledgroups?
  groups?: string[]
  numberOfGroups: number
  violinDistributionPrecision: number
  nullDimensionsEnabled: boolean
  appliedFilters: FilterAndCohort[]
  sortColumn: SortColumn
  joinFilters: string[]
  centerLineType: BoxPlotCenterLineType
  outliersEnabled: boolean
  manualDomainExtents?: number[]
}

export type VegaChartQuerySpec =
  | VegaComboChartQuerySpec
  | VegaBoxPlotChartQuerySpec

export type VegaComboQuerySpec = {
  type: "vega-combo"
  dataKey: DataKey
  groupByDimension: (VegaComboTopNQuerySpec | undefined)[]
  table: VegaComboChartQuerySpec[]
}

export type VegaBoxPlotQuerySpec = {
  type: "vega-box-plot"
  dataKey: DataKey
  groupByDimension: (VegaBoxPlotTopNQuerySpec | undefined)[]
  table: VegaBoxPlotChartQuerySpec[]
}

// TODO: Integrate with VegaCombo data selection and genericize
type Measure = any

export type VegaPointmapMeasure = Measure & {
  minMax: [number, number]
}

export type VegaPointmapChart = Chart & {
  type: "vega-pointmap"
  measures: VegaPointmapMeasure[]
}

export type VegaPointmapQuerySpec = {
  type: "vega-pointmap"
  table: string
  lonMeasure: VegaPointmapMeasure
  latMeasure: VegaPointmapMeasure
  appliedFilters: Filter[]
}

export type VegaChart = VegaComboChart | VegaPointmapChart | VegaBoxPlotChart

export type VegaQuerySpec =
  | VegaComboQuerySpec
  | VegaPointmapQuerySpec
  | VegaBoxPlotQuerySpec

export type VegaQuerySpecs =
  | (VegaQuerySpec | Record<string, VegaQuerySpec>)
  | Array<VegaQuerySpec | Record<string, VegaQuerySpec>>

/**
 * Function to compute size and position of the chart body.
 * @param chartBodyNode The chart body node
 * @returns an object with the properties top, right, bottom, and left.
 */
export type GetChartBodySizeAndPosition = (
  chartBodyNode: Element
) => {
  top: number
  right: number
  bottom: number
  left: number
}

export enum AxisOrientation {
  LEFT = "left",
  RIGHT = "right",
  TOP = "top",
  BOTTOM = "bottom"
}
