// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

import { getStore } from "services/ImmerseCrossFilter/utils"
import {
  enableFilterNotifications,
  disableFilterNotifications
} from "./registerForFilterNotifications"
import { setChartFilters } from "actions/charts-filter-action-creators"

export const setCrossFilter = async ({ payload = {} }) => {
  const { chartId, filters = [] } = payload
  disableFilterNotifications()

  await getStore().dispatch(setChartFilters(chartId, filters))

  enableFilterNotifications()
  return {
    type: "crossFilterResponse",
    payload: { chartId, filters }
  }
}

registerAPIMessages({ setCrossFilter })

registerExposedAPISchema("setCrossFilter", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "setCrossFilter"
      },
      payload: {
        type: "object",
        properties: {
          chartId: { type: "string" },
          filters: { type: "object" }
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
        const: "crossFilterResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: {
        type: "object",
        properties: {
          chartId: { type: "string" },
          filters: { type: "object" }
        }
      }
    }
  }
})
