// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

import { getStore } from "services/ImmerseCrossFilter/utils"

import {
  getParameterDefinitions,
  makeGetParameterValue
} from "components/parameters/selectors"

export const getParameterValues = () => {
  const state = getStore().getState()

  const definitions = getParameterDefinitions(state)
  const getParameterValue = makeGetParameterValue(state)

  const values = Object.keys(definitions).reduce((bucket, def) => {
    bucket[def] = getParameterValue(def)
    return bucket
  }, {})

  return {
    type: "parameterValuesResponse",
    payload: values
  }
}

registerAPIMessages({ getParameterValues })

registerExposedAPISchema("getParameterValues", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "getParameterValues"
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
