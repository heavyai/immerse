// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createReducer from "utils/redux/create-reducer"
import {
  START_GET_DISTINCT_COLUMN_VALUES_REQUEST,
  GET_DISTINCT_COLUMN_VALUES_SUCCESS,
  GET_DISTINCT_COLUMN_VALUES_ERROR,
  CLEAR_DISTINCT_COLUMN_VALUES,
  GET_COLUMN_MIN_MAX_SUCCESS,
  GET_COLUMN_MIN_MAX_ERROR
} from "actions/column-values-action-creators"

export const initialState = {}

const isOutdatedColumnValuesQuery = (
  state,
  dataSource,
  column,
  requestTime
) => {
  const lastRequestTime = state[dataSource]?.[column]?.requestTime
  return lastRequestTime && requestTime < lastRequestTime
}

const ColumnValuesReducers = {
  [START_GET_DISTINCT_COLUMN_VALUES_REQUEST](
    state,
    { dataSource, column, requestTime }
  ) {
    if (isOutdatedColumnValuesQuery(state, dataSource, column, requestTime)) {
      return state
    }

    return {
      ...state,
      [dataSource]: {
        ...state[dataSource],
        [column]: {
          ...(state[dataSource] || {})[column],
          loading: true,
          error: false,
          errorMessage: null,
          requestTime
        }
      }
    }
  },

  [GET_DISTINCT_COLUMN_VALUES_SUCCESS](
    state,
    { data, dataSource, column, requestTime }
  ) {
    if (isOutdatedColumnValuesQuery(state, dataSource, column, requestTime)) {
      return state
    }

    return {
      ...state,
      [dataSource]: {
        ...state[dataSource],
        [column]: {
          ...(state[dataSource] || {})[column],
          loading: false,
          error: false,
          errorMessage: null,
          distinctValues: data,
          requestTime
        }
      }
    }
  },

  [GET_DISTINCT_COLUMN_VALUES_ERROR](
    state,
    { dataSource, column, error, requestTime }
  ) {
    if (isOutdatedColumnValuesQuery(state, dataSource, column, requestTime)) {
      return state
    }

    return {
      ...state,
      [dataSource]: {
        ...state[dataSource],
        [column]: {
          ...(state[dataSource] || {})[column],
          loading: false,
          error: true,
          errorMessage: error,
          distinctValues: [],
          requestTime
        }
      }
    }
  },

  [CLEAR_DISTINCT_COLUMN_VALUES](state, { dataSource, column }) {
    return {
      ...state,
      [dataSource]: {
        ...state[dataSource],
        [column]: {
          ...(state[dataSource] || {})[column],
          loading: false,
          error: false,
          errorMessage: null,
          distinctValues: []
        }
      }
    }
  },

  [GET_COLUMN_MIN_MAX_SUCCESS](state, { dataSource, column, data }) {
    return {
      ...state,
      [dataSource]: {
        ...state[dataSource],
        [column]: {
          ...(state[dataSource] || {})[column],
          minValue: data[0][`${column}_min`],
          maxValue: data[0][`${column}_max`]
        }
      }
    }
  },

  [GET_COLUMN_MIN_MAX_ERROR](state, { dataSource, column, error }) {
    return {
      ...state,
      [dataSource]: {
        ...state[dataSource],
        [column]: {
          ...(state[dataSource] || {})[column],
          error,
          minValue: null,
          maxValue: null
        }
      }
    }
  }
}

export default createReducer(ColumnValuesReducers, initialState)
