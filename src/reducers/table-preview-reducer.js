// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  GET_DATA_SOURCE_PREVIEW_ERROR,
  GET_DATA_SOURCE_PREVIEW_REQUEST,
  GET_DATA_SOURCE_PREVIEW_SUCCESS,
  SET_COLUMN_COMMENT,
  SET_DATA_SOURCE_COMMENT,
  SET_DATA_SOURCE_PRIVS
} from "constants/action-types"

import createReducer from "utils/redux/create-reducer"

export const initialState = {
  rowCount: null,
  fields: {},
  loading: false,
  error: false,
  tableName: null
}

export const reducers = {
  [GET_DATA_SOURCE_PREVIEW_REQUEST](state) {
    return Object.assign({}, state, {
      loading: true
    })
  },

  [GET_DATA_SOURCE_PREVIEW_ERROR](state) {
    return Object.assign({}, state, {
      loading: false,
      error: true
    })
  },

  [GET_DATA_SOURCE_PREVIEW_SUCCESS]: (
    state,
    {
      tableName,
      tableDetails,
      fields,
      rowCount,
      dataSourceDescriptor,
      sampleRows
    }
  ) => ({
    ...state,
    ...{
      loading: false,
      error: false,
      tableDetails,
      fields,
      rowCount,
      tableName,
      dataSourceDescriptor,
      sampleRows
    }
  }),
  [SET_DATA_SOURCE_PRIVS]: (state, { dataSourcePrivileges }) => ({
    ...state,
    dataSourcePrivileges
  }),
  [SET_COLUMN_COMMENT]: (state, { columnName, comment }) => {
    const colIndex = state.tableDetails.row_desc.findIndex(
      (row) => row.col_name === columnName
    )

    const newRowDesc = state.tableDetails.row_desc.slice()
    newRowDesc[colIndex] = { ...state.tableDetails.row_desc[colIndex], comment }

    return {
      ...state,
      tableDetails: {
        ...state.tableDetails,
        row_desc: newRowDesc
      }
    }
  },
  [SET_DATA_SOURCE_COMMENT]: (state, { comment }) => ({
    ...state,
    tableDetails: {
      ...state.tableDetails,
      comment
    }
  })
}

export default createReducer(reducers, initialState)
