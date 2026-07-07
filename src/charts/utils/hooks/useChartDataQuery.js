// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { buildQuery } from "charts/iframe/queryBuilder"

import { useChart } from "./useChart"
import { useChartFilterString } from "./useChartFilterString"

export const useChartDataQuery = (chartId, options = {}) => {
  const chart = useChart(chartId)
  const filterString = useChartFilterString({ chartId })

  const { dimensions, measures, dataSource } = chart
  const { limit, orderBy } = options

  const querySpec = {
    chartId,
    dimensions,
    measures,
    dataSource,
    limit,
    orderBy,
    filterString,
    ...options
  }

  return buildQuery(querySpec)
}
