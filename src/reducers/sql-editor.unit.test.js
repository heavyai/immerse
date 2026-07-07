// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import SQLEditorReducer, { initialState } from "reducers/sql-editor-reducer"
import {
  SQLEditorExecuteRequest,
  SQLEditorExecuteSuccess,
  SQLEditorExecuteError,
  SQLEditorStoreInput
} from "actions/sql-editor-action-creators"

describe("SQL Editor Reducer", () => {
  it("should return the correct initial state", () => {
    const state = SQLEditorReducer(undefined, {})
    expect(state).toEqual(initialState)
  })

  it("should handle the SQL_EDITOR_EXECUTE_REQUEST action action type", () => {
    const action = SQLEditorExecuteRequest()
    const state = SQLEditorReducer(initialState, action)
    expect(state.loading).toEqual(true)
  })

  it("should handle the SQL_EDITOR_EXECUTE_SUCCESS action action type", () => {
    const query =
      "CREATE VIEW Test_SQL_View AS select, flightnum, dep_timestamp FROM flights_2008_10k"
    const results = { results: [{ test: "test" }] }
    const action = SQLEditorExecuteSuccess(false, query, results)
    const state = SQLEditorReducer(initialState, action)

    expect(state.loading).toEqual(false)
    expect(state.history[0].query).toEqual(query)
    expect(state.history[0].error).toEqual(null)
    expect(state.history[0].results).toEqual(results)
  })

  it("should handle the SQL_EDITOR_EXECUTE_ERROR action action type", () => {
    const query = "asfdas"
    const error = "not valid sql"
    const action = SQLEditorExecuteError(false, query, error)
    const state = SQLEditorReducer(initialState, action)

    expect(state.loading).toEqual(false)
    expect(state.history[0].query).toEqual(query)
    expect(state.history[0].results).toEqual(null)
    expect(state.history[0].error).toEqual("not valid sql")
  })

  it("should handle the SQL_EDITOR_STORE_INPUT action action type", () => {
    const value = "SQL statement"
    const action = SQLEditorStoreInput(value)
    const state = SQLEditorReducer(initialState, action)
    expect(state.value).toEqual(value)
  })
})
