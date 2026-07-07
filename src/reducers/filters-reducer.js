// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CLEAR_ALL_INPUT_FILTERS,
  GET_FILTER_SIZE_ERROR,
  GET_FILTER_SIZE_REQUEST,
  GET_FILTER_SIZE_SUCCESS,
  REMOVE_DASHBOARD_FILTER_ERROR,
  REMOVE_DASHBOARD_FILTER_REQUEST,
  REMOVE_DASHBOARD_FILTER_SUCCESS,
  REMOVE_INPUT_FILTER
} from "constants/action-types"

import {
  REMOVE_ALL_FILTERS_FOR_SOURCE,
  SELECT_FILTER_DATA_SOURCE,
  SET_FILTER,
  INVALID_DASHBOARD_FILTER
} from "actions/dashboard-filters-action-creators"

import { concatR, mergeR } from "utils/ramda-helpers"
import { lensIndex, over, remove, set } from "ramda"
import createReducer from "utils/redux/create-reducer"

export const initialState = []

const loadingState = {
  loading: true,
  error: false
}

const errorState = (error) => ({
  error,
  loading: false
})

const successState = {
  error: false,
  loading: false
}

export function setRequestState(state, { index }) {
  if (state[index]) {
    return over(lensIndex(index), mergeR({ ...loadingState }))(state)
  } else {
    return concatR([{ ...loadingState }])(state)
  }
}

export function setErrorState(state, { index, error }) {
  return over(lensIndex(index), mergeR({ ...errorState(error) }))(state)
}

export function setSuccessState(state, { index }) {
  return over(lensIndex(index), mergeR({ ...successState }))(state)
}

const filters = {
  [REMOVE_DASHBOARD_FILTER_REQUEST]: setRequestState,
  [REMOVE_DASHBOARD_FILTER_ERROR]: setErrorState,
  [REMOVE_DASHBOARD_FILTER_SUCCESS]: setSuccessState,
  [REMOVE_ALL_FILTERS_FOR_SOURCE]: (state, { dataSource }) =>
    state.filter((filter) => filter.dataSource !== dataSource),
  [SELECT_FILTER_DATA_SOURCE]: (state, { index, dataSource }) => {
    if (state[index]) {
      return set(lensIndex(index), { dataSource })(state)
    } else {
      return concatR([{ dataSource }])(state)
    }
  },
  [SET_FILTER]: (state, { index, attributes }) => {
    if (state[index]) {
      return over(lensIndex(index), mergeR({ ...attributes }))(state)
    } else {
      return concatR([{ ...attributes }])(state)
    }
  },
  [REMOVE_INPUT_FILTER]: (state, { index }) => remove(index, 1, state),
  [CLEAR_ALL_INPUT_FILTERS]: () => initialState,
  [GET_FILTER_SIZE_REQUEST]: (state, { index }) => {
    const size = loadingState
    return over(lensIndex(index), mergeR({ size }))(state)
  },
  [GET_FILTER_SIZE_ERROR]: (state, { index, error }) => {
    const size = errorState(error)
    return over(lensIndex(index), mergeR({ size }))(state)
  },
  [GET_FILTER_SIZE_SUCCESS]: (state, { index, shouldAutosuggest }) => {
    const size = successState
    return over(lensIndex(index), mergeR({ shouldAutosuggest, size }))(state)
  },
  [INVALID_DASHBOARD_FILTER]: (state, { index }) =>
    state.map((filter, id) => {
      if (id === index) {
        const { dataSource } = filter
        return {
          dataSource
        }
      }
      return filter
    })
}

export default createReducer(filters, initialState)
