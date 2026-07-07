// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getStore } from "services/ImmerseCrossFilter/utils"

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

import { getChartData } from "./getChartData"
import { filterHandlers } from "../utils"
let ChartDataNotifications = []

let shouldSendChartDataNotifications = true

export function enableChartDataNotifications() {
  shouldSendChartDataNotifications = true
}
export function disableChartDataNotifications() {
  shouldSendChartDataNotifications = false
}

export const postChartDataNotification = async (chartId) => {
  if (!shouldSendChartDataNotifications || !chartId.match(/^\d+$/)) {
    return
  }
  for (const {
    chartId: responseHandlerChartId,
    responseHandler
  } of ChartDataNotifications) {
    if (
      responseHandlerChartId === undefined ||
      responseHandlerChartId === chartId
    ) {
      const chartData = getChartData({ payload: { chartId } })
      responseHandler(chartData)
    }
  }
}

const chartDataFilter = (existing, filteredValue) =>
  existing.chartId !== filteredValue.chartId ||
  existing.responseKey !== filteredValue.responseKey

export const registerForChartDataNotifications = (data, responseHandler) => {
  const registeredChartId = data?.payload?.chartId
  const responseKey = data?.responseKey
  const handler = { chartId: registeredChartId, responseKey, responseHandler }

  ChartDataNotifications = filterHandlers(
    ChartDataNotifications,
    responseHandler,
    chartDataFilter
  )

  ChartDataNotifications.push(handler)

  const state = getStore().getState()
  const allChartData = Object.keys(state.charts)
    .filter(
      (chartId) =>
        chartId.match(/^\d+$/) &&
        (registeredChartId === undefined || registeredChartId === chartId)
    )
    .reduce(
      (bucket, chartId) => ({
        ...bucket,
        [chartId]: getChartData({ payload: { chartId } })
      }),
      {}
    )

  return {
    type: "registerForChartDataNotificationsResponse",
    payload: allChartData
  }
}

export const unregisterForChartDataNotifications = (data, responseHandler) => {
  const chartId = data?.payload?.chartId
  const responseKey = data?.responseKey

  ChartDataNotifications = filterHandlers(
    ChartDataNotifications,
    { chartId, responseKey, responseHandler },
    chartDataFilter
  )

  return {
    type: "unregisterForChartDataNotificationsResponse"
  }
}

registerAPIMessages({
  registerForChartDataNotifications,
  unregisterForChartDataNotifications
})

registerExposedAPISchema("registerForChartDataNotifications", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "registerForChartDataNotifications"
      },
      responseKey: { type: ["integer", "string"] }
    },
    required: ["type"],
    additionalProperties: false
  },
  output: {
    type: "object",
    properties: {
      type: {
        const: "registerForChartDataNotificationsResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})

registerExposedAPISchema("unregisterForChartDataNotifications", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "unregisterForChartDataNotifications"
      },
      responseKey: { type: ["integer", "string"] }
    },
    required: ["type"],
    additionalProperties: false
  },
  output: {
    type: "object",
    properties: {
      type: {
        const: "unregisterForChartDataNotificationsResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
