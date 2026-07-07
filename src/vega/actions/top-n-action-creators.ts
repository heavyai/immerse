// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dispatch } from "redux"

import { getLayerIndex } from "vega/utils/data-selection"

import { VegaCustomizableTopNOptions, VegaTopNOptions } from "vega/charts/types"
import * as topnConstants from "../constants/top-n-action-types"
import {
  MeasureExpression,
  Aggregate
} from "vega/constants/data-selection-types"

import { buildDefaultCustomizableTopNOptions } from "vega/charts/top-n-utils"

/**
 * Set Top-N options
 * @param chartId The chart's ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 * @param options The Top-N Options to set
 */
export const topnSetOptions = (
  chartId: string,
  layerId: string,
  propertyName: string,
  options: VegaCustomizableTopNOptions
) => ({
  type: topnConstants.TOPN_SET_OPTIONS,
  chartId,
  layerId,
  propertyName,
  options
})

/**
 * Reset Top-N options
 * @param chartId The chart's ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 */
export const topnResetOptions = (
  chartId: string,
  layerId: string,
  propertyName: string,
  defaultOptions?: Partial<VegaTopNOptions>
) => async (dispatch: Dispatch, getState: any) => {
  const { charts } = getState()
  const chart = charts[chartId]
  const dataSelectionIndex = getLayerIndex(chart.dataSelections, layerId)
  const dataSelection = chart.dataSelections[dataSelectionIndex]
  const options = buildDefaultCustomizableTopNOptions(
    dataSelection.table.name,
    dataSelectionIndex,
    defaultOptions
  )
  await dispatch({
    type: topnConstants.TOPN_RESET_OPTIONS,
    chartId,
    layerId,
    propertyName,
    options
  })
}

/**
 * Reset Top-N options allOthers key
 * @param chartId The chart's ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 */
export const topnResetAllOthersOptions = (
  chartId: string,
  layerId: string,
  propertyName: string
) => async (dispatch: Dispatch, getState: any) => {
  const { charts } = getState()
  const chart = charts[chartId]
  const dataSelectionIndex = getLayerIndex(chart.dataSelections, layerId)
  const dataSelection = chart.dataSelections[dataSelectionIndex]
  const currentOptions = dataSelection.topNoptions
  const currentAllOther = currentOptions.allOthers

  const options = {
    ...currentOptions,
    allOthers: {
      ...currentAllOther,
      key: `others${dataSelectionIndex}`
    }
  }

  await dispatch({
    type: topnConstants.TOPN_RESET_OPTIONS,
    chartId,
    layerId,
    propertyName,
    options
  })
}

/**
 * Update "N"
 * @param chartId The chart ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 * @param n New value for N
 */
export const topnUpdateN = (
  chartId: string,
  layerId: string,
  propertyName: string,
  n: number
) => ({
  type: topnConstants.TOPN_UPDATE_N,
  chartId,
  layerId,
  propertyName,
  n
})

/**
 * Set the measure for the top-n options
 * @param chartId The chart ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 * @param measure The measure to set
 */
export const topnSetMeasure = (
  chartId: string,
  layerId: string,
  propertyName: string,
  measure: MeasureExpression
) => ({
  type: topnConstants.TOPN_SET_MEASURE,
  chartId,
  layerId,
  propertyName,
  measure
})

/**
 * Set the measure aggregate for the top-n options
 * @param chartId The chart ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 * @param aggregate The aggregate to set on on a topN measure
 */
export const topnSetMeasureAggregate = (
  chartId: string,
  layerId: string,
  propertyName: string,
  aggregate: Aggregate
) => ({
  type: topnConstants.TOPN_SET_MEASURE_AGGREGATE,
  chartId,
  layerId,
  propertyName,
  aggregate
})

/**
 * Set the sort order for top-n
 * @param chartId The chart ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 * @param sort Either "ASC" or "DESC"
 */
export const topnSetSortOrder = (
  chartId: string,
  layerId: string,
  propertyName: string,
  sort: VegaCustomizableTopNOptions["sort"]
) => ({
  type: topnConstants.TOPN_SET_SORT_ORDER,
  chartId,
  layerId,
  propertyName,
  sort
})

/**
 * Lock a top-n value
 * @param chartId The chart ID
 * @param layerId the id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 * @param key The key of the value
 * @param color The locked key's color
 * @param disabled
 */
export const topnLock = (
  chartId: string,
  layerId: string,
  propertyName: string,
  key: string,
  color: string,
  disabled?: boolean
) => ({
  type: topnConstants.TOPN_LOCK,
  chartId,
  layerId,
  propertyName,
  key,
  color,
  disabled
})

/**
 * Unlock a top-n value
 * @param chartId The chart ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 * @param key The key of the value to unlock
 */
export const topnUnlock = (
  chartId: string,
  layerId: string,
  propertyName: string,
  key: string
) => ({
  type: topnConstants.TOPN_UNLOCK,
  chartId,
  layerId,
  propertyName,
  key
})

/**
 * Reorder a locked top-n value
 * @param chartId The chart ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 * @param key The key of the value to move
 * @param order The new order - other locked values will automatically be
 *   reordered
 */
export const topnSetPosition = (
  chartId: string,
  layerId: string,
  propertyName: string,
  key: string,
  order: number
) => ({
  type: topnConstants.TOPN_SET_POSITION,
  chartId,
  layerId,
  propertyName,
  key,
  order
})

/**
 * Set a color for a top-n value. The value may either be locked or unlocked.
 * @param chartId The chart ID
 * @param layerId the id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 * @param key The key of the value whose color will be set
 * @param color The color to use
 * @param isAllOther is optional parameter helps to identify the All Others
 */
export const topnSetColor = (
  chartId: string,
  layerId: string,
  propertyName: string,
  key: string,
  color: string,
  isAllOther?: boolean,
  isMeasure = false
) => {
  return async (dispatch: Dispatch, getState: any) => {
    const state = getState()
    const chart = state.charts[chartId]
    const dataSelections = chart.dataSelections
    const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
    const dataSelection = chart.dataSelections[dataSelectionIndex]
    // Use color measure if set, fallback to dimension
    const paletteMappingId =
      dataSelection.measures.color?.paletteMappingId ??
      dataSelection.dimensions.color?.paletteMappingId ??
      dataSelection.paletteMappingId
    if (paletteMappingId) {
      const paletteMapping = state.sharedSettings.mappings.find(
        (m) => m.id === paletteMappingId
      )
      await dispatch({
        type: topnConstants.TOPN_SET_FROM_PALETTE_MAPPING,
        chartId,
        layerId,
        propertyName,
        paletteMapping,
        isMeasure
      })
    }
    dispatch({
      type: topnConstants.TOPN_SET_COLOR,
      chartId,
      layerId,
      propertyName,
      key,
      color,
      isAllOther
    })
  }
}

/**
 * Toggle a top-n value.
 * @param chartId The chart ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 * @param key The key of the value whose color will be set
 */
export const topnToggle = (
  chartId: string,
  layerId: string,
  propertyName: string,
  key: string
) => ({
  type: topnConstants.TOPN_TOGGLE,
  chartId,
  layerId,
  propertyName,
  key
})

/**
 * Toggle the "All Others" option
 * @param chartId The chart ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *   charts[chartId].propertyName)
 */
export const topnToggleAllOthers = (
  chartId: string,
  layerId: string,
  propertyName: string
) => ({
  type: topnConstants.TOPN_TOGGLE_ALL_OTHERS,
  chartId,
  layerId,
  propertyName
})

/**
 * Apply manual selections
 * @param chartId The chart ID
 * @param layerId The id of the layer in the chart
 * @param propertyName The name of the chart's property in redux (ie,
 *    charts[chartId].propertyName)
 * @param selections The user's selections from the category selection modal
 * @param topNOptions All the current options in the topN component. Used to
 *    determine color data
 */
export const topnSetManualSelection = (
  chartId: string,
  layerId: string,
  propertyName: string,
  selections: string[],
  topNData: Record<string, any>[],
  topNOptions: VegaCustomizableTopNOptions
) => ({
  type: topnConstants.TOPN_MANUAL_SELECTION,
  chartId,
  layerId,
  propertyName,
  selections,
  topNData,
  topNOptions
})

export const topNShowAllOthersInLegend = (
  chartId: string,
  layerId: string,
  enabled: boolean
) => ({
  type: topnConstants.TOPN_SHOW_ALL_OTHERS_IN_LEGEND,
  chartId,
  layerId,
  enabled
})

export const topNAllowNullKeys = (
  chartId: string,
  layerId: string,
  enabled: boolean
) => ({
  type: topnConstants.TOPN_ALLOW_NULL_KEYS,
  chartId,
  layerId,
  enabled
})
