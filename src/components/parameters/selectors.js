// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createSelector, createSelectorCreator, defaultMemoize } from "reselect"
import { isEqual } from "lodash"
import {
  chartIdMatchesUsageId,
  getChartIdFromUsageId,
  parameterValueRequiresParens
} from "./utils"
import { isUserFacingParameter, ParameterTypes } from "./parameters-types"

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual)

export const getParameterSets = ({ parameters: { sets = {} } = {} }) => sets
export const getParameterValues = ({ parameters: { values = {} } = {} }) =>
  values
export const getParameterDefinitions = ({
  parameters: { definitions = {} } = {}
}) => definitions
export const getParameterUsage = ({ parameters: { usage = {} } = {} }) => usage

export const getSelectedTab = ({
  dashboard: { selectedTabId } = {},
  parameters: { sets = {} } = {}
}) => {
  // if we have a selectedTabId, then we're in a tabbed environment. Use it.
  if (selectedTabId) {
    return selectedTabId
  }
  // otherwise, we need to look in the parameter sets to see the sole set associated with a tab id.
  const tabSet =
    Object.values(sets).find((set) => set.tabId !== undefined) || {}

  return tabSet.tabId
}

export const makeGetParameterSetIdsForTabId = createSelector(
  [getParameterSets],
  (parameterSets) => (tabId) =>
    Object.values(parameterSets)
      .filter((set) => set.tabId === tabId)
      .map((set) => set.id)
)

export const getParamSetById = createSelector(
  [getParameterSets],
  (paramSets) => (paramId) => paramSets[paramId]
)

export const getParameterSetIdForSelectedTab = createSelector(
  [makeGetParameterSetIdsForTabId, getSelectedTab],
  (getParameterSet, tabId) => getParameterSet(tabId)[0]
)

export const isParameterDefinedInSet = createSelector(
  [getParameterValues],
  (parameterValues) => (parameter, parameterSetId) => {
    const paramValuesForName = parameterValues && parameterValues[parameter]
    const values = paramValuesForName && paramValuesForName[parameterSetId]
    if (!values) {
      return false
    }
    const { value, defaultValue } = values

    return (
      (value !== null && value !== undefined) ||
      (defaultValue !== null && defaultValue !== undefined)
    )
  }
)

// please note - this function should be used sparingly, since over the mid-long term a dashboard may
// have multiple parameter sets.
export const getParameterSetForDashboard = createSelector(
  [getParameterSets],
  (parameterSets) =>
    Object.values(parameterSets).find((set) => set.tabId === undefined)
)

export const getParameterSetsForTabId = createSelector(
  [getParameterSets],
  (parameterSets) => (tabId) =>
    Object.values(parameterSets).filter((set) => set.tabId === tabId)
)

export const getSharedParameterSets = (state) => {
  return getParameterSetsForTabId(state)(undefined)
}
export const makeGetParameterValueObject = createSelector(
  [
    getParameterDefinitions,
    getParameterSets,
    getParameterValues,
    getParameterSetIdForSelectedTab
  ],
  (parameterDefs, parameterSets, parameterValues, defaultParameterSetId) => (
    parameter,
    parameterSetId
  ) => {
    if (!parameterDefs[parameter]) {
      throw new Error(`Cannot get value of undefined parameter: ${parameter}`)
    }

    if (!parameterSetId) {
      parameterSetId = defaultParameterSetId
    }

    if (!parameterSets[parameterSetId]) {
      throw new Error(
        `Cannot get values in undefined parameter set ${parameterSetId}`
      )
    }

    // okay, now it's easy. Start at our current set, and return either the value or the defaultValue
    // if we don't have anything, then we go back up through all the parent sets.
    // and finally, we return the definition's default.
    do {
      const parameterSetValue =
        parameterValues[parameter]?.[parameterSetId] || {}
      const val = parameterSetValue.value || parameterSetValue.defaultValue
      let columnMetadata = parameterSetValue.columnMetadata
      if (!parameterSetValue.value) {
        columnMetadata = parameterSetValue.defaultColumnMetadata
      }
      if (val !== undefined && val !== null) {
        // https://www.youtube.com/watch?v=9cQgQIMlwWw
        // we need to fix the syntax -somewhere-, so this does it upon read. If the user typed in a
        // SELECT statement, but didn't wrap it in parens...wrap it in parens.
        if (parameterDefs[parameter].type === ParameterTypes.TABLE) {
          if (parameterValueRequiresParens(val)) {
            return { value: `(${val})` }
          }
        }

        return { value: val, columnMetadata }
      }
      parameterSetId = parameterSets[parameterSetId].parent
    } while (parameterSetId)

    // didn't find anything anywhere? Return the parameter definition's default.
    return {
      value: parameterDefs[parameter].defaultValue,
      columnMetadata: parameterDefs[parameter].defaultColumnMetadata
    }
  }
)

export const makeGetParameterValueColumnMetadata = createSelector(
  [makeGetParameterValueObject],
  (getValueObject) => (parameter, parameterSetId) => {
    return getValueObject(parameter, parameterSetId).columnMetadata
  }
)

export const makeGetParameterValueCombiner = (parameterValueObject) => (
  parameter,
  parameterSetId
) => {
  return parameterValueObject(parameter, parameterSetId).value
}

export const makeGetParameterValue = createSelector(
  [makeGetParameterValueObject],
  makeGetParameterValueCombiner
)

export const makeGetParameterHide = createSelector(
  [
    getParameterDefinitions,
    getParameterSets,
    getParameterValues,
    getParameterSetIdForSelectedTab
  ],
  (parameterDefs, parameterSets, parameterValues, defaultParameterSetId) => {
    return (parameter, parameterSetId) => {
      if (!parameterDefs[parameter]) {
        throw new Error(`Cannot get hide of undefined parameter: ${parameter}`)
      }

      parameterSetId = parameterSetId || defaultParameterSetId

      if (!parameterSets[parameterSetId]) {
        throw new Error(
          `Cannot get hide in undefined parameter set ${parameterSetId}`
        )
      }

      do {
        const parameterSet = parameterValues[parameter]?.[parameterSetId] || {}
        if (parameterSet.hasOwnProperty("hide")) {
          return parameterSet.hide
        }
        parameterSetId = parameterSets[parameterSetId].parent
      } while (parameterSetId)
      return false
    }
  }
)

export const makeGetParametersInSet = createSelector(
  [getParameterValues, getParameterSetIdForSelectedTab],
  (parameterValues, selectedParameterSetId) => (
    parameterSetId = selectedParameterSetId
  ) => {
    return Object.keys(parameterValues).reduce((bucket, parameter) => {
      if (parameterValues[parameter][parameterSetId]) {
        bucket.add(parameter)
      }
      return bucket
    }, new Set())
  }
)

export const makeGetParameterUsage = createSelector(
  [getParameterUsage],
  (usage) => (parameter, tabId) =>
    new Set(
      Object.keys(usage)
        .filter((usageTabId) => tabId === undefined || usageTabId === tabId)
        .map((usageTabId) =>
          Object.values((usage[usageTabId] || {})[parameter] || {})
        )
        .flat(2)
        .map((usageChartId) => getChartIdFromUsageId(usageChartId))
    )
)

export const makeIsParameterInUse = createSelector(
  [makeGetParameterUsage],
  (getUsage) => (parameter, tabId) => getUsage(parameter, tabId).size > 0
)

/**
 * For a given parameter value, returns if any siblings (i.e. values in
 * parameter sets that share the same parent) are "linked". That is, if any
 * siblings do not have have local values that overwrite the value in the parent
 * set.
 */
export const makeHasLinkedSiblings = createSelector(
  [getParameterValues, getParameterSets, isParameterDefinedInSet],
  (parameterValues, parameterSets, parameterDefinedInSet) => (
    parameterName,
    parameterSetId
  ) => {
    const { parent } = parameterSets[parameterSetId]

    return Object.keys(parameterValues[parameterName] || {})
      .filter(
        (setName) =>
          setName !== parameterSetId && parameterSets[setName].parent === parent
      )
      .some((setName) => !parameterDefinedInSet(parameterName, setName))
  }
)

export const makeGetParameterValuesForChartCombiner = (
  getParameterValue,
  usages,
  tabId,
  parameterDefinitions
) => (chartId) => {
  const parameterNames = Object.keys(usages[tabId] || {}).filter((name) => {
    const usagesForParameter = Object.values(usages[tabId][name])
    return (
      parameterDefinitions[name] &&
      usagesForParameter.some((usageChartIds) =>
        usageChartIds.some((usageChartId) =>
          chartIdMatchesUsageId(chartId, usageChartId)
        )
      )
    )
  })

  return parameterNames.reduce(
    (acc, parameterName) => ({
      ...acc,
      [parameterName]: getParameterValue(parameterName)
    }),
    {}
  )
}

export const makeGetParameterValuesForChart = createDeepEqualSelector(
  [
    makeGetParameterValue,
    getParameterUsage,
    getSelectedTab,
    getParameterDefinitions
  ],
  makeGetParameterValuesForChartCombiner
)

export const makeGetParameterColumnsForTable = createSelector(
  [getParameterDefinitions, makeGetParameterValue],
  (definitions, getParameterValue) => {
    return (table) =>
      Object.keys(definitions)
        .filter(
          (def) =>
            definitions[def].type === ParameterTypes.COLUMN &&
            definitions[def].source === table
        )
        .reduce((bucket, param) => {
          bucket[param] = getParameterValue(param)
          return bucket
        }, {})
  }
)

export const makeGetNamedSelectorParametersForTable = createSelector(
  [getParameterDefinitions, makeGetParameterValue],
  (definitions, getParameterValue) => {
    return (table, parameterType) =>
      Object.keys(definitions)
        .filter(
          (def) =>
            definitions[def].type === parameterType &&
            definitions[def].source === table
        )
        .reduce((bucket, param) => {
          const { dataType, displayName, source } = definitions[param]
          bucket[param] = {
            value: getParameterValue(param),
            dataType,
            name: param,
            displayName,
            source
          }
          return bucket
        }, {})
  }
)

export const makeGetParametersOfType = createSelector(
  [getParameterDefinitions],
  (definitions) => {
    return (type) =>
      Object.keys(definitions).filter((def) => definitions[def].type === type)
  }
)

export const getUserFacingParameterDefinitions = createSelector(
  [getParameterDefinitions],
  (parameterDefinitions) => {
    const userFacingParameters = {}
    Object.keys(parameterDefinitions).forEach((name) => {
      if (isUserFacingParameter(parameterDefinitions[name])) {
        userFacingParameters[name] = parameterDefinitions[name]
      }
    })
    return userFacingParameters
  }
)

export const makeParameterIsVisibleInPanel = createSelector(
  [
    getParameterValues,
    getParameterSetIdForSelectedTab,
    getParameterDefinitions
  ],
  (parameterValues, parameterSetIdForSelectedTab, parameterDefinitions) => (
    parameterName
  ) => {
    return (
      isUserFacingParameter(parameterDefinitions[parameterName]) &&
      parameterValues[parameterName]?.[parameterSetIdForSelectedTab]
        ?.displayInPanel !== false
    )
  }
)

export const makeIsAllowedDisplayName = createSelector(
  [getParameterDefinitions],
  (definitions) => (currentParameterName) => (displayName) =>
    Object.values(definitions).every(
      (def) =>
        isUserFacingParameter(def) ||
        def.displayName !== displayName ||
        def.name === currentParameterName
    )
)
