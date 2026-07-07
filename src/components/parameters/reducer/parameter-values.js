// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createReducer from "utils/redux/create-reducer"

import {
  REMOVE_ALL_PARAMETER_VALUES,
  SET_PARAMETER_VALUE,
  REMOVE_PARAMETER_VALUE,
  SET_PARAMETER_DEFAULT,
  REMOVE_PARAMETER_DEFAULT,
  DUPLICATE_PARAMETER_SET,
  REMOVE_PARAMETER_SETS,
  REMOVE_PARAMETER_DEFINITION,
  CLEAR_PARAMETER_VALUES,
  SET_PARAMETER_HIDE,
  ADD_PARAMETER_TO_PANEL,
  REMOVE_PARAMETER_FROM_PANEL,
  RESET_PARAMETER_VALUES_FROM_SNAPSHOT,
  RESET_PARAMETER_FROM_SNAPSHOT
} from "../constants"

export const INITIAL = {}

const parameterValuesReducers = {
  [REMOVE_ALL_PARAMETER_VALUES]() {
    return INITIAL
  },
  [RESET_PARAMETER_VALUES_FROM_SNAPSHOT]: (state, { snapshot = INITIAL }) =>
    snapshot,
  [SET_PARAMETER_VALUE](state, action) {
    const { name, value, columnMetadata, parameterSetId } = action.payload
    const newState = {
      [name]: { [parameterSetId]: {} },
      ...state
    }
    newState[name] = {
      ...newState[name],
      [parameterSetId]: {
        ...newState[name][parameterSetId],
        value,
        columnMetadata,
        parameterSetId,
        name
      }
    }
    return newState
  },
  [REMOVE_PARAMETER_VALUE](state, action) {
    const { name, parameterSetId } = action.payload
    const newState = { ...state }
    newState[name] = { ...newState[name] }
    delete newState[name][parameterSetId]?.value
    delete newState[name][parameterSetId]?.columnMetadata
    return cleanupState(newState, name, parameterSetId)
  },
  [SET_PARAMETER_HIDE]: (state, { name, hide, parameterSetId }) => ({
    ...state,
    [name]: {
      ...state[name],
      [parameterSetId]: {
        ...state[name][parameterSetId],
        hide
      }
    }
  }),
  [SET_PARAMETER_DEFAULT](state, action) {
    const {
      name,
      defaultValue,
      defaultColumnMetadata,
      parameterSetId
    } = action.payload
    const newState = {
      [name]: { [parameterSetId]: {} },
      ...state
    }
    newState[name] = {
      ...newState[name],
      [parameterSetId]: {
        ...newState[name][parameterSetId],
        defaultValue,
        defaultColumnMetadata,
        parameterSetId,
        name
      }
    }
    return newState
  },
  [REMOVE_PARAMETER_DEFAULT](state, action) {
    const { name, parameterSetId } = action.payload
    const newState = { ...state }
    newState[name] = { ...newState[name] }
    delete newState[name][parameterSetId]?.defaultValue
    delete newState[name][parameterSetId]?.defaultColumnMetadata
    return cleanupState(newState, name, parameterSetId)
  },
  // this one's a little tedious. iterate through all parameters, and all sets they are in.
  // then add a new entry for the id.
  [DUPLICATE_PARAMETER_SET](state, action) {
    const { id: oldSetId, newId: newSetId } = action.payload
    return Object.keys(state).reduce((bucket, name) => {
      bucket[name] = { ...state[name] }

      // if we have an entry for the old parameter set, we add a new one.
      if (bucket[name][oldSetId] !== undefined) {
        bucket[name][newSetId] = {
          ...bucket[name][oldSetId],
          parameterSetId: newSetId
        }
      }

      return bucket
    }, {})
  },
  // if a definition is removed, we need to clean up its values.
  [REMOVE_PARAMETER_DEFINITION](state, action) {
    const { name } = action.payload
    const newState = { ...state }
    delete newState[name]
    return newState
  },
  // if a set is removed, we need to clean up its values.
  [REMOVE_PARAMETER_SETS](state, action) {
    const { sets } = action.payload
    const parameterSetsToRemove = new Set(sets)
    return Object.keys(state).reduce((bucket, name) => {
      // recall - values is an object mapping name -> { parameterSetId -> {value, defaultValue} }
      // so, for each parameter name, update its list of values.
      bucket[name] = Object.keys(state[name]).reduce(
        (setBucket, parameterSetId) => {
          // if the parameter has an entry for a parameter set that we're deleting, we skip it.
          // otherwise, we keep it.
          if (!parameterSetsToRemove.has(parameterSetId)) {
            setBucket[parameterSetId] = state[name][[parameterSetId]]
          }
          return setBucket
        },
        {}
      )
      return bucket
    }, {})
  },
  [CLEAR_PARAMETER_VALUES](state, action) {
    const { name, parameterSetId } = action.payload
    const newState = {
      [name]: { [parameterSetId]: {} },
      ...state
    }
    newState[name] = {
      ...newState[name],
      [parameterSetId]: {
        ...newState[name][parameterSetId],
        value: null,
        defaultValue: null,
        parameterSetId,
        name
      }
    }
    return newState
  },
  [ADD_PARAMETER_TO_PANEL](state, action) {
    const { name, parameterSetId } = action.payload
    return {
      ...state,
      [name]: {
        ...state[name],
        [parameterSetId]: {
          ...state[name]?.[parameterSetId],
          displayInPanel: true
        }
      }
    }
  },
  [REMOVE_PARAMETER_FROM_PANEL](state, { payload: { name, parameterSetId } }) {
    return {
      ...state,
      [name]: {
        ...state[name],
        [parameterSetId]: {
          ...state[name]?.[parameterSetId],
          displayInPanel: false
        }
      }
    }
  },
  [RESET_PARAMETER_FROM_SNAPSHOT](state, { name, snapshot = {} }) {
    if (snapshot.values?.[name]) {
      return {
        ...state,
        [name]: snapshot.values[name]
      }
    }

    return state
  }
}

function cleanupState(state, name, parameterSetId) {
  if (
    state[name][parameterSetId]?.value === undefined &&
    state[name][parameterSetId]?.defaultValue === undefined
  ) {
    const newState = { ...state }
    delete newState[name][parameterSetId]
    if (Object.keys(newState[name]).length === 0) {
      delete newState[name]
    }
    return newState
  } else {
    return state
  }
}

export default createReducer(parameterValuesReducers, INITIAL)
