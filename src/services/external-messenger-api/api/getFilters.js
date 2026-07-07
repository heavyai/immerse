// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getStore } from "services/ImmerseCrossFilter/utils"

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

export const getFilters = () => {
  return {
    type: "filters",
    payload: getStore()
      .getState()
      .omnifilters.filter(
        (f) => f.appliesTo === "GLOBAL" || f.appliesTo === "CROSSFILTER"
      )
      .map((f) => f.filter)
  }
}

registerAPIMessages({ getFilters })

registerExposedAPISchema("getFilters", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "getFilters"
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
        const: "filters"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
