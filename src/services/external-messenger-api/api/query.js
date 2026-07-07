// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Services from "services/immerse"

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

export const query = async ({ payload: q }) => {
  let results = undefined
  let error = undefined
  try {
    results = await Services.get("DbCon").queryAsync(q)
  } catch (e) {
    error = e
  }

  return {
    type: "queryResponse",
    payload: { results, error }
  }
}

registerAPIMessages({ query })

registerExposedAPISchema("query", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "query"
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
        const: "queryResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
