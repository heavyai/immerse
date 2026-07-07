// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ADD_TABLES_REF_ERROR,
  ADD_TABLES_REF_REQUEST,
  ADD_TABLES_REF_SUCCESS
} from "constants/action-types"

import createReducer from "utils/redux/create-reducer"

export const initialState = {
  list: [],
  loading: false,
  error: false
}

export const reducers = {
  [ADD_TABLES_REF_REQUEST](state) {
    return Object.assign({}, state, {
      loading: true
    })
  },

  [ADD_TABLES_REF_ERROR](state) {
    return Object.assign({}, state, {
      loading: false,
      error: true
    })
  },

  [ADD_TABLES_REF_SUCCESS](state, { tablesReference }) {
    return Object.assign({}, state, {
      loading: false,
      error: false,
      list: tablesReference
    })
  }
}

export default createReducer(reducers, initialState)
