// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { withChartQueryData } from "services/query-results"
import { getStore } from "services/legacy-application-context"

import {
  registerExposedAPISchema,
  registerAPIMessages
} from "../ExternalMessenger"

import { getQueryRuntime } from "services/query-runtime"

const chartTypeDispatch = {}

export function registerAPIChartDataFormatter(type, func) {
  chartTypeDispatch[type] = func
}

export const getChartData = ({ payload = {} }) => {
  const { chartId } = payload
  const state = getStore().getState()

  const chart = withChartQueryData(state.charts[chartId], chartId)
  const getData = chartTypeDispatch[chart?.type]

  const data =
    chart && getData
      ? getData(chart, getQueryRuntime().readChart(chartId))
      : getQueryRuntime().readChart(chartId)

  return {
    type: "chartDataResponse",
    payload: { data, chartId, type: chart?.type, filters: chart?.filters }
  }
}

registerAPIMessages({ getChartData })

registerExposedAPISchema("getChartData", {
  input: {
    type: "object",
    properties: {
      type: {
        const: "getChartData"
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
        const: "chartDataResponse"
      },
      responseKey: { type: ["integer", "string"] },
      payload: { type: "object" }
    }
  }
})
