// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSelectedFilterSet } from "components/new-filters/filter-sets-selectors"
import { CHART_TYPES } from "constants/chart-types"

// Pass this the contents of `store.omnifilters`, or a filtered subset of
// `store.omnifilters`
const getFiltersByDataSource = (omnifilters) =>
  omnifilters.reduce((filtersBySource, filter) => {
    filter.dataSources
      .filter((dataSource) => dataSource !== null)
      .forEach((dataSource) => {
        if (filtersBySource[dataSource] === undefined) {
          filtersBySource[dataSource] = []
        }
        filtersBySource[dataSource].push(filter)
      })
    return filtersBySource
  }, {})

const getFiltersInCurrentFilterSet = (state) => {
  const selectedFilterSet = getSelectedFilterSet(state)
  const selectedFilters = selectedFilterSet ? selectedFilterSet.filters : []
  return state.omnifilters.filter(
    (omnifilter) =>
      selectedFilters.includes(omnifilter.name) ||
      selectedFilterSet === undefined
  )
}

/**
 * Get all data sources from charts
 * @param state
 * @param (optional) targetChartId Get data sources for a specific chart. If not
 * passed, returns data sources for all charts
 */
export function getActiveChartDataSources(state, targetChartId) {
  const charts = state.charts || {}
  return Object.keys(charts)
    .filter(
      (chartId) =>
        (state.charts[chartId].dataSource ||
          state.charts[chartId].multiSources ||
          state.charts[chartId].layers ||
          state.charts[chartId].dataSelections) &&
        (targetChartId === undefined || targetChartId === chartId)
    )
    .map((chartId) => {
      const chart = state.charts[chartId]
      const dataSources = []
      if (chart.dataSource) {
        dataSources.push(chart.dataSource)
      }
      if (chart.multiSources) {
        const multiSources = Object.keys(chart.multiSources).map(
          (multiSourceId) => chart.multiSources[multiSourceId].table
        )
        dataSources.push(multiSources)
      }
      if (chart.layers) {
        const layerSources = Object.values(chart.layers)
          .filter((layer) => typeof layer.dataSource === "string")
          .map((layer) => layer.dataSource)
        dataSources.push(layerSources)
      }
      if (
        [CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(chart.type) &&
        chart.dataSelections
      ) {
        const vegaSources = chart.dataSelections
          .filter((ds) => ds.table && ds.table.name)
          .map((ds) => ds.table.name)
        dataSources.push(vegaSources)
      }
      return dataSources
    })
    .flat(2)
    .filter((value, index, self) => value && self.indexOf(value) === index)
}

export function getActiveFilterDataSources(state, limitToCurrentFilterSet) {
  let filters = state.omnifilters || []
  if (limitToCurrentFilterSet) {
    filters = getFiltersInCurrentFilterSet(state)
  }
  const filtersByDataSource = getFiltersByDataSource(filters)
  return Object.keys(filtersByDataSource)
}

// Get just the data sources that are currently being used in filters or
// currently being used in charts. The second param, `limitToCurrentFilterSet` allows
// you to limit the results the current filter set. Certain things
// can add sources to `state.dashboard.dataSources` without that source actually
// being used, so we don't want those to show up
export function getActiveDataSources(state, limitToCurrentFilterSet = false) {
  const filterDataSources = getActiveFilterDataSources(
    state,
    limitToCurrentFilterSet
  )
  const chartDataSources = getActiveChartDataSources(state)

  const dataSources = [...filterDataSources, ...chartDataSources]
    .flat(2)
    .filter((value, index, self) => value && self.indexOf(value) === index)

  return dataSources
}

export const getFiltersInCurrentFilterSetByDataSource = (state) =>
  getFiltersByDataSource(getFiltersInCurrentFilterSet(state))
