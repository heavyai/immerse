// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import TablePreviewReducer, {
  initialState
} from "reducers/table-preview-reducer"
import {
  getDataSourcePreviewSuccess,
  getDataSourcePreviewRequest,
  getDataSourcePreviewError
} from "actions/table-preview-action-creators"

describe("Table Preview Reducer", () => {
  it("should return the correct initial state", () => {
    const state = TablePreviewReducer(undefined, {})
    expect(state).toEqual(initialState)
  })

  it("should handle the GET_DATA_SOURCE_PREVIEW_REQUEST action action type", () => {
    const action = getDataSourcePreviewRequest()
    const state = TablePreviewReducer(initialState, action)

    expect(state.loading).toEqual(true)
  })

  it("should handle the GET_DATA_SOURCE_PREVIEW_SUCCESS action action type", () => {
    const tablename = "flights"
    const action = getDataSourcePreviewSuccess(tablename)
    const state = TablePreviewReducer(initialState, action)

    expect(state.loading).toEqual(false)
    expect(state.error).toEqual(false)
    expect(state.tableName).toEqual(tablename)
  })

  it("should handle the GET_DATA_SOURCE_PREVIEW_ERROR action action type", () => {
    const action = getDataSourcePreviewError()
    const state = TablePreviewReducer(initialState, action)

    expect(state.loading).toEqual(false)
    expect(state.error).toEqual(true)
  })
})
