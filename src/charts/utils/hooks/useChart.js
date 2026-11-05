// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react"
import { useVegaChartData } from "./useCachedChartData"
import { useSelector } from "react-redux"

export const useChart = (chartId) => {
  const chart = useSelector((state) => state.charts[chartId])
  const data = useVegaChartData(chartId)
  return useMemo(
    () => (data === undefined || !chart ? chart : { ...chart, data }),
    [chart, data]
  )
}
