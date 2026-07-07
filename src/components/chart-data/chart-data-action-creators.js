// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { postChartDataNotification } from "services/external-messenger-api/api/registerForChartDataNotifications"

import {
  INITIALIZE_CHART_DATA,
  SAVE_CHART_DATA,
  DELETE_CHART_DATA
} from "./constants"

export const initializeChartData = () => ({ type: INITIALIZE_CHART_DATA })

export const saveChartData = ({ chartId, token, data }) => {
  return async (dispatch, getState) => {
    const existingData = getState().chartData?.[chartId]?.[token]
    if (existingData !== data) {
      await dispatch({
        type: SAVE_CHART_DATA,
        payload: { chartId, token, data }
      })
      postChartDataNotification(chartId)
    }
  }
}

export const deleteChartData = (chartId) => ({
  type: DELETE_CHART_DATA,
  payload: { chartId }
})
