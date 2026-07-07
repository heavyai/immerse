// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isCustomSqlParameter } from "components/parameters/parameters-types"
import {
  addDefaultParameterSet,
  addParameterSet,
  getDefaultParameterSet,
  getParameterSet,
  removeAllParameterSets
} from "./parameter-sets-action-creators"
import {
  removeAllParameterDefinitions,
  removeParameterDefinition
} from "./parameter-definitions-action-creators"
import { removeAllParameterValues } from "./parameter-values-action-creators"
import { clearParameterUsage } from "./parameter-usage-action-creators"
import { getParameterDefinitions } from "components/parameters/selectors"
import { RESET_PARAMETER_FROM_SNAPSHOT } from "components/parameters/constants"

export * from "./parameter-definitions-action-creators"
export * from "./parameter-sets-action-creators"
export * from "./parameter-values-action-creators"
export * from "./parameter-usage-action-creators"

export const clearParametersData = () => async (dispatch) => {
  await dispatch(removeAllParameterSets())
  await dispatch(removeAllParameterDefinitions())
  await dispatch(removeAllParameterValues())
  await dispatch(clearParameterUsage())
}

export const cleanupUnusedCustomSqlParameterDefinitions = (snapshot) => async (
  dispatch,
  getState
) => {
  const savedCustomSqlParameters = Object.keys(
    snapshot.definitions
  ).filter((parameter) => isCustomSqlParameter(snapshot.definitions[parameter]))
  const currentParameterDefinitions = getParameterDefinitions(getState())
  const parametersToRemove = Object.keys(currentParameterDefinitions).filter(
    (parameter) =>
      isCustomSqlParameter(currentParameterDefinitions[parameter]) &&
      !savedCustomSqlParameters.includes(parameter)
  )
  await Promise.all(
    parametersToRemove.map((parameter) =>
      dispatch(removeParameterDefinition(parameter))
    )
  )
}

export const initializeParametersData = () => async (dispatch, getState) => {
  await dispatch(clearParametersData())
  await dispatch(addDefaultParameterSet())

  const tabId = getState().dashboard.selectedTabId
  if (tabId) {
    await dispatch(addParameterSet({ tabId }))
  }
}

export const getDefaultParametersData = ({ tabId } = {}) => {
  const sharedParameterSet = getDefaultParameterSet()

  const sets = { [sharedParameterSet.id]: sharedParameterSet }
  if (tabId) {
    const tabParameterSet = getParameterSet({
      tabId,
      parent: sharedParameterSet.id
    })
    sets[tabParameterSet.id] = tabParameterSet
  }
  return {
    values: {},
    definitions: {},
    sets
  }
}
const resetParameterFromSnapshot = (name, snapshot) => ({
  type: RESET_PARAMETER_FROM_SNAPSHOT,
  name,
  snapshot
})

export const resetCustomSqlParametersFromSnapshot = (snapshot) => async (
  dispatch
) => {
  const parametersToReset = Object.keys(
    snapshot.definitions
  ).filter((parameter) => isCustomSqlParameter(snapshot.definitions[parameter]))

  await Promise.all(
    parametersToReset.map(async (parameterName) =>
      dispatch(resetParameterFromSnapshot(parameterName, snapshot))
    )
  )
}
