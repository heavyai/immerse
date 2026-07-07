// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Action } from "redux"

import {
  GET_TABLES_META_PENDING,
  GET_TABLES_META_ERROR,
  GET_TABLES_META_SUCCESS
} from "actions/tables-meta-action-creators"

// TODO: Import Thrift type
type TTableMeta = any[]

export type TablesMetaState = {
  database: string | null
  pending: boolean
  error: Error | string | null
  results: TTableMeta | null
}

const initialState: TablesMetaState = {
  database: null,
  pending: false,
  error: null,
  results: null
}

const reducer = (state: TablesMetaState = initialState, action: Action) => {
  switch (action.type) {
    case GET_TABLES_META_PENDING:
      return {
        ...state,
        database: action.database,
        pending: true,
        error: null,
        results: null
      }
    case GET_TABLES_META_ERROR:
      // If this response was for a different database (probably an old request), ignore it
      if (action.database === state.database) {
        return {
          ...state,
          pending: false,
          error: action.error
        }
      } else {
        return state
      }
    case GET_TABLES_META_SUCCESS:
      return {
        ...state,
        pending: false,
        error: null,
        results: action.results
      }
    default:
      return state
  }
}

export default reducer
