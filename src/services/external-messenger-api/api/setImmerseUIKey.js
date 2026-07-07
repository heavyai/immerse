// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

import { getImmerseUIAction } from "services/immerse-ui-provider/ImmerseUIProvider"

export const setImmerseUIKey = ({ payload = {} }) => {
  const { uiKey, value } = payload
  getImmerseUIAction("setImmerseUIKey")(uiKey, value)
  return {
    type: "setImmerseUIKeyComplete"
  }
}

registerAPIMessages({ setImmerseUIKey })

registerExposedAPISchema("setImmerseUIKey", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "setImmerseUIKey"
      },
      payload: {
        type: "object",
        properties: {
          uiKey: { type: "string" },
          value: { type: "string" }
        },
        required: ["uiKey", "value"]
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
        const: "setImmerseUIKeyComplete"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
