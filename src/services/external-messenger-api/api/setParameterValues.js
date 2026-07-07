// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

import { getStore } from "services/ImmerseCrossFilter/utils"

import { simpleSetParameterValue } from "components/parameters/actions/simple-action-wrappers"

export const setParameterValues = ({ payload = {} }) => {
  Object.entries(payload).forEach(([name, value]) => {
    getStore().dispatch(simpleSetParameterValue(name, value))
  })
  return {
    type: "setParameterValuesComplete"
  }
}

registerAPIMessages({ setParameterValues })

registerExposedAPISchema("setParameterValues", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "setParameterValues"
      },
      payload: {
        type: "object"
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
        const: "setParameterValuesComplete"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
