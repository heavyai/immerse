// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import TablesReducer, { initialState } from "reducers/tables-reducer"
import {
  addTablesSuccess,
  addTablesWithMetaSuccess,
  startDataManagerRequest,
  dataManagerTransactionError
} from "actions/tables-action-creators"

describe("Tables Reducer", () => {
  it("should return the correct initial state", () => {
    const state = TablesReducer(undefined, {})
    expect(state).toEqual(initialState)
  })

  it("should handle the ADD_TABLES_REQUEST action action type", () => {
    const action = startDataManagerRequest()
    const state = TablesReducer(initialState, action)

    expect(state.loading).toEqual(true)
  })

  it("should handle the ADD_TABLES_SUCCESS action action type", () => {
    const tables = [{ name: "flights" }, { name: "donations" }]
    const action = addTablesSuccess(tables)
    const state = TablesReducer(initialState, action)

    expect(state.loading).toEqual(false)
    expect(state.error).toEqual(false)
    expect(state.list).toEqual(tables)
    expect(state.listWithMeta).toEqual([])
  })

  it("should handle the ADD_TABLES_WITH_MTEA_SUCCESS action type", () => {
    const tablesWithMeta = [
      { name: "flights", meta: "meta" },
      { name: "donations", meta: "meta" }
    ]
    const action = addTablesWithMetaSuccess(tablesWithMeta)
    const state = TablesReducer(initialState, action)

    expect(state.loading).toEqual(false)
    expect(state.error).toEqual(false)
    expect(state.list).toEqual([])
    expect(state.listWithMeta).toEqual(tablesWithMeta)
  })

  it("should handle the TABLES_TRANSACTION_ERROR action action type", () => {
    const tablesError = "tablesError"
    const action = dataManagerTransactionError({ message: tablesError })
    const state = TablesReducer(initialState, action)

    expect(state.loading).toEqual(false)
    expect(state.error).toEqual(tablesError)
  })
})
