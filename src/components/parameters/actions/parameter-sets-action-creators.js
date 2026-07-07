// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"

import {
  REMOVE_ALL_PARAMETER_SETS,
  ADD_PARAMETER_SET,
  RENAME_PARAMETER_SET,
  REMOVE_PARAMETER_SETS,
  DUPLICATE_PARAMETER_SET,
  SET_HIDE_HIDDEN_PARAMETER_SET,
  RESET_PARAMETER_SETS_FROM_SNAPSHOT
} from "../constants"

import {
  removeParameterValue,
  removeParameterDefault,
  setParameterValue,
  setParameterDefault
} from "./parameter-values-action-creators"

import {
  getParameterSetForDashboard,
  getParameterSetIdForSelectedTab
} from "../selectors"

export const DEFAULT_PARAMETER_SET_NAME = "Parameter Set"

export const removeAllParameterSets = () => ({
  type: REMOVE_ALL_PARAMETER_SETS
})

export const addParameterSet = ({
  name = DEFAULT_PARAMETER_SET_NAME,
  parent,
  tabId,
  id = pushid()
} = {}) => async (dispatch, getState) => {
  if (tabId && !parent) {
    const parentSet = getParameterSetForDashboard(getState())
    if (parentSet) {
      parent = parentSet.id
    }
  }
  await dispatch({
    type: ADD_PARAMETER_SET,
    payload: { name, parent, id, tabId }
  })
}

export const getParameterSet = ({
  tabId,
  name = DEFAULT_PARAMETER_SET_NAME,
  id = pushid(),
  parent
} = {}) => ({
  tabId,
  name,
  id,
  parent
})

export const getDefaultParameterSet = () => {
  return getParameterSet({ name: "Shared Parameter Set" })
}

export const addDefaultParameterSet = () =>
  addParameterSet(getDefaultParameterSet())

export const setHideHiddenParameterSet = (id, hideHidden) => ({
  type: SET_HIDE_HIDDEN_PARAMETER_SET,
  id,
  hideHidden
})

export const renameParameterSet = (id, name) => ({
  type: RENAME_PARAMETER_SET,
  payload: { id, name }
})

export const addParameterToParameterSet = ({
  parameterSetId,
  name,
  value,
  defaultValue
}) => {
  return async (dispatch, getState) => {
    if (parameterSetId === undefined) {
      parameterSetId = getParameterSetIdForSelectedTab(getState())
    }

    await dispatch(setParameterValue({ name, parameterSetId, value }))
    await dispatch(setParameterDefault({ name, parameterSetId, defaultValue }))
  }
}

export const removeParameterFromParameterSet = (name, parameterSetId) => {
  return async (dispatch, getState) => {
    if (parameterSetId === undefined) {
      parameterSetId = getParameterSetIdForSelectedTab(getState())
    }

    await dispatch(removeParameterValue(name, parameterSetId))
    await dispatch(removeParameterDefault(name, parameterSetId))
  }
}

export const resetParameterSetsFromSnapShot = (snapshot) => ({
  type: RESET_PARAMETER_SETS_FROM_SNAPSHOT,
  snapshot
})

export const removeParameterSet = (id) => ({
  type: REMOVE_PARAMETER_SETS,
  payload: { sets: [id] }
})

export const removeParameterSets = (sets) => ({
  type: REMOVE_PARAMETER_SETS,
  payload: { sets }
})

export const duplicateParameterSet = (id, tabId) => {
  const newId = pushid()

  return {
    type: DUPLICATE_PARAMETER_SET,
    payload: { id, newId, tabId }
  }
}
