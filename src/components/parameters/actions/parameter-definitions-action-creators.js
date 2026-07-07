// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ADD_PARAMETER_DEFINITION,
  REMOVE_ALL_PARAMETER_DEFINITIONS,
  REMOVE_PARAMETER_DEFINITION,
  RESET_PARAMETER_DEFS_FROM_SNAPSHOT,
  UPDATE_PARAMETER_DEFINITION
} from "../constants"

import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"

export const removeAllParameterDefinitions = () => ({
  type: REMOVE_ALL_PARAMETER_DEFINITIONS
})

export const resetParameterDefinitionsFromSnapshot = (snapshot) => ({
  type: RESET_PARAMETER_DEFS_FROM_SNAPSHOT,
  snapshot
})

export const addParameterDefinition = (definition) => (dispatch) => {
  dispatch({ type: ADD_PARAMETER_DEFINITION, payload: definition })
  dispatch(updateDashboardSaveState())
}

export const updateParameterDefinition = (definition) => (dispatch) => {
  dispatch({ type: UPDATE_PARAMETER_DEFINITION, payload: definition })
  dispatch(updateDashboardSaveState())
}

export const removeParameterDefinition = (name) => (dispatch) => {
  dispatch({ type: REMOVE_PARAMETER_DEFINITION, payload: { name } })
  dispatch(updateDashboardSaveState(true))
}
