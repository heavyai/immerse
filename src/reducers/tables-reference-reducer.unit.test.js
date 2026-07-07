// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import TablesReferenceReducer, {
  initialState
} from "reducers/tables-reference-reducer"
import {
  addTablesSuccess,
  addTablesRequest,
  addTablesError
} from "actions/tables-reference-action-creators"

describe("Tables Reference Reducer", () => {
  it("should return the correct initial state", () => {
    const state = TablesReferenceReducer(undefined, {})
    expect(state).toEqual(initialState)
  })

  it("should handle the ADD_TABLES_REQUEST action action type", () => {
    const action = addTablesRequest()
    const state = TablesReferenceReducer(initialState, action)

    expect(state.loading).toEqual(true)
  })

  it("should handle the ADD_TABLES_SUCCESS action action type", () => {
    const tables = [{ name: "flights" }, { name: "donations" }]
    const action = addTablesSuccess(tables)
    const state = TablesReferenceReducer(initialState, action)

    expect(state.loading).toEqual(false)
    expect(state.error).toEqual(false)
    expect(state.list).toEqual(tables)
  })

  it("should handle the TABLES_TRANSACTION_ERROR action action type", () => {
    const action = addTablesError()
    const state = TablesReferenceReducer(initialState, action)

    expect(state.loading).toEqual(false)
    expect(state.error).toEqual(true)
  })
})
