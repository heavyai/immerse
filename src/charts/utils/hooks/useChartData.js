// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useChartDataQuery } from "./useChartDataQuery"
import { useQueryData } from "./useQueryData"

export const useChartData = (chartId, options = {}) => {
  const dataQuery = useChartDataQuery(chartId, options)

  return useQueryData(chartId, dataQuery, options)
}
