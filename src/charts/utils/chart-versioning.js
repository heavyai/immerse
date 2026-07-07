// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const CHART_VERSIONS = {}

const DEFAULT_VERSION = 1.0
const DEFAULT_UPGRADER = (chart) => chart

export function addChartVersion(
  type,
  version = DEFAULT_VERSION,
  upgrader = DEFAULT_UPGRADER
) {
  CHART_VERSIONS[type] = { version, upgrader }
}

export function getChartVersion(type) {
  // you'd think that we wouldn't need to return the default, but we have unit tests created w/charts w/o chart types
  return (
    CHART_VERSIONS[type] || {
      version: DEFAULT_VERSION,
      upgrader: DEFAULT_UPGRADER
    }
  )
}

export function upgradeChart(chart) {
  const { version, upgrader } = getChartVersion(chart.type)
  if (version !== chart.version) {
    return upgrader(chart)
  } else {
    return chart
  }
}

export function upgradeCharts(charts) {
  return Object.entries(charts).reduce((newCharts, [id, chart]) => {
    const upgradedChart = upgradeChart(chart)
    if (chart !== upgradedChart) {
      return { ...newCharts, [id]: upgradedChart }
    } else {
      return newCharts
    }
  }, charts)
}
