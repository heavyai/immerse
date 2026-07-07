// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createReducer from "utils/redux/create-reducer"

import {
  ADD_CHART_ADDON,
  REMOVE_CHART_ADDON,
  UPDATE_CHART_ADDON,
  DUPLICATE_CHART_ADDON
} from "./chart-addon-constants"

export const INITIAL = {}

const chartAddonsReducer = {
  [ADD_CHART_ADDON](state, action) {
    const { id, type } = action.payload
    return {
      ...state,
      [id]: { type }
    }
  },
  [REMOVE_CHART_ADDON](state, action) {
    const { id } = action.payload
    if (id in state) {
      const newState = { ...state }
      delete newState[id]
      return newState
    } else {
      return state
    }
  },
  [UPDATE_CHART_ADDON](state, action) {
    const { id, updates } = action.payload
    delete updates.id // you should never pass in an id with updates, but just in case - toss it.
    delete updates.type // you should never pass in a type with updates, but just in case - toss it.
    return {
      ...state,
      [id]: {
        ...state[id],
        ...updates
      }
    }
  },
  [DUPLICATE_CHART_ADDON](state, action) {
    const { id, addon } = action.payload
    return {
      ...state,
      [id]: addon
    }
  }
}

export default createReducer(chartAddonsReducer, INITIAL)
