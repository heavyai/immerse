// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createChartQueryRuntime } from "@immerse/query-runtime"
import { importableServices as Services } from "./immerse-importable"

export function getQueryRuntime(services = Services) {
  if (!services.has("queryRuntime")) {
    services.set("queryRuntime", createChartQueryRuntime())
  }
  return services.get("queryRuntime")
}

export function queryLifecycleMiddleware(runtime) {
  return () => (next) => (action) => {
    if (
      [
        "CLEAR_DASHBOARD",
        "RESET_APP_STATE",
        "LOAD_DASHBOARD_SUCCESS",
        "INITIALIZE_CHART_DATA",
        "DROP_CONNECTION",
        "CONNECTION_REQUEST",
        "CONNECTION_SUCCESS",
        "CONNECTION_ERROR"
      ].includes(action.type)
    ) {
      runtime.invalidate()
    } else if (["DELETE_CHART", "DELETE_CHART_DATA"].includes(action.type)) {
      runtime.invalidate({ chartId: action.chartId ?? action.payload?.chartId })
    }
    return next(action)
  }
}
