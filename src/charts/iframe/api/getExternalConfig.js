// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getStore } from "services/ImmerseCrossFilter/utils"

export const getExternalConfig = ({ payload = {} }) => {
  const { chartId } = payload

  const chart = getStore().getState().charts[chartId]

  let config = {}

  if (chart && chart.type === "iframe") {
    config = chart.externalConfig || {}
  }

  return {
    type: "getExternalConfigResponse",
    payload: { chartId, config }
  }
}

export const getExternalConfigSchema = {
  input: {
    type: "object",
    properties: {
      type: {
        const: "getExternalConfig"
      },
      payload: {
        type: "object",
        properties: {
          chartId: {
            type: "string",
            pattern: "[1-9][0-9]*"
          }
        },
        required: ["chartId"]
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
        const: "getExternalConfigResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
}
