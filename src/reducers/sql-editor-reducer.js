// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SQL_EDITOR_EXECUTE_ERROR,
  SQL_EDITOR_EXECUTE_REQUEST,
  SQL_EDITOR_EXECUTE_SUCCESS,
  SQL_EDITOR_STORE_CURSOR_POSITION,
  SQL_EDITOR_STORE_INPUT,
  SQL_EDITOR_PRIVILEGE_ERROR,
  SQL_EDITOR_PRIVILEGE_ERROR_CONFIRM,
  SQL_EDITOR_LOAD_QUERY_HISTORY_SUCCESS,
  SQL_EDITOR_LOAD_QUERY_HISTORY_REQUEST,
  SQL_EDITOR_LOAD_QUERY_HISTORY_ERROR
} from "constants/action-types"
import { append } from "ramda"

export const initialState = {
  loading: false,
  results: null,
  history: [],
  value: "",
  loadingHistory: false,
  loadedHistory: false,

  // Zero state of Codemirror .getCursor() object
  cursorPosition: {
    line: 0,
    ch: 0,
    sticky: null
  },

  sqlEditorPrivilegeError: false
}

export default function SQLEditorReducer(state = initialState, action) {
  switch (action.type) {
    case SQL_EDITOR_EXECUTE_REQUEST:
      return Object.assign({}, state, {
        loading: true
      })
    case SQL_EDITOR_EXECUTE_SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        history: append(
          // `addQueryHistory` payload must be updated to match if breaking changes are made to this state
          Object.assign(
            {},
            {
              isVega: action.isVega,
              query: action.query,
              error: null,
              results: action.results,
              timestamp: action.timestamp
            }
          ),
          state.history
        )
      })
    case SQL_EDITOR_EXECUTE_ERROR:
      return Object.assign({}, state, {
        loading: false,
        history: append(
          Object.assign(
            {},
            {
              isVega: action.isVega,
              query: action.query,
              error: action.error,
              results: null,
              timestamp: action.timestamp
            }
          ),
          state.history
        )
      })
    case SQL_EDITOR_LOAD_QUERY_HISTORY_REQUEST:
      return { ...state, loadingHistory: true }
    case SQL_EDITOR_LOAD_QUERY_HISTORY_SUCCESS:
      return {
        ...state,
        loadingHistory: false,
        loadedHistory: true,
        history: [...action.history, ...state.history]
      }
    case SQL_EDITOR_LOAD_QUERY_HISTORY_ERROR:
      return {
        ...state,
        loadingHistory: false,
        loadedHistory: true
      }
    case SQL_EDITOR_STORE_INPUT:
      return {
        ...state,
        value: action.value
      }
    case SQL_EDITOR_STORE_CURSOR_POSITION:
      return {
        ...state,
        cursorPosition: action.cursorPosition
      }
    case SQL_EDITOR_PRIVILEGE_ERROR:
      return {
        ...state,
        sqlEditorPrivilegeError: action.error
      }
    case SQL_EDITOR_PRIVILEGE_ERROR_CONFIRM:
      return {
        ...state,
        sqlEditorPrivilegeError: false
      }
    default:
      return state
  }
}
