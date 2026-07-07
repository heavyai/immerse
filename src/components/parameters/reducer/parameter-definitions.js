// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createReducer from "utils/redux/create-reducer"

import {
  REMOVE_ALL_PARAMETER_DEFINITIONS,
  ADD_PARAMETER_DEFINITION,
  UPDATE_PARAMETER_DEFINITION,
  REMOVE_PARAMETER_DEFINITION,
  RESET_PARAMETER_DEFS_FROM_SNAPSHOT,
  RESET_PARAMETER_FROM_SNAPSHOT
} from "../constants"
import { DELETE_CHART } from "../../../constants/action-types"

export const INITIAL = {}

const parameterDefinitionsReducers = {
  [REMOVE_ALL_PARAMETER_DEFINITIONS]() {
    return INITIAL
  },
  [RESET_PARAMETER_DEFS_FROM_SNAPSHOT]: (state, { snapshot = INITIAL }) =>
    snapshot,
  [ADD_PARAMETER_DEFINITION](state, action) {
    const { name } = action.payload
    return {
      ...state,
      [name]: action.payload
    }
  },
  [UPDATE_PARAMETER_DEFINITION](state, action) {
    const { name } = action.payload
    return {
      ...state,
      [name]: {
        ...state[name],
        ...action.payload
      }
    }
  },
  [REMOVE_PARAMETER_DEFINITION](state, action) {
    const { name } = action.payload
    const newState = { ...state }
    delete newState[name]
    return newState
  },
  [RESET_PARAMETER_FROM_SNAPSHOT](state, { name, snapshot = {} }) {
    if (snapshot.definitions?.[name]) {
      return {
        ...state,
        [name]: snapshot.definitions[name]
      }
    }

    return state
  },
  [DELETE_CHART](state, { chartId, tabId }) {
    const newState = { ...state }

    Object.values(newState).forEach((definition) => {
      if (
        definition.parentChartId === chartId &&
        definition.parentChartTabId === tabId
      ) {
        delete newState[definition.name]
      }
    })

    return newState
  }
}

export default createReducer(parameterDefinitionsReducers, INITIAL)
