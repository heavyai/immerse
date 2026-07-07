// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const CREATE_GEOHEAT_CHART = "CREATE_GEOHEAT_CHART"
export const UPDATE_GEOHEAT_CHART = "UPDATE_GEOHEAT_CHART"
export const UPDATE_GEOHEAT_COLOR_DOMAIN = "UPDATE_GEOHEAT_COLOR_DOMAIN"
export const SET_GEOHEAT_MARK_TYPE = "SET_GEOHEAT_MARK_TYPE"
export const SET_GEOHEAT_COLOR_RANGE = "SET_GEOHEAT_COLOR_RANGE"
export const SET_GEOHEAT_PIXEL_SIZE = "SET_GEOHEAT_PIXEL_SIZE"
export const DESTROY_GEOHEAT = "DESTROY_GEOHEAT"
export const SET_GEOHEAT_MEASURE = "SET_GEOHEAT_MEASURE"
export const SET_GEOHEAT_DIMENSION = "SET_GEOHEAT_DIMENSION"
export const RESET_RASTER_CHART = "RESET_RASTER_CHART"
export const SAVE_LEGEND_OPEN_STATE = "SAVE_LEGEND_OPEN_STATE"
export const APPLY_POSTFILTER_ON_EXISTING_CHART =
  "APPLY_POSTFILTER_ON_EXISTING_CHART"
export const APPLY_POPUP_ON_EXISTING_CHART = "APPLY_POPUP_ON_EXISTING_CHART"
export const APPLY_LAYER_VISIBILITY_ON_EXISTING_CHART =
  "APPLY_LAYER_VISIBILITY_ON_EXISTING_CHART"
export const APPLY_ORIENTATIION_ON_EXISTING_CHART =
  "APPLY_ORIENTATIION_ON_EXISTING_CHART"
export const APPLY_RASTER_SHOW_OTHER_ON_EXISTING_CHART =
  "APPLY_RASTER_SHOW_OTHER_ON_EXISTING_CHART"
import { ColorPayload, GeoHeatState } from "./raster-chart-types"

export type CREATE_GEOHEAT_CHART_ACTION = {
  type: "CREATE_GEOHEAT_CHART"
  chartId: string
  chartSpec: GeoHeatState
  layerId: string
  dashboardId: number
  tabId: string
}

export function createGeoHeatChart(chartId: string, chartSpec: GeoHeatState) {
  return (dispatch, getState) => {
    const { id: dashboardId, selectedTabId: tabId } = getState().dashboard

    dispatch({
      type: CREATE_GEOHEAT_CHART,
      chartId,
      chartSpec,
      dashboardId,
      tabId
    })
  }
}

export function resetRasterChart(chartId, chartSpec, prevChartSpec) {
  return {
    type: RESET_RASTER_CHART,
    chartId,
    chartSpec,
    prevChartSpec
  }
}

export type UPDATE_GEOHEAT_CHART_ACTION = {
  type: "UPDATE_GEOHEAT_CHART"
  chartId: string
  updates: {
    width: number
    height: number
  }
}

export function updateGeoHeatChart(
  chartId: string,
  updates: { width: number; height: number }
): UPDATE_GEOHEAT_CHART_ACTION {
  return {
    type: UPDATE_GEOHEAT_CHART,
    chartId,
    updates
  }
}

export function applyNewPropsToExistingChart(chartId: string) {
  return (dispatch) => {
    // Applying new properties to existing raster charts if needed
    dispatch({
      type: APPLY_POSTFILTER_ON_EXISTING_CHART,
      chartId
    })
    dispatch({
      type: APPLY_POPUP_ON_EXISTING_CHART,
      chartId
    })
    dispatch({
      type: APPLY_ORIENTATIION_ON_EXISTING_CHART,
      chartId
    })
    dispatch({
      type: APPLY_LAYER_VISIBILITY_ON_EXISTING_CHART,
      chartId
    })
    dispatch({
      type: APPLY_RASTER_SHOW_OTHER_ON_EXISTING_CHART,
      chartId
    })
  }
}

export type SET_MARK_TYPE_ACTION = {
  type: "SET_GEOHEAT_MARK_TYPE"
  chartId: string
  mark: "hex" | "square"
}

export function setMarkType(
  chartId: string,
  mark: "hex" | "square"
): SET_MARK_TYPE_ACTION {
  return {
    type: SET_GEOHEAT_MARK_TYPE,
    chartId,
    mark
  }
}

export type UPDATE_GEOHEAT_COLOR_RANGE_ACTION = {
  type: "SET_GEOHEAT_COLOR_RANGE"
  chartId: string
  color: {
    reverse: boolean
    type: string
    val: string[]
  }
}

export function updateGeoHeatColorRange(
  chartId: string,
  payload: ColorPayload
): UPDATE_GEOHEAT_COLOR_RANGE_ACTION {
  return {
    type: SET_GEOHEAT_COLOR_RANGE,
    chartId,
    color: payload.color
  }
}

export type SET_PIXEL_SIZE_ACTION = {
  type: "SET_GEOHEAT_PIXEL_SIZE"
  chartId: string
  size: number
}

export function setPixelSize(chartId: string, size: number) {
  return {
    type: SET_GEOHEAT_PIXEL_SIZE,
    chartId,
    size
  }
}

export type DESTROY_GEOHEAT_ACTION = {
  type: "DESTROY_GEOHEAT"
  chartId: string
}

export function destroyGeoHeatChart(chartId: string) {
  return {
    type: DESTROY_GEOHEAT,
    chartId
  }
}

export type SAVE_LEGEND_OPEN_STATE_ACTION = {
  type: "SAVE_LEGEND_OPEN_STATE"
  chartId: string
  layerIndex: string | number
  open?: boolean
}

export function saveLegendOpenState(
  chartId: string,
  layerIndex,
  open: boolean
) {
  return {
    type: SAVE_LEGEND_OPEN_STATE,
    chartId,
    layerIndex,
    open
  }
}
