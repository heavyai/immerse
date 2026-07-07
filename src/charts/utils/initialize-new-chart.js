// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getChartVersion } from "./chart-versioning"
const CHART_INITIAL_DATA = {}

export function addInitialChartData(type, initialChartData) {
  CHART_INITIAL_DATA[type] = {
    ...initialChartData,
    type
  }
}

export function getInitialChartData(type) {
  return CHART_INITIAL_DATA[type] || { type }
}

export function addInitialDataToChart(type, chart) {
  const initialChartData = getInitialChartData(type)

  const newChart = Object.entries(initialChartData).reduce(
    (bucket, [key, value]) => {
      if (bucket[key] === undefined) {
        return { ...bucket, [key]: value }
      } else {
        return bucket
      }
    },
    chart
  )

  // last thing. all charts are gonna have a version, so we need to explicitly update to our
  // current version, if needed.
  const { version } = getChartVersion(type)
  if (newChart.version !== version) {
    return { ...newChart, version }
  } else {
    return newChart
  }
}
