// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as timeLagSettingsConstants from "vega/constants/time-lag-settings-action-types"
import { getLayerIndex } from "vega/utils/data-selection"

export default {
  [timeLagSettingsConstants.SET_CHART_TIME_LAG](
    state,
    { chartId, timeLagSettings }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        timeLagSettings
      }
    }
  },

  [timeLagSettingsConstants.CLEAR_CHART_TIME_LAG](state, { chartId }) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        timeLagSettings: null
      }
    }
  },

  [timeLagSettingsConstants.LINK_BASE_MEASURE_TIME_LAG](
    state,
    { chartId, layerId, measureIndex, timeLagId }
  ) {
    const chart = state[chartId]
    const layerIndex = getLayerIndex(chart.dataSelections, layerId)

    chart.dataSelections[layerIndex].measures.size[
      measureIndex
    ].linkedTimeLagId = timeLagId

    return {
      ...state,
      [chartId]: {
        ...chart
      }
    }
  },

  [timeLagSettingsConstants.UNLINK_BASE_MEASURE_TIME_LAG](
    state,
    { chartId, layerId, measureIndex }
  ) {
    const chart = state[chartId]
    const layerIndex = getLayerIndex(chart.dataSelections, layerId)

    delete chart.dataSelections[layerIndex].measures.size[measureIndex]
      .linkedTimeLagId

    return {
      ...state,
      [chartId]: {
        ...chart
      }
    }
  },

  [timeLagSettingsConstants.SET_TIME_LAG_INTERVAL](
    state,
    { chartId, label, interval }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        timeLagSettings: {
          ...state[chartId].timeLagSettings,
          label,
          interval
        }
      }
    }
  },

  [timeLagSettingsConstants.SET_TIME_LAG_BINNED_TIME_UNIT](
    state,
    { chartId, binnedTimeUnit }
  ) {
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        timeLagSettings: {
          ...state[chartId].timeLagSettings,
          binnedTimeUnit
        }
      }
    }
  },

  [timeLagSettingsConstants.SET_TIME_LAG_MEASURE_MODE](
    state,
    { chartId, layerId, timeLagMeasureId, mode }
  ) {
    const dataSelections = Array.from(state[chartId].dataSelections)
    const layerIndex = getLayerIndex(dataSelections, layerId)

    const dataSelection = dataSelections[layerIndex]
    const measures = { ...dataSelection.measures }
    measures.size = Array.from(measures.size)

    const measureIndex = measures.size.findIndex(
      ({ id }) => id === timeLagMeasureId
    )

    measures.size[measureIndex] = {
      ...measures.size[measureIndex],
      mode
    }
    dataSelections[layerIndex] = {
      ...dataSelection,
      measures
    }
    return {
      ...state,
      [chartId]: {
        ...state[chartId],
        dataSelections
      }
    }
  }
}
