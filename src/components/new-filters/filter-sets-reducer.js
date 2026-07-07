// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash"
import createReducer from "utils/redux/create-reducer"

import {
  ADD_FILTER_SET,
  DUPLICATE_FILTER_SET,
  DELETE_FILTER_SET,
  CLEAR_ALL_FILTER_SETS,
  RENAME_FILTER_SET,
  ADD_FILTER_TO_FILTER_SET,
  REMOVE_FILTER_FROM_FILTER_SET,
  SELECT_FILTER_SET,
  SET_ENABLED_FILTER_SET_FILTERS,
  SET_FILTER_SET_DIMENSION,
  SET_COHORT_AGGREGATE_FILTER,
  REMOVE_COHORT_AGGREGATE_FILTER,
  TOGGLE_COHORT_AGGREGATE_FILTER,
  SET_COHORT_AGGREGATE_FILTER_VALIDITY
} from "./filter-sets-action-creators"

import {
  SET_DASHBOARD_FILTER,
  CLEAR_BY_NAME,
  SET_DASHBOARD_COHORT,
  SET_CROSSFILTER,
  CANCEL_CHART_FILTER_CHANGES
} from "vega/constants/filter-action-types"

import {
  SET_FILTER_CROSSFILTER,
  DELETE_FILTER_CROSSFILTER
} from "constants/action-types"
import { hasParamSyntax } from "utils/parameters"

const setFilterInFilterSets = (state, param) => {
  const { name } = param
  const selectedFilterSet = Object.values(state).find(
    (filterSet) => filterSet.selected
  )
  if (selectedFilterSet !== undefined) {
    const newState = { ...state }
    newState[selectedFilterSet.id] = {
      ...state[selectedFilterSet.id],
      filters: [
        ...state[selectedFilterSet.id].filters.filter((f) => f !== name),
        name
      ]
    }
    return newState
  } else {
    return state
  }
}

const clearFilterFromFilterSets = (state, param) => {
  const { name } = param
  return Object.keys(state).reduce((newState, id) => {
    const filterSet = state[id]
    if (filterSet.filters.includes(name)) {
      newState[id] = {
        ...state[id],
        filters: state[id].filters.filter((f) => f !== name)
      }
    } else {
      newState[id] = filterSet
    }
    return newState
  }, {})
}

const INITIAL = {}

const filterSetsReducers = {
  [ADD_FILTER_SET](state, action) {
    const { id, name } = action.payload
    return {
      ...state,
      [id]: {
        id,
        name,
        filters: [],
        cohortAggregateFilters: {},
        selected: false,
        dimensions: {}
      }
    }
  },
  [RENAME_FILTER_SET](state, action) {
    const { id, newName } = action.payload
    const newState = { ...state }
    if (newState[id] !== undefined) {
      newState[id] = { ...newState[id], name: newName }
    }

    return newState
  },
  [DELETE_FILTER_SET](state, action) {
    const { id } = action.payload
    const newState = { ...state }
    delete newState[id]
    return newState
  },
  [DUPLICATE_FILTER_SET](state, action) {
    const { id, newId, filters = [], enabledFilters = [] } = action.payload
    return {
      ...state,
      [newId]: {
        ...cloneDeep(state[id]),
        filters,
        enabledFilters,
        id: newId,
        name: `${state[id].name} (Copy)`
      }
    }
  },
  [CLEAR_ALL_FILTER_SETS]() {
    return INITIAL
  },
  [SET_FILTER_SET_DIMENSION](state, action) {
    const { id, dataSource, table, dimension } = action.payload
    const newState = { ...state }
    if (newState[id] !== undefined) {
      const fullDimension = hasParamSyntax(table)
        ? dimension
        : `${table}.${dimension}`
      newState[id] = {
        ...newState[id],
        dimensions: { [dataSource]: fullDimension },
        cohortAggregateFilters: {}
      }
      if (dimension === undefined) {
        delete newState[id].dimensions[table]
      }
    }
    return newState
  },
  [ADD_FILTER_TO_FILTER_SET](state, action) {
    const { id, filter } = action.payload
    return Object.values(state).reduce((newState, filterSet) => {
      if (filterSet.id === id) {
        newState[filterSet.id] = {
          ...state[filterSet.id],
          filters: [
            ...state[filterSet.id].filters.filter((f) => f !== filter),
            filter
          ]
        }
      } else if (filterSet.filters.includes(filter)) {
        newState[filterSet.id] = {
          ...state[filterSet.id],
          filters: state[filterSet.id].filters.filter((f) => f !== filter)
        }
      } else {
        newState[filterSet.id] = state[filterSet.id]
      }
      return newState
    }, {})
  },
  [REMOVE_FILTER_FROM_FILTER_SET](state, action) {
    const { id, filter } = action.payload
    const newState = { ...state }
    if (newState[id]) {
      newState[id] = {
        ...newState[id],
        filters: newState[id].filters.filter((f) => f !== filter)
      }
    }
    return newState
  },
  [SET_COHORT_AGGREGATE_FILTER](state, action) {
    const { filter, name } = action.payload
    const selectedFilterSet = Object.values(state).find(
      (filterSet) => filterSet.selected
    )

    if (!selectedFilterSet) {
      return state
    }

    // For a newly created filter, set defaults
    let enabled = true
    let valid = false

    // For existing filters, transfer existing properties.
    const existingFilters = state[selectedFilterSet.id].cohortAggregateFilters

    if (name && existingFilters && existingFilters[name]) {
      enabled = existingFilters[name].enabled
      valid = existingFilters[name].valid
    }

    const newState = { ...state }
    newState[selectedFilterSet.id] = {
      ...newState[selectedFilterSet.id],
      cohortAggregateFilters: {
        ...newState[selectedFilterSet.id].cohortAggregateFilters,
        [name]: {
          ...(newState[selectedFilterSet.id].cohortAggregateFilters &&
            newState[selectedFilterSet.id].cohortAggregateFilters[name]),
          enabled,
          valid,
          filter,
          name
        }
      }
    }

    return newState
  },
  [REMOVE_COHORT_AGGREGATE_FILTER](state, action) {
    const { filterId } = action.payload
    const selectedFilterSet = Object.values(state).find(
      (filterSet) => filterSet.selected
    )

    if (!selectedFilterSet) {
      return state
    }

    const newAggregateFilters = { ...selectedFilterSet.cohortAggregateFilters }
    delete newAggregateFilters[filterId]

    const newState = { ...state }
    newState[selectedFilterSet.id] = {
      ...newState[selectedFilterSet.id],
      cohortAggregateFilters: newAggregateFilters
    }

    return newState
  },
  [TOGGLE_COHORT_AGGREGATE_FILTER](state, action) {
    const { filterId } = action.payload
    const selectedFilterSet = Object.values(state).find(
      (filterSet) => filterSet.selected
    )
    if (!selectedFilterSet) {
      return state
    }

    const newState = { ...state }
    const filterMetadata =
      newState[selectedFilterSet.id].cohortAggregateFilters[filterId]

    const enabled =
      action.payload.enabled === undefined
        ? !filterMetadata.enabled
        : action.payload.enabled

    newState[selectedFilterSet.id] = {
      ...newState[selectedFilterSet.id],
      cohortAggregateFilters: {
        ...newState[selectedFilterSet.id].cohortAggregateFilters,
        [filterId]: {
          ...newState[selectedFilterSet.id].cohortAggregateFilters[filterId],
          enabled
        }
      }
    }

    return newState
  },
  [SET_COHORT_AGGREGATE_FILTER_VALIDITY](state, action) {
    const { filterId, valid } = action.payload
    const selectedFilterSet = Object.values(state).find(
      (filterSet) => filterSet.selected
    )
    if (!selectedFilterSet) {
      return state
    }
    const newState = { ...state }

    newState[selectedFilterSet.id] = {
      ...newState[selectedFilterSet.id],
      cohortAggregateFilters: {
        ...newState[selectedFilterSet.id].cohortAggregateFilters,
        [filterId]: {
          ...newState[selectedFilterSet.id].cohortAggregateFilters[filterId],
          valid
        }
      }
    }

    return newState
  },
  [SET_ENABLED_FILTER_SET_FILTERS](state, action) {
    const { id, enabledFilters } = action.payload
    const newState = { ...state }
    if (newState[id]) {
      newState[id] = {
        ...newState[id],
        enabledFilters
      }
    }
    return newState
  },
  [SELECT_FILTER_SET](state, action) {
    const { id } = action.payload

    // selecting a filterSet has all sorts of ramifications
    // so be 100% positive we only do it if we're trying to select
    // something that exists
    if (state[id] === undefined) {
      return state
    }

    return Object.keys(state).reduce((newState, filterSetId) => {
      if (filterSetId === id && state[filterSetId].selected === false) {
        newState[filterSetId] = { ...state[filterSetId], selected: true }
      } else if (filterSetId !== id && state[filterSetId].selected === true) {
        newState[filterSetId] = { ...state[filterSetId], selected: false }
      } else {
        newState[filterSetId] = state[filterSetId]
      }
      return newState
    }, {})
  },
  [SET_DASHBOARD_FILTER](state, action) {
    return setFilterInFilterSets(state, action)
  },
  [SET_DASHBOARD_COHORT](state, action) {
    const { name } = action
    const selectedFilterSet = Object.values(state).find(
      (filterSet) => filterSet.selected
    )
    if (selectedFilterSet !== undefined) {
      const newState = { ...state }
      newState[selectedFilterSet.id] = {
        ...state[selectedFilterSet.id],
        filters: [
          ...state[selectedFilterSet.id].filters.filter((f) => f !== name),
          name
        ]
      }
      return newState
    } else {
      return state
    }
  },
  [CLEAR_BY_NAME](state, action) {
    return clearFilterFromFilterSets(state, action)
  },
  [SET_FILTER_CROSSFILTER](state, action) {
    const { name } = action.payload
    const selectedFilterSet = Object.values(state).find(
      (filterSet) => filterSet.selected
    )
    if (selectedFilterSet !== undefined) {
      const newState = { ...state }
      newState[selectedFilterSet.id] = {
        ...state[selectedFilterSet.id],
        filters: [
          ...state[selectedFilterSet.id].filters.filter((f) => f !== name),
          name
        ]
      }
      return newState
    } else {
      return state
    }
  },
  [DELETE_FILTER_CROSSFILTER](state, action) {
    const { name } = action.payload
    return Object.keys(state).reduce((newState, id) => {
      const filterSet = state[id]
      if (filterSet.filters.includes(name)) {
        newState[id] = {
          ...state[id],
          filters: state[id].filters.filter((f) => f !== name)
        }
      } else {
        newState[id] = filterSet
      }
      return newState
    }, {})
  },
  [SET_CROSSFILTER](state, filter) {
    return setFilterInFilterSets(state, filter)
  },
  [CANCEL_CHART_FILTER_CHANGES](
    state,
    { savedChartFilters, clearedFilterNames }
  ) {
    const selectedFilterSet = Object.values(state).find(
      (filterSet) => filterSet.selected
    )

    return selectedFilterSet
      ? {
          ...state,
          [selectedFilterSet.id]: {
            ...selectedFilterSet,
            filters: [
              ...selectedFilterSet.filters.filter(
                (id) =>
                  !clearedFilterNames.includes(id) &&
                  !savedChartFilters.some((f) => f.name === id)
              ),
              ...savedChartFilters
                .filter((f) => f.appliesTo === "CROSSFILTER")
                .map((f) => f.name)
            ]
          }
        }
      : state
  }
}

export default createReducer(filterSetsReducers, INITIAL)
