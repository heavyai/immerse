// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createReducer from "utils/redux/create-reducer"

import {
  ADD_COHORT,
  RENAME_COHORT,
  DELETE_COHORT,
  DELETE_ALL_COHORTS
} from "./cohorts-action-creators"

const INITIAL = {}

const cohortReducer = {
  [ADD_COHORT](state, action) {
    const { id, dataSource, dimension, filter, name } = action.payload
    return {
      ...state,
      [id]: {
        id,
        dataSource,
        dimension,
        filter,
        name
      }
    }
  },
  [RENAME_COHORT](state, action) {
    const { id, newName } = action.payload
    const newState = { ...state }
    if (newState[id] !== undefined) {
      newState[id] = { ...newState[id], name: newName }
    }

    return newState
  },
  [DELETE_COHORT](state, action) {
    const { id } = action.payload
    const newState = { ...state }
    delete newState[id]
    return newState
  },
  [DELETE_ALL_COHORTS]() {
    return INITIAL
  }
}

export default createReducer(cohortReducer, INITIAL)
