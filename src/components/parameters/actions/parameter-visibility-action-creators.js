// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ADD_PARAMETER_TO_PANEL,
  REMOVE_PARAMETER_FROM_PANEL
} from "../constants"
import {
  getParameterDefinitions,
  getParameterSetIdForSelectedTab,
  makeGetParametersInSet,
  makeParameterIsVisibleInPanel
} from "components/parameters/selectors"
import {
  linkParameter,
  unlinkParameter
} from "components/parameters/actions/parameter-link-actions"
import {
  addParameterToParameterSet,
  removeParameterFromParameterSet
} from "components/parameters/actions/parameter-sets-action-creators"
import { isUserFacingParameter } from "components/parameters/parameters-types"

export const addParameterToPanel = (name, defaultValue) => {
  return async (dispatch, getState) => {
    const parameterDefinitions = getParameterDefinitions(getState())
    if (!isUserFacingParameter(parameterDefinitions[name])) {
      return
    }

    const parameterSetIdForSelectedTab = getParameterSetIdForSelectedTab(
      getState()
    )

    const paramAlreadyExistsInParameterSetForTab = makeGetParametersInSet(
      getState()
    )(parameterSetIdForSelectedTab).has(name)

    if (
      parameterSetIdForSelectedTab &&
      !paramAlreadyExistsInParameterSetForTab
    ) {
      // Newly added parameters should be linked by default, so don't pass a
      // local value when adding it to a set (so that it falls back to the dashboard value)
      dispatch(addParameterToParameterSet({ name }))
      // If there is no dashboard value set already, this sets the parameter value on the
      // dashboard parameter set instead.
      dispatch(linkParameter(name, defaultValue))
    }

    const parameterIsVisibleInPanel = makeParameterIsVisibleInPanel(getState())(
      name
    )

    if (!parameterIsVisibleInPanel) {
      dispatch({
        type: ADD_PARAMETER_TO_PANEL,
        payload: { name, parameterSetId: parameterSetIdForSelectedTab }
      })
    }
  }
}

export const removeParameterFromPanel = (name) => {
  return async (dispatch, getState) => {
    const hasDashboardWidget = getState().dashboard.parameterContainers?.find(
      (pc) => pc.parameterName === name
    )
    const parameterSetIdForSelectedTab = getParameterSetIdForSelectedTab(
      getState()
    )

    // If no dashboard widgets for this parameter exist anywhere on this tab,
    // remove it from the current tab's parameter set entirely.
    if (!hasDashboardWidget) {
      // This does some cleanup in case this is the only linked value for the parameter
      await dispatch(unlinkParameter(name))
      dispatch(
        removeParameterFromParameterSet(name, parameterSetIdForSelectedTab)
      )
    } else {
      // Otherwise, we need to keep the parameter in the set and just hide it from the panel.
      dispatch({
        type: REMOVE_PARAMETER_FROM_PANEL,
        payload: { name, parameterSetId: parameterSetIdForSelectedTab }
      })
    }
  }
}
