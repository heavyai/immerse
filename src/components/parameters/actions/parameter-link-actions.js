// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getParameterSetIdForSelectedTab,
  getParameterSets,
  makeGetParameterValue,
  makeHasLinkedSiblings
} from "components/parameters/selectors"
import {
  clearParameterValues,
  setParameterDefault,
  setParameterValue
} from "components/parameters/actions/parameter-values-action-creators"
import { addParameterToParameterSet } from "components/parameters/actions/parameter-sets-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import { redrawChartsUsingParameter } from "components/parameters/actions/parameter-redraw-actions"

/**
 * if we are "linking" a parameter, then we want to inherit the value from the dashboard level parameter set.
 * so we wipe anything out in the current tab's set.
 * If the dashboard level set has no value to inherit, we also set this parameter's
 * current effective value as its dashboard level value.
 * @param newValue (optional) Value to set as dashboard level value. If not
 * passed, we use the current param value. This is *mainly* defensive--just to
 * ensure we don't inherit a stale dashboard value that we failed to clean up on
 * a previous parameter deletion.
 */
export const linkParameter = (parameter, newValue) => {
  return async (dispatch, getState) => {
    const parameterSetId = getParameterSetIdForSelectedTab(getState())
    const { parent } = getParameterSets(getState())[parameterSetId]
    const hasLinkedSiblings = makeHasLinkedSiblings(getState())(
      parameter,
      parameterSetId
    )

    // Grab the current value before changing anything
    const initialParameterValue = makeGetParameterValue(getState())(parameter)

    // Clear local values so that we inherit dashboard value
    await dispatch(clearParameterValues(parameter, parameterSetId))

    // If there's no value to inherit, promote the initial value to a dashboard
    // level value.
    if (parent && !hasLinkedSiblings) {
      await dispatch(
        addParameterToParameterSet({
          parameterSetId: parent,
          name: parameter,
          value: newValue || initialParameterValue
        })
      )
    }

    if (
      initialParameterValue !== makeGetParameterValue(getState())(parameter)
    ) {
      // If linking parameter changes its value, trigger a redraw
      await dispatch(redrawChartsUsingParameter(parameter))
    }

    // Mark dashboard unsaved
    dispatch(updateDashboardSaveState())
  }
}

// if we are "unlinking" a parameter, then we want to override the dashboard level parameter set.
// A new value or default value must be passed to override the inherited value.
export const unlinkParameter = (parameter, value, defaultValue) => {
  return async (dispatch, getState) => {
    const parameterSetId = getParameterSetIdForSelectedTab(getState())
    const initialParameterValue = makeGetParameterValue(getState())(parameter)

    await dispatch(
      setParameterValue({ name: parameter, parameterSetId, value })
    )
    await dispatch(
      setParameterDefault({ name: parameter, parameterSetId, defaultValue })
    )

    const { parent } = getParameterSets(getState())[parameterSetId]
    if (
      parent &&
      !makeHasLinkedSiblings(getState())(parameter, parameterSetId)
    ) {
      // If this was the only linked parameter value (no values in the tab sets
      // inherit from the dashboard set) clear values from the dashboard set.
      await dispatch(clearParameterValues(parameter, parent))
    }

    if (
      initialParameterValue !== makeGetParameterValue(getState())(parameter)
    ) {
      // If unlinking parameter changes its value, trigger a redraw
      await dispatch(redrawChartsUsingParameter(parameter))
    }

    // Mark dashboard unsaved
    dispatch(updateDashboardSaveState())
  }
}
