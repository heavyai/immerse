// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as vegaConstants from "vega/constants/vega-data-action-types"
import { DataKey, VegaComboLayerBeatData } from "vega/charts/types"

/**
 * @param chartId The chart id
 * @param dataKey Which key to store under for the chart (e.g. "focus", "range")
 * @param layerIndex The layer index to save to
 * @param beatId A unique, incrementing id for this iteration of data
 * @param data The data itself
 */
export const receiveData = (
  chartId: string,
  dashboardId: string,
  tabId: string,
  dataKey: DataKey,
  layerIndex: number,
  beatId: string,
  data: VegaComboLayerBeatData
) => ({
  type: vegaConstants.RECEIVE_DATA_MULTI,
  chartId,
  dashboardId,
  tabId,
  dataKey,
  layerIndex,
  beatId,
  data
})

/**
 * @param chartId The chart id
 * @param dataKey Which key to store under for the chart (e.g. "focus", "range")
 * @param layerIndex The layer index to save to
 * @param beatId A unique, incrementing id for this iteration of data
 * @param error The error received
 */
export const receiveError = (
  chartId: string,
  dashboardId: string,
  tabId: string,
  dataKey: DataKey,
  layerIndex: number,
  beatId: string,
  error: Error
) => ({
  type: vegaConstants.RECEIVE_ERROR,
  chartId,
  dashboardId,
  tabId,
  dataKey,
  layerIndex,
  beatId,
  error
})

/**
 * Used to indicate that the chart is loading data
 * @param id The chart id
 */
export const requestData = (
  chartId: string,
  dashboardId: string,
  tabId: string,
  dataKey: DataKey,
  layerIndex: number,
  beatId: string
) => ({
  type: vegaConstants.REQUEST_DATA,
  chartId,
  dashboardId,
  tabId,
  dataKey,
  layerIndex,
  beatId
})
