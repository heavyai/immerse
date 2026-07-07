// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  RESET_APP_ERROR,
  SAVE_LAST_CHART_ACTION,
  SET_APP_ERROR,
  SET_USER_AGENT
} from "constants/action-types"

import {
  getErrorHeadingFromErrorType,
  getErrorMessageFromBackendError
} from "utils/error-handling-helpers"
import createReducer from "utils/redux/create-reducer"

export const initialState = {
  error: false,
  lastChartUpdateAction: null,
  isFirefox: false
}

const reducers = {
  [SET_APP_ERROR]: (state, { errorType, error }) =>
    Object.assign({}, state, {
      error: {
        heading: getErrorHeadingFromErrorType(errorType),
        message: getErrorMessageFromBackendError(error)
      }
    }),

  [RESET_APP_ERROR]: (state) =>
    Object.assign({}, state, {
      error: false
    }),

  [SAVE_LAST_CHART_ACTION]: (state, { action }) =>
    Object.assign({}, state, {
      lastChartUpdateAction: action
    }),

  [SET_USER_AGENT]: (state, { isFirefox }) =>
    Object.assign({}, state, { isFirefox })
}

export default createReducer(reducers, initialState)
