// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

import { getImmerseUIAction } from "services/immerse-ui-provider/ImmerseUIProvider"

export const getImmerseUIKeys = () => {
  return {
    type: "immerseUIKeysResponse",
    payload: getImmerseUIAction("getImmerseUIKeys")()
  }
}

registerAPIMessages({ getImmerseUIKeys })

registerExposedAPISchema("getImmerseUIKeys", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "getImmerseUIKeys"
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
        const: "immerseUIKeysResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
