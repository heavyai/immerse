// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getStore } from "services/ImmerseCrossFilter/utils"
import { updateChart } from "actions/update-chart-action-creator"
import { getExternalConfig } from "./getExternalConfig"
import { postExternalConfigNotification } from "./registerForExternalConfigNotifications"

export const setExternalConfig = async ({ payload = {} }) => {
  const { chartId, config = {} } = payload

  const chart = getStore().getState().charts[chartId]

  let response = { message: "Could not set external config" }

  if (chart && chart.type === "iframe") {
    const oldConfig = chart.externalConfig || {}
    await getStore().dispatch(
      updateChart(chartId, { externalConfig: { ...oldConfig, ...config } })
    )

    response = getExternalConfig({ payload: { chartId } })?.payload?.config
    postExternalConfigNotification(chartId)
  }

  return {
    type: "setExternalConfigResponse",
    payload: { chartId, config: response, excess: "HELLO", response }
  }
}

export const setExternalConfigSchema = {
  input: {
    type: "object",
    properties: {
      type: {
        const: "setExternalConfigSchema"
      },
      payload: {
        type: "object",
        properties: {
          chartId: {
            type: "string",
            pattern: "[1-9][0-9]*"
          },
          config: { type: "object" }
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
        const: "setExternalConfigResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
}
