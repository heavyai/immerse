// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getStore } from "services/ImmerseCrossFilter/utils"
import { filterHandlers } from "services/external-messenger-api/utils"

import { getExternalConfig } from "./getExternalConfig"
let ExternalConfigNotifications = []

let shouldSendExternalConfigNotifications = true

export function enableExternalConfigNotifications() {
  shouldSendExternalConfigNotifications = true
}
export function disableExternalConfigNotifications() {
  shouldSendExternalConfigNotifications = false
}

export const postExternalConfigNotification = async (chartId) => {
  if (!shouldSendExternalConfigNotifications) {
    return
  }
  for (const {
    chartId: responseHandlerChartId,
    responseHandler
  } of ExternalConfigNotifications) {
    const chart = getStore().getState().charts[chartId]

    if (responseHandlerChartId === chartId && chart?.type === "iframe") {
      const externalConfig = getExternalConfig({ payload: { chartId } })
      responseHandler(externalConfig)
    }
  }
}

const externalConfigFilter = (existing, filteredValue) =>
  existing.chartId !== filteredValue.chartId ||
  existing.responseKey !== filteredValue.responseKey

export const registerForExternalConfigNotifications = (
  data,
  responseHandler
) => {
  const chartId = data?.payload?.chartId
  const responseKey = data?.responseKey
  const handler = { chartId, responseKey, responseHandler }

  ExternalConfigNotifications = filterHandlers(
    ExternalConfigNotifications,
    handler,
    externalConfigFilter
  )

  ExternalConfigNotifications.push(handler)
  const config = getExternalConfig({ payload: { chartId } })?.payload?.config

  return {
    type: "registerForExternalConfigNotificationsResponse",
    payload: { chartId, config }
  }
}

export const unregisterForExternalConfigNotifications = (
  data,
  responseHandler
) => {
  const chartId = data?.payload?.chartId
  const responseKey = data?.responseKey

  ExternalConfigNotifications = filterHandlers(
    ExternalConfigNotifications,
    { chartId, responseKey, responseHandler },
    externalConfigFilter
  )

  return {
    type: "unregisterForExternalConfigNotificationsResponse"
  }
}

export const registerForExternalConfigNotificationsSchema = {
  input: {
    type: "object",
    properties: {
      type: {
        const: "registerForExternalConfigNotifications"
      },
      payload: {
        type: "object",
        properties: {
          chartId: {
            type: "string",
            pattern: "[1-9][0-9]*"
          }
        },
        required: ["chartId"]
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
        const: "registerForExternalConfigNotificationsResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
}

export const unregisterForExternalConfigNotificationsSchema = {
  input: {
    type: "object",
    properties: {
      type: {
        const: "unregisterForExternalConfigNotifications"
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
        const: "unregisterForExternalConfigNotificationsResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
}
