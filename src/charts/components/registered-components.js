// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const chartTypes = {}

export function addChartComponent(chartType, component) {
  chartTypes[chartType] = component
}

export function selectChartComponent(type) {
  return chartTypes[type] || null
}
