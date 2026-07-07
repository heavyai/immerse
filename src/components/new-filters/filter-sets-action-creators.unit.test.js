// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"

const middlewares = [thunk]

const mockStore = configureStore(middlewares)

import * as actions from "components/new-filters/filter-sets-action-creators"

describe("filter set actions", () => {
  it("should create a default filter set", () => {
    const id = "test_filter_set"
    const expectedAction = {
      id,
      filterSet: {
        id,
        name: "Default Filter Set",
        filters: [],
        selected: true
      }
    }

    expect(actions.getDefaultFilterSet(id)).toEqual(expectedAction)
  })

  it("should create an ADD_FILTER_SET action", async () => {
    const initialState = {
      charts: {},
      filterZones: {
        "-test-filter-set": {
          id: "-test-filter-set",
          name: "Default Filter Set",
          filters: [],
          cohortAggregateFilters: {},
          selected: true,
          dimensions: {}
        }
      }
    }

    const store = mockStore(initialState)

    await store.dispatch(
      actions.addFilterSet("new filter set", "-new-filter-set", false)
    )
    const storeActions = store.getActions()

    expect(storeActions.length).toEqual(2)
    expect(storeActions[0]).toEqual({
      type: "ADD_FILTER_SET",
      payload: { id: "-new-filter-set", name: "new filter set" }
    })
  })
  it("should create an RENAME_FILTER_SET action", () => {
    const id = "test_id"
    const newName = "renamed_filter_set"
    const expectedAction = {
      type: actions.RENAME_FILTER_SET,
      payload: { id, newName }
    }

    expect(actions.renameFilterSetAction(id, newName)).toEqual(expectedAction)
  })
  it("should create an DELETE_FILTER_SET action", async () => {
    const initialState = {
      charts: {},
      filterZones: {
        "-test-filter-set": {
          id: "-test-filter-set",
          name: "Default Filter Set",
          filters: [],
          cohortAggregateFilters: {},
          selected: true,
          dimensions: {}
        }
      }
    }

    const store = mockStore(initialState)

    await store.dispatch(actions.deleteFilterSet("-test-filter-set"))
    const storeActions = store.getActions()
    expect(storeActions.length).toEqual(2)
    expect(storeActions[0]).toEqual({
      type: "DELETE_FILTER_SET",
      payload: { id: "-test-filter-set" }
    })
  })
  it("should create an CLEAR_ALL_FILTER_SETS action", async () => {
    const initialState = {
      charts: {},
      filterZones: {
        "-test-filter-set": {
          id: "-test-filter-set",
          name: "Default Filter Set",
          filters: [],
          cohortAggregateFilters: {},
          selected: true,
          dimensions: {}
        }
      }
    }

    const store = mockStore(initialState)

    await store.dispatch(actions.clearAllFilterSets())
    const storeActions = store.getActions()

    expect(storeActions.length).toEqual(3)
    expect(storeActions[0]).toEqual({
      type: "CLEAR_ALL_FILTER_SETS"
    })
    expect(storeActions[1].type).toEqual("ADD_FILTER_SET")
    expect(storeActions[1].payload.id).toBeDefined()
    expect(storeActions[1].payload.name).toEqual("Default Filter Set")
  })
  it("should create an ADD_FILTER_TO_FILTER_SET action", () => {
    const id = "test_id"
    const filter = "test_filter_id"
    const expectedAction = {
      type: actions.ADD_FILTER_TO_FILTER_SET,
      payload: { id, filter }
    }

    expect(actions.addFilterToFilterSet(id, filter)).toEqual(expectedAction)
  })
  it("should create an REMOVE_FILTER_FROM_FILTER_SET action", () => {
    const id = "test_id"
    const filter = "test_filter_id"
    const expectedAction = {
      type: actions.REMOVE_FILTER_FROM_FILTER_SET,
      payload: { id, filter }
    }

    expect(actions.removeFilterFromFilterSet(id, filter)).toEqual(
      expectedAction
    )
  })
  it("should create an SET_FILTER_SET_DIMENSION action", () => {
    const id = "test_id"
    const dataSource = "test_datasource"
    const dimension = "test_dimension"
    const table = "test_table"
    const expectedAction = {
      type: actions.SET_FILTER_SET_DIMENSION,
      payload: { id, dataSource, table, dimension }
    }

    expect(
      actions.setFilterSetDimension(id, dataSource, table, dimension)
    ).toEqual(expectedAction)
  })
  it("should create an SELECT_FILTER_SET action", async () => {
    const initialState = {
      charts: {},
      omnifilters: [],
      filterZones: {
        "-test-filter-set": {
          id: "-test-filter-set",
          name: "Default Filter Set",
          filters: [],
          cohortAggregateFilters: {},
          selected: true,
          dimensions: {}
        },
        "-test-filter-set-2": {
          id: "-test-filter-set-2",
          name: "Default Filter Set",
          filters: [],
          cohortAggregateFilters: {},
          selected: true,
          dimensions: {}
        }
      }
    }

    const store = mockStore(initialState)

    await store.dispatch(actions.selectFilterSet("-test-filter-set", false))
    const storeActions = store.getActions()

    expect(storeActions.length).toEqual(0)

    await store.dispatch(actions.selectFilterSet("-test-filter-set-2", false))
    const storeActions2 = store.getActions()

    expect(storeActions2.length).toEqual(2)
    expect(storeActions2[0]).toEqual({
      type: "SET_ENABLED_FILTER_SET_FILTERS",
      payload: { id: "-test-filter-set", enabledFilters: [] }
    })
    expect(storeActions2[1]).toEqual({
      type: "SELECT_FILTER_SET",
      payload: { id: "-test-filter-set-2" }
    })
  })
  it("should create an SET_ENABLED_FILTER_SET_FILTERS action", () => {
    const id = "test_id"
    const enabledFilters = ["test_1", "test_2", "test_3"]
    const expectedAction = {
      type: actions.SET_ENABLED_FILTER_SET_FILTERS,
      payload: { id, enabledFilters }
    }

    expect(actions.setEnabledFilterSetFilters(id, enabledFilters)).toEqual(
      expectedAction
    )
  })
})
