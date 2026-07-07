// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { useChart, useChartData, useChartDataQuery } from "charts/utils/hooks"

import "./chart.scss"

const ChartTemplate = ({ id }) => {
  const chart = useChart(id)
  const data = useChartData(id, { forceAggregate: true })
  const dataQuery = useChartDataQuery(id, { forceAggregate: true })

  return (
    <div
      className="chart-template"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div>Chart Template {chart.settingsValue}</div>
      <div className="logs">
        {JSON.stringify({ dataQuery, chart, data }, null, 4)}
      </div>
    </div>
  )
}

export default ChartTemplate
