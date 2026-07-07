// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  AUTOSUGGEST_ERROR,
  AUTOSUGGEST_REQUEST,
  AUTOSUGGEST_SUCCESS
} from "constants/action-types"

import createReducer from "utils/redux/create-reducer"

export const initialState = {
  error: false,
  loading: false,
  results: {}
}

const reducer = {
  [AUTOSUGGEST_ERROR](state, { error }) {
    return Object.assign({}, state, {
      error,
      loading: false
    })
  },

  [AUTOSUGGEST_REQUEST](state) {
    return Object.assign({}, state, {
      loading: true
    })
  },

  [AUTOSUGGEST_SUCCESS](state, { expression, results }) {
    return Object.assign({}, state, {
      error: false,
      loading: false,
      results: { [expression]: results }
    })
  }
}

export default createReducer(reducer, initialState)
