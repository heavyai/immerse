// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

import { getFilters } from "./getFilters"
import { filterHandlers } from "../utils"
let filterNotifications = []

let shouldSendFilterNotifications = true

export function enableFilterNotifications() {
  shouldSendFilterNotifications = true
}
export function disableFilterNotifications() {
  shouldSendFilterNotifications = false
}

export const postFilterNotification = async () => {
  if (!shouldSendFilterNotifications) {
    return
  }
  for (const { responseHandler } of filterNotifications) {
    const filters = getFilters()
    responseHandler(filters)
  }
}

export const registerForFilterNotifications = (data, responseHandler) => {
  const responseKey = data?.responseKey
  const handler = { responseKey, responseHandler }

  filterNotifications = filterHandlers(filterNotifications, handler)

  filterNotifications.push(handler)

  return {
    type: "filters",
    payload: getFilters().payload
  }
}

export const unregisterForFilterNotifications = (data, responseHandler) => {
  const responseKey = data?.responseKey
  const handler = { responseKey, responseHandler }
  filterNotifications = filterHandlers(filterNotifications, handler)

  return {
    type: "unregisterForFilterNotificationsResponse"
  }
}

registerAPIMessages({
  registerForFilterNotifications,
  unregisterForFilterNotifications
})

registerExposedAPISchema("registerForFilterNotifications", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "registerForFilterNotifications"
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
        const: "filters"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})

registerExposedAPISchema("unregisterForFilterNotifications", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "unregisterForFilterNotifications"
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
        const: "unregisterForFilterNotificationsResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
