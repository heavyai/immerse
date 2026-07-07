// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DestroyedChartError } from "@heavyai/charting/src/core/errors"

import * as ActionTypes from "constants/action-types"
import { setAppError } from "actions/app-action-creators"

const errorActionTypes = {
  [ActionTypes.CHART_RENDER_ERROR]: true,
  [ActionTypes.CHART_REDRAW_ERROR]: true
}

export default function appErrorMiddleware() {
  return ({ dispatch }) => (next) => (action) => {
    if (action.error && action.error instanceof DestroyedChartError) {
      // eslint-disable-next-line no-console
      console.warn(action.error)
      /**
       * DestroyedChartErrors are thrown when cancelling the callback on a
       * destroyed chart. This can happen normally when navigating away from
       * the chart, so there should be no reason to show a modal or set an error
       * on the chart.
       */
      return
    }

    if (errorActionTypes[action.type]) {
      dispatch(setAppError(action.type, action.error))
    }

    // eslint-disable-next-line consistent-return
    return next(action)
  }
}
