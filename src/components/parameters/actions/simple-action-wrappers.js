// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  isParameterDefinedInSet,
  getParameterSetIdForSelectedTab,
  getParameterSetForDashboard
} from "../selectors"

import {
  setParameterValue,
  setParameterDefault
} from "./parameter-values-action-creators"

import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import { redrawChartsUsingParameter } from "components/parameters/actions/parameter-redraw-actions"

export const simpleSetParameterValue = (
  parameter,
  value,
  defaultValue = false
) => {
  return async (dispatch, getState) => {
    const tabParameterSetId = getParameterSetIdForSelectedTab(getState())
    const setterAction = defaultValue ? setParameterDefault : setParameterValue

    const payload = {
      name: parameter,
      parameterSetId: isParameterDefinedInSet(getState())(
        parameter,
        tabParameterSetId
      )
        ? tabParameterSetId
        : getParameterSetForDashboard(getState()).id,
      value,
      defaultValue: value
    }

    await Promise.all([
      await dispatch(setterAction(payload)),

      // Re-render all charts that are using this parameter.
      await dispatch(redrawChartsUsingParameter(parameter))
    ])

    // Mark dashboard unsaved
    await dispatch(updateDashboardSaveState())
  }
}
