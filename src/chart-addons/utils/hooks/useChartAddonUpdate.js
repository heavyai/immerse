// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from "react"
import { useDispatch } from "react-redux"
import { updateChartAddon } from "chart-addons/chart-addon-action-creators"

export const useChartAddonUpdate = (chartAddonId) => {
  const dispatch = useDispatch()

  return useCallback(
    (updates) => dispatch(updateChartAddon(chartAddonId, updates)),
    [chartAddonId, dispatch]
  )
}

const defaultProcessor = (v) => v

export const useChartAddonSingleUpdate = (
  chartAddonId,
  field,
  processor = defaultProcessor
) => {
  const update = useChartAddonUpdate(chartAddonId)

  return useCallback((newVal) => update({ [field]: processor(newVal) }), [
    update,
    field,
    processor
  ])
}
