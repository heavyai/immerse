// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getTablesForFilter } from "vega/utils/filter"
import { isOrdinal } from "constants/data-types"
import { isMultiLayer } from "charts/raster-chart/raster-utils"
import { chartSupportsChartSpecificFilters } from "charts/utils/chart-type"

import { FILTER_TYPE_SIMPLE } from "vega/constants/filter-type-constants"
import { getTablesForDataSource } from "components/join-manager/utils"
import { CHART_TYPES } from "constants/chart-types"

export const isQuickFilterSupported = (filter, dataSources) => {
  const isOrdinalEqualsFilter =
    filter &&
    filter.filterType === FILTER_TYPE_SIMPLE &&
    filter.operator === "=" &&
    isOrdinal(filter.dataType)

  if (isOrdinalEqualsFilter && dataSources) {
    const columnMetadata =
      dataSources[filter.dataSource] &&
      dataSources[filter.dataSource].columnMetadata.find(
        (col) => col.value === filter.dataExpression
      )

    return columnMetadata && columnMetadata.is_dict && !columnMetadata.is_array
  }

  return isOrdinalEqualsFilter
}

export const getDataSourcesForChart = ({
  dataSelections,
  type,
  dataSource,
  layers = [],
  multiSources
}) => {
  const dataSourcesForChart = new Set()
  if ([CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(type)) {
    dataSelections.forEach((ds) => {
      if (ds.table) {
        dataSourcesForChart.add(ds.table.name)
      }
    })
  } else if (isMultiLayer(type)) {
    // Old charts with layers
    layers.forEach((layer) => {
      if (layer.dataSource) {
        dataSourcesForChart.add(layer.dataSource)
      }
    })
  } else if (type === "line2" && multiSources) {
    Object.keys(multiSources).forEach((key) =>
      dataSourcesForChart.add(multiSources[key].table)
    )
  } else {
    // Single layer charts
    dataSourcesForChart.add(dataSource)
  }

  return dataSourcesForChart
}

export const getTablesForChart = ({
  dataSelections,
  type,
  dataSource,
  layers = [],
  multiSources
}) => {
  const tablesForChart = new Set()
  if ([CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(type)) {
    dataSelections.forEach((ds) => {
      if (ds.table) {
        const dataSelectionDataSource = ds.table.name
        const tablesForLayer = getTablesForDataSource(dataSelectionDataSource)
        tablesForChart.add(...tablesForLayer)
      }
    })
  } else if (isMultiLayer(type)) {
    // Old charts with layers
    layers.forEach((layer) => {
      if (layer.dataSource) {
        const tablesForLayer = getTablesForDataSource(layer.dataSource)
        tablesForChart.add(...tablesForLayer)
      }
    })
  } else if (type === "line2" && multiSources) {
    Object.keys(multiSources).forEach((key) => {
      const tablesForLayer = getTablesForDataSource(multiSources[key].table)
      tablesForChart.add(...tablesForLayer)
    })
  } else {
    // Single layer charts
    const tablesForLayer = getTablesForDataSource(dataSource)
    tablesForChart.add(...tablesForLayer)
  }

  return tablesForChart
}

const filterHasTablesInChart = (filter, chart) => {
  const tablesForFilter = getTablesForFilter(filter.filter)
  const tablesForChart = getTablesForChart(chart)

  return Array.from(tablesForFilter).every((filterTable) =>
    tablesForChart.has(filterTable)
  )
}

export const isQuickFilterVisibleOnDashboard = (filter) =>
  filter.quickFilter && filter.quickFilter.visible

const isQuickFilterForChart = (filter, charts, chartId, dataSources) =>
  filter.appliesTo === "CHART" &&
  !filter.isBinnedFilter &&
  filter.chartId &&
  filter.chartId === chartId &&
  chartSupportsChartSpecificFilters(charts[chartId]) &&
  isQuickFilterSupported(filter.filter, dataSources) &&
  filterHasTablesInChart(filter, charts[chartId])

export const getQuickFiltersForChart = (
  omnifilters,
  charts,
  chartId,
  dataSources
) =>
  omnifilters.filter((filter) =>
    isQuickFilterForChart(filter, charts, chartId, dataSources)
  )

export const valueIsVisibleOnDashboard = (value, currentFilter) =>
  currentFilter.quickFilter?.optionValues[value] || value === "All"
