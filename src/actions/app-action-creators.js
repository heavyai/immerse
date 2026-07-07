// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  RESET_APP_ERROR,
  SAVE_LAST_CHART_ACTION,
  SET_APP_ERROR,
  SET_USER_AGENT
} from "constants/action-types"

const NON_INDEX = -1

export function setAppError(errorType, error) {
  return {
    type: SET_APP_ERROR,
    error,
    errorType
  }
}

export function resetAppError() {
  return {
    type: RESET_APP_ERROR
  }
}

export function saveLastChartAction(action) {
  return {
    type: SAVE_LAST_CHART_ACTION,
    action
  }
}

export function setUserAgent(userAgentString) {
  return {
    type: SET_USER_AGENT,
    isFirefox: userAgentString.toLowerCase().indexOf("firefox") > NON_INDEX
  }
}
