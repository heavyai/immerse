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
import {
  setDashboardFilter as setDashboardFilterAction,
  clearFilterByName as clearFilterByNameAction
} from "vega/actions/filter-action-creators"

export const setDashboardFilter = async ({ payload = {} }) => {
  const { name, filter } = payload
  disableFilterNotifications()
  if (filter) {
    await getStore().dispatch(setDashboardFilterAction(filter, name))
  } else {
    await getStore().dispatch(clearFilterByNameAction(name))
  }
  enableFilterNotifications()
  return {
    type: "dashboardFilterResponse",
    payload: getStore()
      .getState()
      .omnifilters.filter(
        (f) => f.appliesTo === "GLOBAL" || f.appliesTo === "CROSSFILTER"
      )
      .map((f) => f.filter)
  }
}

registerAPIMessages({ setDashboardFilter })

registerExposedAPISchema("setDashboardFilter", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "setDashboardFilter"
      },
      payload: {
        type: "object",
        properties: {
          name: { type: "string" },
          filter: { type: "object" }
        },
        required: ["name"]
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
        const: "dashboardFilterResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
