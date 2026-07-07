// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  NOTE_PARAMETER_USAGE,
  NOTE_CROSSFILTER_PARAMETER_USAGE,
  CLEAR_PARAMETER_USAGE,
  REMOVE_CHART_FROM_PARAMETER_USAGE,
  RESET_PARAMETERS_USAGE_FROM_SNAPSHOT
} from "../constants"

import { getSelectedTab } from "../selectors"

export const didUsageChangeForChartId = ({
  chartId,
  parameters,
  token,
  currentTabUsage = []
}) => {
  // god is this tedious. So, first, pull out the current tab's parameter usage.

  // iterate over it - if the
  const needsExistingUpdate = Object.keys(currentTabUsage).reduce(
    (update, param) => {
      if (update) {
        return update
      }
      const currentParamUsage = currentTabUsage?.[param]?.[token] || []

      // chart param/usage has changed if we're using that param and don't have a usage record of it.
      // or if we're NOT using that param and do have a usage record of it.
      const paramChartUsageChanged =
        (parameters.includes(param) && !currentParamUsage.includes(chartId)) ||
        (!parameters.includes(param) && currentParamUsage.includes(chartId))

      return paramChartUsageChanged
    },
    false
  )

  if (needsExistingUpdate) {
    return true
  }

  // but there's a second case - we have no usage information on this parameter at all. If we
  // have a param that is NOT in currentTabUsage, we also update.

  return parameters.reduce((newParam, param) => {
    return newParam || !Object.keys(currentTabUsage).includes(param)
  }, false)
}

export const didCrossfilterParamUsageChange = ({
  tabId,
  chartId,
  token,
  keySuffix,
  tables,
  state
}) => {
  const { parameters: crossfilterTokens } = state
  if (crossfilterTokens && crossfilterTokens[tabId]) {
    const matching = crossfilterTokens[tabId].filter(
      (r) =>
        r.chartId === chartId && r.token === token && r.keySuffix === keySuffix
    )
    if (matching.length !== tables.length) {
      // more or less tables so definitely a change
      return true
    }

    // see if all the tables are the same
    const currentTables = new Set(matching.map((r) => r.table))
    for (const t of tables) {
      if (currentTables.has(t)) {
        currentTables.delete(t)
      } else {
        return true
      }
    }
    return currentTables.size > 0
  }

  // if we made it here, it's only worth recording a change if there are tables
  // to record
  return tables.length > 0
}

export const resetParametersUsageFromSnapshot = (snapshot) => ({
  type: RESET_PARAMETERS_USAGE_FROM_SNAPSHOT,
  snapshot
})

export const noteParameterUsage = (usage) => {
  return (dispatch, getState) => {
    const tabId = usage.tabId || getSelectedTab(getState())

    const needsUpdate = didUsageChangeForChartId({
      chartId: usage.chartId,
      token: usage.token,
      parameters: usage.parameters,
      currentTabUsage: getState().parameters?.usage?.[tabId]
    })

    if (needsUpdate) {
      dispatch({
        type: NOTE_PARAMETER_USAGE,
        payload: { ...usage, tabId }
      })
    }
  }
}

export const noteCrossfilterParameterUsage = (
  chartId,
  token,
  keySuffix,
  tables
) => (dispatch, getState) => {
  const state = getState()
  const tabId = getSelectedTab(state)
  if (
    didCrossfilterParamUsageChange({
      tabId,
      chartId,
      token,
      keySuffix,
      tables,
      state
    })
  ) {
    dispatch({
      type: NOTE_CROSSFILTER_PARAMETER_USAGE,
      tabId,
      chartId,
      token,
      keySuffix,
      tables
    })
  }
}

export const clearParameterUsage = () => ({ type: CLEAR_PARAMETER_USAGE })

export const removeChartFromParameterUsage = (chartId, tabId) => {
  return (dispatch, getState) => {
    dispatch({
      type: REMOVE_CHART_FROM_PARAMETER_USAGE,
      payload: { chartId, tabId: tabId || getSelectedTab(getState()) }
    })
  }
}
