// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  APPLY_CHART_EDITS,
  CANCEL_CHART_EDITS,
  SAVE_CURRENT_CHART,
  SET_CHART_EDITOR_TABLE_PREVIEW,
  SET_CHART_EDITOR_TO_INITIAL_STATE,
  SELECT_MULTI_SOURCE_PANEL,
  SAVE_CHARTS_SNAPSHOT
} from "constants/action-types"

export const initialState = {
  editId: "",
  editing: false,
  savedDataSources: {},
  wasCancelled: false,
  wasApplied: false,
  savedCharts: {},
  savedFilters: {},
  tablePreviewName: null,
  selectedMultiSourcePanel: 0
}

export default function chartEditor(state = initialState, action) {
  switch (action.type) {
    case "SAVE_DATASOURCES":
      return {
        ...state,
        savedDataSources: action.savedDataSources
      }
    case SAVE_CURRENT_CHART:
      return {
        ...state,
        editId: action.chartId,
        editing: true,
        savedCharts: {
          ...state.savedCharts,
          [action.chartId]: action.chart
        },
        savedFilters: {
          [action.chartId]: action.filtersForChart
        }
      }
    case SAVE_CHARTS_SNAPSHOT:
      return {
        ...state,
        savedCharts: {
          ...state.savedCharts,
          ...action.charts
        }
      }
    case APPLY_CHART_EDITS:
      return {
        ...state,
        wasApplied: true
      }
    case CANCEL_CHART_EDITS:
      return {
        ...state,
        wasCancelled: true
      }
    case SET_CHART_EDITOR_TO_INITIAL_STATE:
      return initialState
    case SET_CHART_EDITOR_TABLE_PREVIEW:
      return Object.assign({}, state, { tablePreviewName: action.tableName })
    case SELECT_MULTI_SOURCE_PANEL:
      return {
        ...state,
        selectedMultiSourcePanel: action.selectedMultiSourcePanel
      }
    default:
      return state
  }
}
