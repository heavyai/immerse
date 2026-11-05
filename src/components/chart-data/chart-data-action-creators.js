// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getQueryRuntime } from "services/query-runtime"
import { postChartDataNotification } from "services/external-messenger-api/api/registerForChartDataNotifications"

import { INITIALIZE_CHART_DATA, DELETE_CHART_DATA } from "./constants"

export const initializeChartData = () => ({ type: INITIALIZE_CHART_DATA })

export const saveChartData = ({ chartId, token, data, ticket }) => {
  return async (_, getState, services) => {
    const runtime = getQueryRuntime(services)
    const changed = ticket
      ? runtime.commit(ticket, token, data)
      : runtime.write(chartId, token, data)
    if (changed) {
      postChartDataNotification(String(chartId))
    }
  }
}

export const deleteChartData = (chartId) => ({
  type: DELETE_CHART_DATA,
  payload: { chartId }
})
