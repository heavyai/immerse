// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

import { getParameterValues } from "./getParameterValues"
import { filterHandlers } from "../utils"
let parameterNotifications = []

let shouldSendParameterNotifications = true

export function enableParameterNotifications() {
  shouldSendParameterNotifications = true
}
export function disableParameterNotifications() {
  shouldSendParameterNotifications = false
}

export const postParameterNotification = async () => {
  if (!shouldSendParameterNotifications) {
    return
  }
  for (const { responseHandler } of parameterNotifications) {
    const parameters = getParameterValues()
    responseHandler(parameters)
  }
}

export const registerForParameterNotifications = (data, responseHandler) => {
  const responseKey = data?.responseKey
  const handler = { responseKey, responseHandler }
  parameterNotifications = filterHandlers(parameterNotifications, handler)

  parameterNotifications.push(handler)

  return {
    type: "parameterValuesResponse",
    payload: getParameterValues().payload
  }
}

export const unregisterForParameterNotifications = (data, responseHandler) => {
  const responseKey = data?.responseKey
  const handler = { responseKey, responseHandler }

  parameterNotifications = filterHandlers(parameterNotifications, handler)

  return {
    type: "unregisterForParameterNotificationsResponse"
  }
}

registerAPIMessages({
  registerForParameterNotifications,
  unregisterForParameterNotifications
})

registerExposedAPISchema("registerForParameterNotifications", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "registerForParameterNotifications"
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
        const: "parameterValuesResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})

registerExposedAPISchema("unregisterForParameterNotifications", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "unregisterForParameterNotifications"
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
        const: "unregisterForParameterNotificationsResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
