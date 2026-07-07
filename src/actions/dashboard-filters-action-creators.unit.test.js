// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SELECT_FILTER_DATA_SOURCE_REQUEST,
  SELECT_FILTER_DATA_SOURCE,
  SET_FILTER,
  REMOVE_ALL_FILTERS_FOR_SOURCE,
  CLEAR_ALL_INPUT_FILTERS,
  GET_FILTER_MIN_MAX,
  GET_FILTER_SIZE_REQUEST,
  INVALID_DASHBOARD_FILTER,
  setFilterDataSourceRequest,
  setFilterDataSource,
  setFilter,
  removeAllFiltersForSource,
  clearAllInputFilters,
  getFilterMinMax,
  getFilterSize,
  invalidDashboardFilter
} from "./dashboard-filters-action-creators"

describe("Dashboard Filters Action Creators", () => {
  describe("setFilterDataSourceRequest", () => {
    it("should create an action to add a data source", () => {
      const dataSource = SELECT_FILTER_DATA_SOURCE_REQUEST
      const index = 3
      const expectedAction = {
        type: SELECT_FILTER_DATA_SOURCE_REQUEST,
        index,
        dataSource
      }
      const request = setFilterDataSourceRequest(index, dataSource)
      expect(request).toHaveProperty("type", SELECT_FILTER_DATA_SOURCE_REQUEST)
      expect(request).toHaveProperty("index", index)
      expect(request).toHaveProperty("dataSource", dataSource)
      expect(request).toEqual(expectedAction)
    })
  })
  describe("setFilterDataSource", () => {
    it("should create an action to add a data source", () => {
      const dataSource = SELECT_FILTER_DATA_SOURCE
      const index = 3
      const expectedAction = {
        type: SELECT_FILTER_DATA_SOURCE,
        index,
        dataSource
      }
      const request = setFilterDataSource(index, dataSource)
      expect(request).toHaveProperty("type", SELECT_FILTER_DATA_SOURCE)
      expect(request).toHaveProperty("index", index)
      expect(request).toHaveProperty("dataSource", dataSource)
      expect(request).toEqual(expectedAction)
    })
  })
  describe("setFilter", () => {
    it("should create an action to add an attribute", () => {
      const attributes = SET_FILTER
      const index = 3
      const expectedAction = {
        type: SET_FILTER,
        index,
        attributes
      }
      const request = setFilter(index, attributes)
      expect(request).toHaveProperty("type", SET_FILTER)
      expect(request).toHaveProperty("index", index)
      expect(request).toHaveProperty("attributes", attributes)
      expect(request).toEqual(expectedAction)
    })
  })
  describe("removeAllFiltersForSource", () => {
    it("should create an action to remove a data source", () => {
      const dataSource = REMOVE_ALL_FILTERS_FOR_SOURCE
      const expectedAction = {
        type: REMOVE_ALL_FILTERS_FOR_SOURCE,
        dataSource
      }
      const request = removeAllFiltersForSource(dataSource)
      expect(request).toHaveProperty("type", REMOVE_ALL_FILTERS_FOR_SOURCE)
      expect(request).toHaveProperty("dataSource", dataSource)
      expect(request).toEqual(expectedAction)
    })
  })
  describe("clearAllInputFilters", () => {
    it("should create an action to clear all input filters", () => {
      const expectedAction = {
        type: CLEAR_ALL_INPUT_FILTERS
      }
      const request = clearAllInputFilters()
      expect(request).toHaveProperty("type", CLEAR_ALL_INPUT_FILTERS)
      expect(request).toEqual(expectedAction)
    })
  })
  describe("getFilterMinMax", () => {
    it("should create an action to remove get filter min/max", () => {
      const value = GET_FILTER_MIN_MAX
      const filter = "filter"
      const index = 3
      const expectedAction = {
        type: GET_FILTER_MIN_MAX,
        index,
        value,
        filter
      }
      const request = getFilterMinMax(index, value, filter)
      expect(request).toHaveProperty("type", GET_FILTER_MIN_MAX)
      expect(request).toHaveProperty("index", index)
      expect(request).toHaveProperty("filter", filter)
      expect(request).toHaveProperty("value", value)
      expect(request).toEqual(expectedAction)
    })
  })
  describe("getFilterSize", () => {
    it("should create an action to get filter size", () => {
      const index = 3
      const expectedAction = {
        type: GET_FILTER_SIZE_REQUEST,
        index
      }
      const request = getFilterSize(index)
      expect(request).toHaveProperty("type", GET_FILTER_SIZE_REQUEST)
      expect(request).toHaveProperty("index", index)
      expect(request).toEqual(expectedAction)
    })
  })
  describe("invalidDashboardFilter", () => {
    it("should create an action to flag an invalid dashboard filter", () => {
      const index = 3
      const expectedAction = {
        type: INVALID_DASHBOARD_FILTER,
        index
      }
      const request = invalidDashboardFilter(index)
      expect(request).toHaveProperty("type", INVALID_DASHBOARD_FILTER)
      expect(request).toHaveProperty("index", index)
      expect(request).toEqual(expectedAction)
    })
  })
})
