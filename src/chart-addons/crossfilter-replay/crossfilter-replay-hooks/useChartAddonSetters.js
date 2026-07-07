// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useChartAddonSingleUpdate } from "chart-addons/utils/hooks"

const numeric = (val) => {
  const parsedVal = parseFloat(val)
  return isNaN(parsedVal) ? undefined : parsedVal
}

export const useChartAddonSetters = ({ chartAddonId }) => {
  const setDuration = useChartAddonSingleUpdate(
    chartAddonId,
    "duration",
    numeric
  )
  const setCurrentFrame = useChartAddonSingleUpdate(
    chartAddonId,
    "currentFrame",
    numeric
  )

  const setInternalFilter = useChartAddonSingleUpdate(
    chartAddonId,
    "crossfilter"
  )

  const setFrames = useChartAddonSingleUpdate(chartAddonId, "frames", numeric)

  const setFrameLength = useChartAddonSingleUpdate(
    chartAddonId,
    "frameLength",
    numeric
  )

  const setAdvanceBy = useChartAddonSingleUpdate(
    chartAddonId,
    "advanceBy",
    numeric
  )
  const setAdvanceByUnits = useChartAddonSingleUpdate(
    chartAddonId,
    "advanceByUnits"
  )

  return {
    setDuration,
    setCurrentFrame,
    setInternalFilter,
    setFrames,
    setFrameLength,
    setAdvanceBy,
    setAdvanceByUnits
  }
}
