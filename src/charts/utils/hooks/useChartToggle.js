// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from "react"
import { useDispatch } from "react-redux"

import { useChart } from "./useChart"

import { updateChart } from "actions/update-chart-action-creator"

export const useChartToggle = (chartId, field) => {
  const dispatch = useDispatch()
  const chart = useChart(chartId)
  return useCallback(() => {
    const currentValue = chart[field]
    return dispatch(updateChart(chartId, { [field]: !currentValue }))
  }, [chartId, chart, field, dispatch])
}
