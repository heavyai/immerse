// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createReducer from "utils/redux/create-reducer"

import {
  REMOVE_ALL_PARAMETER_SETS,
  ADD_PARAMETER_SET,
  RENAME_PARAMETER_SET,
  REMOVE_PARAMETER_SETS,
  DUPLICATE_PARAMETER_SET,
  SET_HIDE_HIDDEN_PARAMETER_SET,
  RESET_PARAMETER_SETS_FROM_SNAPSHOT
} from "../constants"

export const INITIAL = {}

const parameterSetsReducers = {
  [REMOVE_ALL_PARAMETER_SETS]() {
    return INITIAL
  },
  [RESET_PARAMETER_SETS_FROM_SNAPSHOT]: (state, { snapshot = INITIAL }) =>
    snapshot,
  [ADD_PARAMETER_SET](state, action) {
    const {
      name = "Parameter set",
      id,
      parent,
      tabId,
      showHidden = true
    } = action.payload
    return {
      ...state,
      [id]: { name, id, parent, tabId, showHidden }
    }
  },
  [SET_HIDE_HIDDEN_PARAMETER_SET]: (state, { id, hideHidden }) => ({
    ...state,
    [id]: {
      ...state[id],
      hideHidden
    }
  }),
  [RENAME_PARAMETER_SET](state, action) {
    const { name, id } = action.payload
    return {
      ...state,
      [id]: { ...state[id], name, id }
    }
  },
  [REMOVE_PARAMETER_SETS](state, action) {
    const { sets = [] } = action.payload
    const newState = { ...state }
    sets.forEach((id) => delete newState[id])
    return newState
  },
  [DUPLICATE_PARAMETER_SET](state, action) {
    const { id, newId, tabId } = action.payload
    return {
      ...state,
      [newId]: { ...state[id], id: newId, tabId }
    }
  }
}

export default createReducer(parameterSetsReducers, INITIAL)
