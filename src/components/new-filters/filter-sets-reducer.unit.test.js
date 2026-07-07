// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash"

import filterSetsReducer from "components/new-filters/filter-sets-reducer"
import * as actions from "components/new-filters/filter-sets-action-creators"
import {
  SET_DASHBOARD_FILTER,
  CLEAR_BY_NAME,
  SET_DASHBOARD_COHORT
} from "vega/constants/filter-action-types"
import {
  SET_FILTER_CROSSFILTER,
  DELETE_FILTER_CROSSFILTER
} from "constants/action-types"

const defaultStore = {
  filter_set_1: {
    id: "filter_set_1",
    name: "filter_set_1 name",
    filters: ["f1-a", "f1-b", "f1-c", "f1-d", "f1-e"],
    selected: true,
    dimensions: {},
    cohortAggregateFilters: {}
  },
  filter_set_2: {
    id: "filter_set_2",
    name: "filter_set_2 name",
    filters: ["f2-a", "f2-b", "f2-c", "f2-d", "f2-e"],
    selected: false,
    dimensions: {},
    cohortAggregateFilters: {}
  }
}

const defaultStoreCopy = cloneDeep(defaultStore)

describe("filter sets reducer", () => {
  it("should add a filter set", () => {
    const new_filter_set_id = "filter_set_3"
    const new_filter_set_name = "filter_set_3 name"

    const newStore = {
      ...defaultStore,
      [new_filter_set_id]: {
        id: new_filter_set_id,
        name: new_filter_set_name,
        filters: [],
        selected: false,
        dimensions: {},
        cohortAggregateFilters: {}
      }
    }

    const addFilterSetAction = {
      type: actions.ADD_FILTER_SET,
      payload: {
        id: new_filter_set_id,
        name: new_filter_set_name
      }
    }

    expect(filterSetsReducer(defaultStore, addFilterSetAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should rename a filter set", () => {
    const test_filter_set_id = "filter_set_2"
    const new_name = "New filter set name"

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        name: new_name
      }
    }

    const renameFilterSetAction = actions.renameFilterSetAction(
      test_filter_set_id,
      new_name
    )

    expect(filterSetsReducer(defaultStore, renameFilterSetAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should delete a filter set", () => {
    const test_filter_set_id = "filter_set_2"

    const newStore = { ...defaultStore }
    delete newStore[test_filter_set_id]

    const deleteFilterSetAction = {
      type: actions.DELETE_FILTER_SET,
      payload: { id: test_filter_set_id }
    }

    expect(filterSetsReducer(defaultStore, deleteFilterSetAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should duplicate a filter set", () => {
    const test_filter_set_id = "filter_set_2"
    const duplicated_filter_set_id = "duplicated_filter_set"

    const newStore = { ...defaultStore }
    newStore[duplicated_filter_set_id] = {
      ...cloneDeep(newStore[test_filter_set_id]),
      enabledFilters: defaultStore[test_filter_set_id].filters,
      name: `${defaultStore[test_filter_set_id].name} (Copy)`,
      id: duplicated_filter_set_id
    }

    const duplicateFilterSetAction = {
      type: actions.DUPLICATE_FILTER_SET,
      payload: {
        id: test_filter_set_id,
        newId: duplicated_filter_set_id,
        filters: defaultStore[test_filter_set_id].filters,
        enabledFilters: defaultStore[test_filter_set_id].filters
      }
    }

    expect(filterSetsReducer(defaultStore, duplicateFilterSetAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should clear all filter sets", () => {
    const newStore = {}

    const clearAllFilterSetsAction = { type: actions.CLEAR_ALL_FILTER_SETS }

    expect(filterSetsReducer(defaultStore, clearAllFilterSetsAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should set a filter set dimension", () => {
    const test_filter_set_id = "filter_set_1"
    const test_dimension = "test_dimension"
    const test_datasource = "test_datasource"
    const test_table = "test_table"

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        dimensions: {
          [test_datasource]: `${test_table}.${test_dimension}`
        }
      }
    }

    const setFilterSetDimensionAction = actions.setFilterSetDimension(
      test_filter_set_id,
      test_datasource,
      test_table,
      test_dimension
    )

    expect(
      filterSetsReducer(defaultStore, setFilterSetDimensionAction)
    ).toEqual(newStore)
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should add a new filter to a filter set", () => {
    const test_filter_set_id = "filter_set_1"
    const new_filter_id = "f1-f"

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        filters: [...defaultStore[test_filter_set_id].filters, new_filter_id]
      }
    }

    const addFilterAction = actions.addFilterToFilterSet(
      test_filter_set_id,
      new_filter_id
    )

    expect(filterSetsReducer(defaultStore, addFilterAction)).toEqual(newStore)
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should add a pre-existing filter to a filter set", () => {
    // if you re-add a pre-existing filter, it gets bumped to the end of the line.
    const test_filter_set_id = "filter_set_1"
    const new_filter_id = "f1-a"

    const filters = [...defaultStore[test_filter_set_id].filters].filter(
      (f) => f !== new_filter_id
    )

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        filters: [...filters, new_filter_id]
      }
    }

    const addFilterAction = actions.addFilterToFilterSet(
      test_filter_set_id,
      new_filter_id
    )

    expect(filterSetsReducer(defaultStore, addFilterAction)).toEqual(newStore)
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should move a filter from filter set to another", () => {
    // if you re-add a pre-existing filter, it gets bumped to the end of the line.
    const test_filter_set_id = "filter_set_1"
    const new_filter_id = "f2-a"

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        filters: [...defaultStore[test_filter_set_id].filters, new_filter_id]
      },
      filter_set_2: {
        ...defaultStore.filter_set_2,
        filters: defaultStore.filter_set_2.filters.filter(
          (f) => f !== new_filter_id
        )
      }
    }

    const addFilterAction = actions.addFilterToFilterSet(
      test_filter_set_id,
      new_filter_id
    )

    expect(filterSetsReducer(defaultStore, addFilterAction)).toEqual(newStore)
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should remove a filter from a filter set", () => {
    const test_filter_set_id = "filter_set_1"
    const removed_filter_id = "f1-a"

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        filters: defaultStore[test_filter_set_id].filters.filter(
          (f) => f !== removed_filter_id
        )
      }
    }

    const removeFilterAction = actions.removeFilterFromFilterSet(
      test_filter_set_id,
      removed_filter_id
    )

    expect(filterSetsReducer(defaultStore, removeFilterAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should set the enabled filters in a filter set", () => {
    const test_filter_set_id = "filter_set_2"
    const enabledFilters = ["f1-a", "f1-b"]

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        enabledFilters
      }
    }

    const setEnabledFilterSetFiltersAction = actions.setEnabledFilterSetFilters(
      test_filter_set_id,
      enabledFilters
    )

    expect(
      filterSetsReducer(defaultStore, setEnabledFilterSetFiltersAction)
    ).toEqual(newStore)
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should select a filter set", () => {
    const first_selected_filter_set_id = "filter_set_1"

    const oneSelectedStore = defaultStore

    const firstSelectFilterSetAction = {
      type: actions.SELECT_FILTER_SET,
      payload: { id: first_selected_filter_set_id }
    }

    expect(filterSetsReducer(defaultStore, firstSelectFilterSetAction)).toEqual(
      oneSelectedStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)

    const second_selected_filter_set_id = "filter_set_2"

    const twoSelectedStore = {
      ...defaultStore,
      [first_selected_filter_set_id]: {
        ...defaultStore[first_selected_filter_set_id],
        selected: false
      },
      [second_selected_filter_set_id]: {
        ...defaultStore[second_selected_filter_set_id],
        selected: true
      }
    }

    const secondSelectFilterSetAction = {
      type: actions.SELECT_FILTER_SET,
      payload: { id: second_selected_filter_set_id }
    }

    expect(
      filterSetsReducer(defaultStore, secondSelectFilterSetAction)
    ).toEqual(twoSelectedStore)
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should add a new dashboard filter to a filter set", () => {
    const test_filter_set_id = "filter_set_1"
    const new_filter_id = "f1-dashboard-filter"

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        filters: [...defaultStore[test_filter_set_id].filters, new_filter_id]
      }
    }

    const addDashboardFilterAction = {
      type: SET_DASHBOARD_FILTER,
      name: new_filter_id
    }

    expect(filterSetsReducer(defaultStore, addDashboardFilterAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should remove a dashboard filter from a filter set", () => {
    const test_filter_set_id = "filter_set_1"
    const removed_filter_id = "f1-b"

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        filters: defaultStore[test_filter_set_id].filters.filter(
          (f) => f !== removed_filter_id
        )
      }
    }

    const clearDashboardFilterAction = {
      type: CLEAR_BY_NAME,
      name: removed_filter_id
    }

    expect(filterSetsReducer(defaultStore, clearDashboardFilterAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should add a new dashboard cohort filter to a filter set", () => {
    const test_filter_set_id = "filter_set_1"
    const new_filter_id = "f1-dashboard-cohort"

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        filters: [...defaultStore[test_filter_set_id].filters, new_filter_id]
      }
    }

    const addDashboardFilterAction = {
      type: SET_DASHBOARD_COHORT,
      name: new_filter_id
    }

    expect(filterSetsReducer(defaultStore, addDashboardFilterAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should add a new crossfilter to a filter set", () => {
    const test_filter_set_id = "filter_set_1"
    const new_filter_id = "f1-cross-filter"

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        filters: [...defaultStore[test_filter_set_id].filters, new_filter_id]
      }
    }

    const addCrossFilterAction = {
      type: SET_FILTER_CROSSFILTER,
      payload: { name: new_filter_id }
    }

    expect(filterSetsReducer(defaultStore, addCrossFilterAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
  it("should remove a crossfilter from a filter set", () => {
    const test_filter_set_id = "filter_set_1"
    const removed_filter_id = "f1-a"

    const newStore = {
      ...defaultStore,
      [test_filter_set_id]: {
        ...defaultStore[test_filter_set_id],
        filters: defaultStore[test_filter_set_id].filters.filter(
          (f) => f !== removed_filter_id
        )
      }
    }

    const deleteCrossFilterAction = {
      type: DELETE_FILTER_CROSSFILTER,
      payload: { name: removed_filter_id }
    }

    expect(filterSetsReducer(defaultStore, deleteCrossFilterAction)).toEqual(
      newStore
    )
    expect(defaultStore).toEqual(defaultStoreCopy)
  })
})
