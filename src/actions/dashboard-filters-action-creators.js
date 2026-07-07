// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const SET_FILTER = "SET_FILTER"
export const REMOVE_INPUT_FILTER = "REMOVE_INPUT_FILTER"
export const CLEAR_ALL_INPUT_FILTERS = "CLEAR_ALL_INPUT_FILTERS"
export const GET_FILTER_MIN_MAX = "GET_FILTER_MIN_MAX"
export const GET_FILTER_SIZE_REQUEST = "GET_FILTER_SIZE_REQUEST"
export const GET_FILTER_SIZE_ERROR = "GET_FILTER_SIZE_ERROR"
export const GET_FILTER_SIZE_SUCCESS = "GET_FILTER_SIZE_SUCCESS"
export const REMOVE_DASHBOARD_FILTER_ERROR = "REMOVE_DASHBOARD_FILTER_ERROR"
export const REMOVE_DASHBOARD_FILTER_REQUEST = "REMOVE_DASHBOARD_FILTER_REQUEST"
export const REMOVE_DASHBOARD_FILTER_SUCCESS = "REMOVE_DASHBOARD_FILTER_SUCCESS"
export const SELECT_FILTER_DATA_SOURCE = "SELECT_FILTER_DATA_SOURCE"
export const SELECT_FILTER_DATA_SOURCE_REQUEST =
  "SELECT_FILTER_DATA_SOURCE_REQUEST"
export const REMOVE_ALL_FILTERS_FOR_SOURCE = "REMOVE_ALL_FILTERS_FOR_SOURCE"
export const INVALID_DASHBOARD_FILTER = "INVALID_DASHBOARD_FILTER"

export function setFilterDataSourceRequest(index, dataSource) {
  return {
    type: SELECT_FILTER_DATA_SOURCE_REQUEST,
    index,
    dataSource
  }
}

export function setFilterDataSource(index, dataSource) {
  return {
    type: SELECT_FILTER_DATA_SOURCE,
    index,
    dataSource
  }
}

export function setFilter(index, attributes) {
  return {
    type: SET_FILTER,
    index,
    attributes
  }
}

export function removeAllFiltersForSource(dataSource) {
  return {
    type: REMOVE_ALL_FILTERS_FOR_SOURCE,
    dataSource
  }
}

export function removeFilter(index) {
  return function removeFilterAsync(dispatch, getState) {
    const filter = getState().filters[index]
    if (typeof filter === "object") {
      dispatch({
        type: REMOVE_INPUT_FILTER,
        index,
        attributes: {
          dataSource: filter.dataSource
        }
      })
    }
  }
}

export function clearAllInputFilters() {
  return {
    type: CLEAR_ALL_INPUT_FILTERS
  }
}

export function getFilterMinMax(index, value, filter) {
  return {
    type: GET_FILTER_MIN_MAX,
    index,
    value,
    filter
  }
}

export function getFilterSize(index) {
  return {
    type: GET_FILTER_SIZE_REQUEST,
    index
  }
}

export function invalidDashboardFilter(index) {
  return {
    type: INVALID_DASHBOARD_FILTER,
    index
  }
}
