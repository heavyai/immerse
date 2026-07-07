// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

export let immerseIsLoaded = false

export function setImmerseIsLoaded(newIsLoaded) {
  immerseIsLoaded = newIsLoaded
}

export const isImmerseLoaded = () => {
  return {
    type: "immerseLoaded",
    payload: { immerseLoaded: true }
  }
}

registerAPIMessages({ isImmerseLoaded })

registerExposedAPISchema("isImmerseLoaded", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "isImmerseLoaded"
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
        const: "immerseLoaded"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
