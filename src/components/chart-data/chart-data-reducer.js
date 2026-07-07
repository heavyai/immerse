// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  INITIALIZE_CHART_DATA,
  SAVE_CHART_DATA,
  DELETE_CHART_DATA
} from "./constants"

const INITIAL = {}

const reducer = (state = INITIAL, action) => {
  switch (action.type) {
    case INITIALIZE_CHART_DATA:
      return INITIAL
    case SAVE_CHART_DATA: {
      const { chartId, token, data } = action.payload
      const existingChartData = state[chartId] || {}
      return {
        ...state,
        [chartId]: {
          ...existingChartData,
          [token]: data
        }
      }
    }
    case DELETE_CHART_DATA: {
      const { chartId } = action.payload
      const newState = { ...state }
      delete newState[chartId]
      return newState
    }
    default:
      return state
  }
}

export default reducer
