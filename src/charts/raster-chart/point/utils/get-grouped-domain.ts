// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Services from "../../../../services/immerse"
import { createQueuedConnector } from "../../../../services/ConnectorWithQueue"
import * as AppActions from "../../../../actions/app-action-creators"
import { updateChart } from "../../../../actions/update-chart-action-creator"

export function getGroupedDomain(dimensions, val, table, dashboardId, chartId) {
  const connector = Services.get("DbCon")
  const queuedConnector = createQueuedConnector({
    connector,
    dashboardId,
    chartId,
    tableName: table
  })

  const groupbys = dimensions.map((d) => d.value).join(", ")
  const domainQuery = `SELECT MIN(val) AS min_val, MAX(val) AS max_val from
  (SELECT ${groupbys}, ${val} AS val from ${table} GROUP BY ${groupbys});`
  return queuedConnector
    .queryAsync(domainQuery)
    .then(([{ min_val, max_val }]) => [min_val, max_val])
    .catch((e) => {
      // if data error is caught, set chart render error and stop chart creation process
      AppActions.setAppError("CHART_RENDER_ERROR", e)
      updateChart(chartId, { loading: false })
    })
}
