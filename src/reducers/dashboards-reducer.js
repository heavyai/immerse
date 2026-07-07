// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { assoc, compose, filter, lensProp, over, set } from "ramda"

import {
  CONFIRM_DELETE_DASHBOARD_ERROR,
  CONFIRM_GET_DASHBOARDS_ERROR,
  CONFIRM_LOAD_DASHBOARD_DATA_ACCESS_ERROR,
  DELETE_DASHBOARD_DONE,
  DELETE_DASHBOARD_ERROR,
  DELETE_DASHBOARD_REQUEST,
  DELETE_DASHBOARD_SUCCESS,
  GET_DASHBOARDS_ERROR,
  GET_DASHBOARDS_REQUEST,
  GET_DASHBOARDS_SUCCESS,
  SET_DASHBOARD_LOAD_PENDING,
  SET_DASHBOARD_LOAD_SUCCESS,
  TOGGLE_DASHBOARD,
  SELECT_ALL_DASHBOARDS_IN_LIST,
  DESELECT_ALL_DASHBOARDS_IN_LIST,
  CLEAR_ALL_DASHBOARD_SELECTIONS
} from "constants/action-types"

import createReducer from "utils/redux/create-reducer"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"

export const initialState = {
  list: [],
  selected: new Set(),
  loading: false,
  loaded: false,
  dashboardLoading: false,
  error: false,
  done: false,
  delete: {
    id: null,
    done: false,
    loading: false,
    error: false
  }
}

const overDelete = over(lensProp("delete"))
const filterView = (id) => filter((v) => v.dashboard_id !== id)

const setStatus = (loading, done, error, loaded) =>
  compose(
    set(lensProp("loading"), loading),
    set(lensProp("done"), done),
    set(lensProp("error"), error),
    set(lensProp("loaded"), loaded)
  )

const setLoading = setStatus(true, false, false, false)
const setDone = setStatus(false, true, false, true)
const setSuccess = setStatus(false, false, false, true)
const setError = (e) => setStatus(false, false, e, true)

export const reducers = {
  [DELETE_DASHBOARD_REQUEST](state, { id }) {
    return compose(
      overDelete(setLoading),
      overDelete(set(lensProp("id"), id))
    )(state)
  },

  [DELETE_DASHBOARD_ERROR](state, { error = true }) {
    return overDelete(setError(error))(state)
  },

  [CONFIRM_DELETE_DASHBOARD_ERROR](state) {
    return overDelete(setSuccess)(state)
  },

  [DELETE_DASHBOARD_SUCCESS](state, { id }) {
    if (state.selected.has(id)) {
      const selected = new Set(state.selected)
      selected.delete(id)
      state = {
        ...state,
        selected
      }
    }
    return compose(
      over(lensProp("list"), filterView(id)),
      overDelete(setSuccess)
    )(state)
  },

  [DELETE_DASHBOARD_DONE](state) {
    return overDelete(setDone)(state)
  },

  [GET_DASHBOARDS_REQUEST](state, action) {
    return {
      ...state,
      loading: true,
      done: false,
      error: false,
      loaded: false,
      hideLoadingOverlay: action.hideLoadingOverlay
    }
  },

  [GET_DASHBOARDS_ERROR]: (state, { error = true }) =>
    setError(getErrorMessageFromBackendError(error))(state),

  [GET_DASHBOARDS_SUCCESS](state, { response }) {
    return compose(set(lensProp("list"), response), setSuccess)(state)
  },

  [CONFIRM_GET_DASHBOARDS_ERROR](state) {
    return setSuccess(state)
  },

  [SET_DASHBOARD_LOAD_PENDING](state) {
    return assoc("dashboardLoading", true, state)
  },

  [CONFIRM_LOAD_DASHBOARD_DATA_ACCESS_ERROR](state) {
    return assoc("dashboardLoading", false, state)
  },

  [SET_DASHBOARD_LOAD_SUCCESS](state) {
    return assoc("dashboardLoading", false, state)
  },

  [TOGGLE_DASHBOARD](state, { id }) {
    const selected = new Set(state.selected)
    if (selected.has(id)) {
      selected.delete(id)
    } else {
      selected.add(id)
    }

    return {
      ...state,
      selected
    }
  },

  [SELECT_ALL_DASHBOARDS_IN_LIST](state, { ids }) {
    const selected = new Set(state.selected)
    ids.forEach((id) => selected.add(id))
    return {
      ...state,
      selected
    }
  },

  [DESELECT_ALL_DASHBOARDS_IN_LIST](state, { ids }) {
    const selected = new Set(state.selected)
    ids.forEach((id) => selected.delete(id))
    return {
      ...state,
      selected
    }
  },

  [CLEAR_ALL_DASHBOARD_SELECTIONS](state) {
    return {
      ...state,
      selected: new Set()
    }
  }
}

export default createReducer(reducers, initialState)
