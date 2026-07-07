// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useChart } from "./useChart"
import {
  getChartFiltersInternal,
  getDashboardFiltersInternal
} from "services/ImmerseCrossFilter/utils"
import { useStaticValue } from "hooks"

export const useAllFilters = () => {
  return useSelector((state) => state.omnifilters)
}

export const useEnabledFilters = () => {
  const allFilters = useAllFilters()
  return allFilters.filter((fm) => fm.enabled)
}

// PLEASE NOTE - this hook is -very- noisy and prone to re-firing even when the data hasn't changed.
// This is because of Reasons. I'll fix it when I figure out how to do it reasonably.
//
// For now, you probably want to use useChartFilterString, since that is stable and won't give you
// an update unless the generated filter string changes, which is less common.
//
// ALSO NOTE - this hook will return the filters that will APPLY to the chart. Not the filters
// that ORIGINATE with the chart. It also does NOT include global filters. crossfilters/chart level only.
export const useChartFilters = ({
  chartId,
  table: givenTable,
  layerId
} = {}) => {
  const chart = useChart(chartId)
  const omnifilters = useAllFilters()
  const [chartFilters, setChartFilters] = useState([])

  // this only works for charts using the legacy charting selector, so no vega-combo.
  // This whole thing is going to be moved into `useLegacyChartFilters` or something as we
  // refined chart creation even further.
  const table = givenTable ?? chart.dataSource

  useEffect(() => {
    const newChartFilters = getChartFiltersInternal({
      chartId,
      // ideally, we shouldn't need to pass in table at all, and the chart should be able to properly
      // tell us the table to use. As is, we attempt to guess if not provided.
      tables: [table],
      layerId, // fast candidate for refactoring, I want to get rid of layerId in future multi-source charts
      chart,
      omnifilters
    })

    setChartFilters(newChartFilters)
  }, [chart, chartId, table, layerId, omnifilters])

  return chartFilters
}

export const useDashboardFilters = ({
  table,
  excludeFilters: givenExcludeFilters = []
} = {}) => {
  const omnifilters = useAllFilters()
  const [dashboardFilters, setDashboardFilters] = useState([])
  const excludeFilters = useStaticValue(givenExcludeFilters)

  useEffect(() => {
    const newDashboardFilters = getDashboardFiltersInternal({
      tables: [table],
      excludeFilters,
      omnifilters
    })

    setDashboardFilters(newDashboardFilters)
  }, [table, excludeFilters, omnifilters])

  return dashboardFilters
}
