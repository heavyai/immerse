// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getQueryRuntime } from "services/query-runtime"

const chartViews = new WeakMap()
export function withChartQueryData(
  chart,
  chartId = chart?.id,
  runtime = getQueryRuntime()
) {
  if (!chart) {
    return chart
  }
  const data = runtime.readRender(chartId)
  if (data === undefined || data === chart.data) {
    return chart
  }
  const previous = chartViews.get(chart)
  if (previous?.data === data) {
    return previous
  }
  const view = { ...chart, data }
  chartViews.set(chart, view)
  return view
}
export function withQueryResultState(
  state,
  snapshot = getQueryRuntime().getRenderSnapshot()
) {
  const runtime = { readRender: (id) => snapshot[String(id)] }
  const charts = Object.fromEntries(
    Object.entries(state.charts || {}).map(([id, chart]) => [
      id,
      withChartQueryData(chart, id, runtime)
    ])
  )
  return { ...state, charts }
}
