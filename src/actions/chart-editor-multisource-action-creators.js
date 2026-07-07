// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { last } from "ramda"
import {
  ENTER_MULTI_SOURCE_MODE,
  ADD_MULTI_SOURCE,
  DELETE_MULTI_SOURCE,
  SELECT_MULTI_SOURCE_PANEL,
  CLEAR_MULTI_SOURCE,
  LEAVE_MULTI_SOURCE_MODE
} from "constants/action-types"

import { removeChartFromParameterUsage } from "components/parameters/actions/parameter-usage-action-creators"

export function enterMultiSourceMode(chartId) {
  return {
    type: ENTER_MULTI_SOURCE_MODE,
    chartId
  }
}

export function addMultiSource(chartId, multiSourceIndex) {
  return {
    type: ADD_MULTI_SOURCE,
    chartId,
    multiSourceIndex
  }
}

export function deleteMultiSource(chartId, multiSourceIndex) {
  return (dispatch) => {
    dispatch({
      type: DELETE_MULTI_SOURCE,
      chartId,
      multiSourceIndex
    })
    dispatch(removeChartFromParameterUsage(chartId))
  }
}

export function clearMultiSource(chartId, multiSourceIndex) {
  return {
    type: CLEAR_MULTI_SOURCE,
    chartId,
    multiSourceIndex
  }
}

export function leaveMultiSourceMode(chartId, keepSourceIndex) {
  return (dispatch) => {
    dispatch({
      type: LEAVE_MULTI_SOURCE_MODE,
      chartId,
      keepSourceIndex
    })
    dispatch(removeChartFromParameterUsage(chartId))
  }
}

export function deleteMultiSourceAndOpenPreviousFold(
  chartId,
  multiSourceIndex
) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId] || {}
    const currentMultiSources = chart.multiSources || {}
    const indexes = Object.values(currentMultiSources).map((s) => s.index)

    if (indexes.length === 2) {
      const keepSourceIndex = indexes.find((idx) => idx !== multiSourceIndex)
      dispatch(leaveMultiSourceMode(chartId, keepSourceIndex))
    } else {
      const selectedMultiSourcePanelIndex = indexes.indexOf(multiSourceIndex)
      let nextIndex = selectedMultiSourcePanelIndex - 1
      if (nextIndex < 0) {
        nextIndex = 0
      }

      dispatch(deleteMultiSource(chartId, multiSourceIndex))
      dispatch(selectMultiSourcePanel(nextIndex))
    }
  }
}

export function selectMultiSourcePanel(selectedMultiSourcePanel) {
  return {
    type: SELECT_MULTI_SOURCE_PANEL,
    selectedMultiSourcePanel
  }
}

export function enterMultiSourceModeAndOpenFold(chartId) {
  return (dispatch) => {
    // enterMultiSourceMode adds a second, blank source panel as well
    dispatch(enterMultiSourceMode(chartId))
    // select and open that second blank one
    dispatch(selectMultiSourcePanel(1))
  }
}

export function addMultiSourceAndOpenFold(chartId) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId] || {}
    const currentMultiSources = chart.multiSources || {}

    const indexes = Object.keys(currentMultiSources).map((dataSource) => {
      const numericalIndex = Number(currentMultiSources[dataSource].index)

      if (isNaN(numericalIndex)) {
        throw new Error(
          `Invalid source index: ${currentMultiSources[dataSource].index}`
        )
      }

      return numericalIndex
    })

    const multiSourceIndex = indexes.length
      ? last(indexes.sort((a, b) => a - b)) + 1
      : 0

    dispatch(addMultiSource(chartId, multiSourceIndex))
    dispatch(selectMultiSourcePanel(indexes.length))
  }
}
