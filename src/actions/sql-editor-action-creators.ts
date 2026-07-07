// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SQL_EDITOR_EXECUTE_ERROR,
  SQL_EDITOR_EXECUTE_REQUEST,
  SQL_EDITOR_EXECUTE_SUCCESS,
  SQL_EDITOR_LOAD_QUERY_HISTORY_ERROR,
  SQL_EDITOR_LOAD_QUERY_HISTORY_REQUEST,
  SQL_EDITOR_LOAD_QUERY_HISTORY_SUCCESS,
  SQL_EDITOR_PRIVILEGE_ERROR,
  SQL_EDITOR_PRIVILEGE_ERROR_CONFIRM,
  SQL_EDITOR_STORE_CURSOR_POSITION,
  SQL_EDITOR_STORE_INPUT
} from "constants/action-types"

import { getTables } from "actions/tables-reference-action-creators"
import { tableToFields, tableToJson } from "utils/arrow"

import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import { limitQuery } from "components/sql-notebook/utils"
import { addQueryHistory, getQueryHistory } from "services/query-history"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"

export const QUERY_LIMIT = 1000

export function SQLEditorExecuteRequest() {
  return {
    type: SQL_EDITOR_EXECUTE_REQUEST
  }
}

export function SQLEditorExecuteSuccess(isVega, query, results, timestamp) {
  return {
    type: SQL_EDITOR_EXECUTE_SUCCESS,
    isVega,
    results,
    query,
    timestamp
  }
}

export function SQLEditorExecuteError(isVega, query, error, timestamp) {
  return {
    type: SQL_EDITOR_EXECUTE_ERROR,
    isVega,
    error,
    query,
    timestamp
  }
}

export function loadQueryHistoryRequest() {
  return {
    type: SQL_EDITOR_LOAD_QUERY_HISTORY_REQUEST
  }
}

export function loadQueryHistorySuccess(history) {
  return {
    type: SQL_EDITOR_LOAD_QUERY_HISTORY_SUCCESS,
    history
  }
}

export function loadQueryHistoryError() {
  return {
    type: SQL_EDITOR_LOAD_QUERY_HISTORY_ERROR
  }
}

export function loadQueryHistory() {
  return async function LoadQueryHistoryThunk(dispatch) {
    dispatch(loadQueryHistoryRequest())

    try {
      const res = await getQueryHistory()

      if (res.ok) {
        const history = await res.json()
        dispatch(
          loadQueryHistorySuccess(
            // Indicate that these queries are from a previous session, as some
            // logic assumes that the last query was just run (e.g. success snackbar)
            history.map((hist) => ({ ...hist, restored: true }))
          )
        )
      } else {
        dispatch(loadQueryHistoryError())
      }
    } catch (e) {
      dispatch(loadQueryHistoryError())
    }
  }
}

const isJson = (query: string): boolean => {
  try {
    const parsed = JSON.parse(query)

    return parsed && typeof parsed === "object"
  } catch {
    return false
  }
}

// Timestamp is only passed so it can be mocked for tests
export function SQLEditorExecute(query: string, timestamp = Date.now()) {
  return async function SQLEditorExecuteThunk(dispatch, _getState, services) {
    const connector = services.get("DbCon")

    let trimmedQuery = query.trim()
    const isVega = isJson(trimmedQuery)

    if (!isVega) {
      trimmedQuery = limitQuery(trimmedQuery, QUERY_LIMIT)
    }

    dispatch(SQLEditorExecuteRequest())

    try {
      const result = await (isVega
        ? connector.renderVegaAsync(1, trimmedQuery)
        : getFeatureFlag(available_feature_flags.USE_ARROW_IN_SQL_MANAGER)
        ? connector
            .queryDFAsync(trimmedQuery, {
              returnTiming: true,
              limit: QUERY_LIMIT
            })
            .then((data) => {
              const results = tableToJson(data.results)
              return { ...data, results, fields: tableToFields(data.results) }
            })
        : connector.queryAsync(trimmedQuery, {
            returnTiming: true,
            limit: QUERY_LIMIT
          }))

      addQueryHistory({
        isVega,
        query: trimmedQuery,
        results: result,
        timestamp
      })

      dispatch(SQLEditorExecuteSuccess(isVega, trimmedQuery, result, timestamp))

      if (!isVega && trimmedQuery.match(/^\s*(create|drop|restore)/i)) {
        // If user creates, drops, or restores a table, refresh the tables browser list
        dispatch(getTables())
      }
    } catch (error) {
      const errorMessage = getErrorMessageFromBackendError(error)
      addQueryHistory({
        isVega,
        query: trimmedQuery,
        timestamp,
        error: errorMessage
      })

      dispatch(
        SQLEditorExecuteError(isVega, trimmedQuery, errorMessage, timestamp)
      )
    }
  }
}

export function SQLEditorStoreInput(value) {
  return {
    type: SQL_EDITOR_STORE_INPUT,
    value
  }
}

export function SQLEditorStoreCursorPosition(cursorPosition) {
  return {
    type: SQL_EDITOR_STORE_CURSOR_POSITION,
    cursorPosition
  }
}

export function SQLEditorPrivilegeError(error) {
  return {
    type: SQL_EDITOR_PRIVILEGE_ERROR,
    error
  }
}

export function SQLEditorPrivilegeErrorConfirm() {
  return {
    type: SQL_EDITOR_PRIVILEGE_ERROR_CONFIRM
  }
}
