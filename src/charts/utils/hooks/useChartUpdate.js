// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from "react"
import { useDispatch } from "react-redux"

import { updateChart } from "actions/update-chart-action-creator"

const defaultProcesor = (v) => v

export const useChartUpdate = (chartId, field, processor = defaultProcesor) => {
  const dispatch = useDispatch()
  return useCallback(
    (value) => dispatch(updateChart(chartId, { [field]: processor(value) })),
    [chartId, field, dispatch, processor]
  )
}

export const useChartUpdateFromEvent = (
  chartId,
  field,
  targetField = "value",
  processor = defaultProcesor
) => useChartUpdate(chartId, field, (e) => processor(e?.target?.[targetField]))
