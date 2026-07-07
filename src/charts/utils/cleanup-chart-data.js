// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const CHART_CLEANUP_DATA = {}

export function addCleanupChartData(type, cleanupData) {
  CHART_CLEANUP_DATA[type] = cleanupData
}

export function getCleanupChartData(type) {
  return CHART_CLEANUP_DATA[type] || []
}

export function cleanupChartData(type, chart) {
  const cleanupData = getCleanupChartData(type)

  return cleanupData.reduce((newChart, cleanupKey) => {
    if (cleanupKey in newChart) {
      const copy = { ...newChart }
      delete copy[cleanupKey]
      return copy
    } else {
      return chart
    }
  }, chart)
}
