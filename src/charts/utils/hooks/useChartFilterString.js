// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useChart } from "./useChart"
import { useAllFilters } from "./useFilters"
import { useCrossLinks } from "./useCrossLinks"
import { buildFilterStringInternal } from "services/ImmerseCrossFilter/build-filter-string"
import { boundingBoxEnabledFilterStringInternal } from "services/ImmerseCrossFilter/ImmerseCrossFilterBoundingBox"
import { getTablesForDataSource } from "components/join-manager/utils"

export const useChartFilterString = ({
  chartId,
  layerId,
  table: givenTable,
  excludeFilters
} = {}) => {
  const chart = useChart(chartId)
  const omnifilters = useAllFilters()
  const crossLinks = useCrossLinks()

  const dataSource = chart?.dataSource
  const tables = givenTable ? [givenTable] : getTablesForDataSource(dataSource)

  const newFilterString = buildFilterStringInternal(chartId, {
    chart,
    omnifilters,
    tables,
    dataSource,
    layerId,
    crossLinks,
    excludeFilters
  })

  // technically this can also accept a `layerName` if we're not giving it a layerId
  // Seriously. Don't use these hooks with existing multi-layer charts.
  // Not only is it likely to be error prone, but it'll hurt the whole time it's generating errors.
  return boundingBoxEnabledFilterStringInternal({
    newFilterString,
    chartId,
    table: dataSource,
    layerId,
    chart
  })
}
