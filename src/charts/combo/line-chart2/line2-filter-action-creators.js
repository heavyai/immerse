// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateChart } from "actions/update-chart-action-creator"

export function setComboChartFilterExtent(chartId, extent) {
  return (dispatch) => dispatch(updateChart(chartId, { filters: [extent] }))
}

export function clearComboChartFilterExtent(chartId) {
  return (dispatch) => {
    dispatch(updateChart(chartId, { filters: [] }))
  }
}
