// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// returns the exposed API that details which messages you can post/what you'll receive.

import {
  exposedAPISchema,
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

const getExposedAPI = () => {
  return {
    type: "exposedAPI",
    payload: exposedAPISchema
  }
}

registerAPIMessages({ getExposedAPI })

registerExposedAPISchema("getExposedAPI", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "getExposedAPI"
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
        const: "exposedAPI"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
