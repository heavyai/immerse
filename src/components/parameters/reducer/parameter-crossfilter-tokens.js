// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createReducer from "utils/redux/create-reducer"

import { REMOVE_DASHBOARD_TAB } from "constants/action-types"
import {
  CLEAR_PARAMETER_USAGE,
  NOTE_CROSSFILTER_PARAMETER_USAGE
} from "../constants"

export const INITIAL = {}

const parameterUsageReducers = {
  [CLEAR_PARAMETER_USAGE]() {
    return INITIAL
  },
  [NOTE_CROSSFILTER_PARAMETER_USAGE](state, action) {
    const { token, tabId, chartId, keySuffix, tables } = action

    const tabState = state[tabId] || []
    const newTabState = tabState
      .filter(
        (r) =>
          r.token !== token ||
          r.chartId !== chartId ||
          r.keySuffix !== keySuffix
      )
      .concat(
        tables.map((table) => ({
          token,
          chartId,
          keySuffix,
          table
        }))
      )

    const newState = { ...state, [tabId]: newTabState }
    if (Object.keys(newState[tabId]).length === 0) {
      delete newState[tabId]
    }
    return newState
  },
  [REMOVE_DASHBOARD_TAB](state, action) {
    const { tabId } = action
    if (state[tabId]) {
      const newState = { ...state }
      delete newState[tabId]
      return newState
    }
    return state
  }
}

export default createReducer(parameterUsageReducers, INITIAL)
