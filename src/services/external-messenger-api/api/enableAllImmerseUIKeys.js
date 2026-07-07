// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

import { getImmerseUIAction } from "services/immerse-ui-provider/ImmerseUIProvider"

export const enableAllImmerseUIKeys = () => {
  getImmerseUIAction("enableAllImmerseUIKeys")()
  return {
    type: "enableAllImmerseUIKeysComplete"
  }
}

registerAPIMessages({ enableAllImmerseUIKeys })

registerExposedAPISchema("enableAllImmerseUIKeys", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "enableAllImmerseUIKeys"
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
        const: "enableAllImmerseUIKeysComplete"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
