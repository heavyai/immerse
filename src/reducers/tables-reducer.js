// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  TABLES_TRANSACTION_ERROR,
  START_TABLES_REQUEST,
  ADD_TABLES_SUCCESS,
  ADD_TABLES_WITH_META_SUCCESS,
  CONFIRM_TABLES_TRANSACTION_ERROR,
  DROP_TABLE_SUCCESS,
  TRUNC_TABLE_SUCCESS,
  SET_TABLE_PICKER_SEARCH_VAL,
  SELECT_PREVIEW_TABLE,
  RESET_PREVIEW_TABLE
} from "constants/action-types"

import createReducer from "utils/redux/create-reducer"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"

export const initialState = {
  list: [],
  listWithMeta: [],
  globalExpressions: [],
  loading: false,
  loaded: false,
  error: false,
  tablePickerState: {
    searchVal: "",
    selectedPreviewTable: {
      index: null,
      name: null
    }
  }
}

export const reducers = {
  [START_TABLES_REQUEST]: (state) => ({
    ...state,
    loading: true
  }),

  [TABLES_TRANSACTION_ERROR]: (state, { error }) => ({
    ...state,
    loading: false,
    error: getErrorMessageFromBackendError(error)
  }),

  [ADD_TABLES_SUCCESS]: (state, { tables, globalExpressions }) => ({
    ...state,
    loading: false,
    loaded: true,
    error: false,
    list: tables,
    globalExpressions
  }),

  [ADD_TABLES_WITH_META_SUCCESS]: (state, { tablesWithMeta }) => ({
    ...state,
    loading: false,
    error: false,
    listWithMeta: tablesWithMeta
  }),

  [CONFIRM_TABLES_TRANSACTION_ERROR]: (state) => ({
    ...state,
    error: false
  }),

  [DROP_TABLE_SUCCESS]: (state, { tableName }) => {
    const newTablesList = state.list.filter(({ name }) => name !== tableName)
    return {
      ...state,
      loading: false,
      error: false,
      list: newTablesList
    }
  },

  [TRUNC_TABLE_SUCCESS]: (state) => ({
    ...state,
    loading: false,
    error: false
  }),

  [SET_TABLE_PICKER_SEARCH_VAL]: (state, { payload }) => ({
    ...state,
    tablePickerState: {
      ...state.tablePickerState,
      searchVal: payload
    }
  }),

  [SELECT_PREVIEW_TABLE]: (state, { index, name }) => ({
    ...state,
    tablePickerState: {
      ...state.tablePickerState,
      selectedPreviewTable: {
        index,
        name
      }
    }
  }),

  [RESET_PREVIEW_TABLE]: (state) => ({
    ...state,
    tablePickerState: {
      ...state.tablePickerState,
      selectedPreviewTable: { ...initialState.selectedPreviewTable }
    }
  })
}

export default createReducer(reducers, initialState)
