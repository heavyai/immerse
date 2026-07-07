// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as dataSelectionConstants from "vega/constants/data-selection-action-types"
import {
  BarDimensionName,
  BarMeasureName,
  MeasureExpression,
  DimensionExpression,
  SortColumn
} from "vega/constants/data-selection-types"

export const addDataSelectionDirect = (chartId: string) => ({
  type: dataSelectionConstants.ADD_DATA_SELECTION,
  chartId
})

export const removeDataSelectionDirect = (
  chartId: string,
  layerId: string
) => ({
  type: dataSelectionConstants.REMOVE_DATA_SELECTION,
  chartId,
  layerId
})

export const setSelectedDataSelection = (chartId: string, layerId: string) => ({
  type: dataSelectionConstants.SET_SELECTED_DATA_SELECTION,
  chartId,
  layerId
})

// Actually datasource, not necessarily an individual table
export const setTable = (chartId: string, layerId: string, name: string) => ({
  type: dataSelectionConstants.SET_TABLE,
  chartId,
  layerId,
  name
})

export const clearTable = (chartId: string, layerId: string) => ({
  type: dataSelectionConstants.CLEAR_TABLE,
  chartId,
  layerId
})

export const setDimensionDirect = (
  chartId: string,
  layerId: string,
  dimensionName: BarDimensionName,
  dimensionIndex: number | null,
  expression: DimensionExpression
) => ({
  type: dataSelectionConstants.SET_DIMENSION,
  chartId,
  layerId,
  dimensionName,
  dimensionIndex,
  expression
})

export const clearDimensionDirect = (
  chartId: string,
  layerId: string,
  dimensionName: BarDimensionName,
  dimensionIndex: number | null
) => ({
  type: dataSelectionConstants.CLEAR_DIMENSION,
  chartId,
  layerId,
  dimensionName,
  dimensionIndex
})

// Note: Do not call directly from view components - call the setMeasure thunk instead
export const setMeasureDirect = (
  chartId: string,
  layerId: string,
  measureName: BarMeasureName,
  measureIndex: number | null,
  expression: MeasureExpression,
  markColor: string | undefined
) => ({
  type: dataSelectionConstants.SET_MEASURE,
  chartId,
  layerId,
  measureName,
  measureIndex,
  expression,
  markColor
})

// Note: Do not call directly from view components - call the clearMeasure thunk instead
export const clearMeasureDirect = (
  chartId: string,
  layerId: string,
  measureName: BarMeasureName,
  measureIndex: number | null
) => ({
  type: dataSelectionConstants.CLEAR_MEASURE,
  chartId,
  layerId,
  measureName,
  measureIndex
})

// Setgs full `chart.vegaSortColumn` object at once
export const setBaseDimensionSortOptions = (
  chartId: string,
  vegaSortColumn: SortColumn
) => ({
  type: dataSelectionConstants.SET_BASE_DIMENSION_SORT_OPTIONS,
  chartId,
  vegaSortColumn
})

// Updates just the sort column for base dimension sort
export const updateBaseDimensionSortColumn = (
  chartId: string,
  columnName: string
) => ({
  type: dataSelectionConstants.UPDATE_BASE_DIMENSION_SORT_COLUMN,
  chartId,
  columnName
})

// Updates just sort order / direction for base dimension sort
export const updateBaseDimensionSortOrder = (
  chartId: string,
  order: SortColumn["order"]
) => ({
  type: dataSelectionConstants.UPDATE_BASE_DIMENSION_SORT_ORDER,
  chartId,
  order
})

export const setNumberOfGroups = (chartId: string, numberOfGroups: number) => ({
  type: dataSelectionConstants.SET_NUMBER_OF_GROUPS,
  chartId,
  numberOfGroups
})

export const setViolinDistributionPrecision = (
  chartId: string,
  violinDistributionPrecision: number
) => ({
  type: dataSelectionConstants.SET_VIOLIN_DISTRIBUTION_PRECISION,
  chartId,
  violinDistributionPrecision
})

export const setNullDimensionsEnabled = (
  chartId: string,
  enabled: boolean
) => ({
  type: dataSelectionConstants.SET_NULL_DIMENSIONS_ENABLED,
  chartId,
  enabled
})

export const setConnectNullsAcrossGaps = (
  chartId: string,
  enabled: boolean
) => ({
  type: dataSelectionConstants.SET_CONNECT_NULLS_ACROSS_GAPS,
  chartId,
  enabled
})

export const setRangeChartEnabled = (chartId: string, enabled: boolean) => ({
  type: dataSelectionConstants.SET_RANGE_CHART_ENABLED,
  chartId,
  enabled
})

export const setLegendEnabled = (chartId: string, enabled: boolean) => ({
  type: dataSelectionConstants.SET_LEGEND_ENABLED,
  chartId,
  enabled
})

export const setGridEnabled = (chartId: string, enabled: boolean) => ({
  type: dataSelectionConstants.SET_GRID_ENABLED,
  chartId,
  enabled
})

export const setBarValuesEnabled = (chartId: string, enabled: boolean) => ({
  type: dataSelectionConstants.SET_BAR_VALUES_ENABLED,
  chartId,
  enabled
})

export const clearCustomDimensionsByValue = (
  chartId: string,
  value: string
) => ({
  type: dataSelectionConstants.CLEAR_CUSTOM_DIMENSIONS_BY_VALUE,
  chartId,
  value
})

export const clearCustomMeasuresByValue = (chartId: string, value: string) => ({
  type: dataSelectionConstants.CLEAR_CUSTOM_MEASURES_BY_VALUE,
  chartId,
  value
})

export const setBoxPlotCenterLineType = (
  chartId: string,
  lineType: string
) => ({
  type: dataSelectionConstants.SET_BOX_PLOT_CENTER_LINE_TYPE,
  chartId,
  lineType
})

export const setOutliersEnabled = (chartId: string, enabled: boolean) => ({
  type: dataSelectionConstants.SET_OUTLIERS_ENABLED,
  chartId,
  enabled
})
