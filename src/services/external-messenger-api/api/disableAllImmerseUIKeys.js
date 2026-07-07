// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

import { getImmerseUIAction } from "services/immerse-ui-provider/ImmerseUIProvider"

export const disableAllImmerseUIKeys = () => {
  getImmerseUIAction("disableAllImmerseUIKeys")()
  return {
    type: "disableAllImmerseUIKeysComplete"
  }
}

registerAPIMessages({ disableAllImmerseUIKeys })

registerExposedAPISchema("disableAllImmerseUIKeys", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "disableAllImmerseUIKeys"
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
        const: "disableAllImmerseUIKeysComplete"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
