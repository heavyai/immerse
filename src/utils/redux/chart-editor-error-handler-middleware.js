// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ActionTypes from "constants/action-types"
import { setChartHasError } from "actions/charts-action-creators"
import { setSelectorError } from "actions/selector-action-creators"

const isErrorActionType = (type) =>
  type === ActionTypes.CHART_RENDER_ERROR ||
  type === ActionTypes.CHART_REDRAW_ERROR

export function getSetErrorAction(id, lastChartUpdateAction) {
  // If navigating away from dashboard/tab, state might have been wiped by the
  // time this error returns--in which case we don't need to set an error.
  if (!lastChartUpdateAction) {
    return null
  }

  switch (lastChartUpdateAction.type) {
    case ActionTypes.UPDATE_SELECTOR:
      return setSelectorError(id, {
        index: lastChartUpdateAction.selectorIndex,
        type: lastChartUpdateAction.selectorType
      })
    case ActionTypes.ADD_MEASURE:
      return setSelectorError(id, {
        index: lastChartUpdateAction.index,
        type: "measures"
      })
    case ActionTypes.ADD_DIMENSION:
      return setSelectorError(id, {
        index: lastChartUpdateAction.index,
        type: "dimensions"
      })
    case ActionTypes.UPDATE_CHART: {
      const { payload } = lastChartUpdateAction
      if (payload.sortColumn || payload.ordering) {
        return setChartHasError(id, "sort")
      } else {
        return null
      }
    }
    default:
      return null
  }
}

export default function chartEditorErrorHandlingMiddleware() {
  return ({ dispatch, getState }) => (next) => (action) => {
    const {
      app: { lastChartUpdateAction }
    } = getState()
    if (isErrorActionType(action.type)) {
      const setErrorAction = getSetErrorAction(action.id, lastChartUpdateAction)
      if (setErrorAction) {
        dispatch(setErrorAction)
      }
    }
    return next(action)
  }
}
