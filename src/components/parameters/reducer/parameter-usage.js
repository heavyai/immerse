// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createReducer from "utils/redux/create-reducer"

import { REMOVE_DASHBOARD_TAB } from "constants/action-types"
import {
  CLEAR_PARAMETER_USAGE,
  NOTE_PARAMETER_USAGE,
  REMOVE_CHART_FROM_PARAMETER_USAGE,
  RESET_PARAMETERS_USAGE_FROM_SNAPSHOT
} from "../constants"
import { chartIdMatchesUsageId } from "../utils"

export const INITIAL = {}

const parameterUsageReducers = {
  [CLEAR_PARAMETER_USAGE]() {
    return INITIAL
  },
  [RESET_PARAMETERS_USAGE_FROM_SNAPSHOT]: (state, { snapshot = INITIAL }) =>
    snapshot,
  [NOTE_PARAMETER_USAGE](state, action) {
    const {
      token,
      tabId,
      chartId,
      parameters: parametersArray
    } = action.payload
    const parameters = new Set(parametersArray)

    // this slice of state has the structure parameter -> token -> [chartIds, ...]

    let hasMods = false

    const tabState = state[tabId] || {}

    const newTabState = Object.keys(tabState).reduce((bucket, parameter) => {
      // we need to iterate over each parameter. If the parameter/token combo exists, we add/delete the parameter as necessary
      bucket[parameter] = Object.keys(tabState[parameter]).reduce(
        (paramBucket, paramToken) => {
          paramBucket[paramToken] = tabState[parameter][paramToken]

          // if this is not the token we're updating usage on, just keep what's existing.
          if (paramToken !== token) {
            return paramBucket
          }

          // if the existing usage for parameter/token HAS this chartId, but the param is NOT usage we're noting,
          // then we delete it.
          if (
            paramBucket[paramToken].some(
              (existingId) =>
                existingId === chartId && !parameters.has(parameter)
            )
          ) {
            hasMods = true
            paramBucket[paramToken] = paramBucket[paramToken].filter(
              (existingId) => existingId !== chartId
            )
          }

          if (paramBucket[paramToken].length === 0) {
            hasMods = true
            delete paramBucket[paramToken]
          }

          // now we've got a paramBucket.
          return paramBucket
        },
        {}
      )

      if (Object.keys(bucket[parameter]).length === 0) {
        hasMods = true
        delete bucket[parameter]
      }

      return bucket
    }, {})

    // tediously, we now have to iterate through the list of params and add any new associates.
    parameters.forEach((param) => {
      // yank out the list of chartIds associated with this parameter/token combo.
      const chartIds = (newTabState[param] || [])[token] || []
      // if we haven't already noted usage of this param/token/chart, add it to the list.
      if (!chartIds.some((existingId) => existingId === chartId)) {
        hasMods = true
        newTabState[param] = {
          ...newTabState[param],
          [token]: [...chartIds, chartId]
        }
      }
    })

    const newState = { ...state, [tabId]: newTabState }
    if (Object.keys(newState[tabId]).length === 0) {
      delete newState[tabId]
    }

    // if nothing was modified, we can safely return the original state. Otherwise, return the updated one.
    return hasMods ? newState : state
  },
  [REMOVE_CHART_FROM_PARAMETER_USAGE](state, action) {
    // if a chart is deleted, we need to clean up its usage.
    const { chartId, tabId } = action.payload

    let hasMods = false

    const tabState = state[tabId] || {}

    const newTabState = Object.keys(tabState).reduce((bucket, parameter) => {
      bucket[parameter] = Object.keys(tabState[parameter]).reduce(
        (paramBucket, token) => {
          paramBucket[token] = tabState[parameter][token]

          // if this param/token is associated with the chartId, we know we have a mod.
          // Note it and return a filtered list of chart IDs
          // not including the one we just deleted.

          if (
            paramBucket[token].some((existingId) =>
              chartIdMatchesUsageId(chartId, existingId)
            )
          ) {
            hasMods = true
            paramBucket[token] = paramBucket[token].filter(
              (existingId) => !chartIdMatchesUsageId(chartId, existingId)
            )
            if (paramBucket[token].length === 0) {
              delete paramBucket[token]
            }
          }

          return paramBucket
        },
        {}
      )
      return bucket
    }, {})

    const newState = { ...state, [tabId]: newTabState }
    if (Object.keys(newState[tabId]).length === 0) {
      delete newState[tabId]
    }

    // if nothing was modified, we can safely return the original state. Otherwise, return the updated one.
    return hasMods ? newState : state
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
