// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO:
// NOTE: this file should only be imported from one place:
// filter-action-creators.ts. If your code needs to dispatch filter
// actions, import *that* file... do *not* import this file!
//
// Once we remove old crossfilter, the contents from this file should be moved
// into filter-action-creators.ts and this file removed. In this way, no
// code will need to be updated.

import { batch } from "react-redux"
import _ from "lodash"

import {
  CLEAR_ALL_CHART_FILTERS,
  CLEAR_ALL_FILTERS,
  CLEAR_BY_NAME,
  CLEAR_CHART_FILTERS,
  DUPLICATE_OMNIFILTER,
  SET_CHART_COHORT,
  SET_CHART_FILTER,
  SET_CROSSFILTER,
  SET_DASHBOARD_COHORT,
  SET_DASHBOARD_FILTER,
  TOGGLE_BY_NAME,
  TOGGLE_SIMPLE_MODE_BY_NAME,
  TOGGLE_CHART_FILTERS,
  TOGGLE_CROSSFILTERS,
  TOGGLE_DASHBOARD_FILTERS,
  TOGGLE_QUICK_FILTER_VISIBILITY,
  UPDATE_FILTER_BY_NAME,
  SET_QUICK_FILTER_OPTION,
  CANCEL_CHART_FILTER_CHANGES,
  UPDATE_FILTER_LAYER_ID_BY_NAME
} from "vega/constants/filter-action-types"
import { Filter } from "vega/constants/filter-types"
import {
  CohortDimension,
  FilterMetadata,
  isOldFilter
} from "vega/constants/filter-metadata-types"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"

/**
 * Remove all crossfilters, chart-level filters, and dashboard filters associated
 * with a chart.
 * @param chartId The id of the chart to clear filters for
 */
export function clearAllChartFilters(chartId: string) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: CLEAR_ALL_CHART_FILTERS,
        chartId
      })
    })
  }
}

/**
 * Remove all filters.
 */
export function clearAllFilters() {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: CLEAR_ALL_FILTERS
      })
    })
  }
}

/**
 * Remove a filter by name.
 * @param name The name of the filter to remove
 * @param chartId (optional) The id of the chart this filter belongs to, if
 *   any. If you don't supply this argument, the function will attempt to
 *   determine it.
 */
export function clearFilterByName(name: string, chartId?: string) {
  return (dispatch, getState) => {
    if (!chartId) {
      const { omnifilters } = getState()
      const filter = omnifilters.find((f) => f.name === name)
      chartId = filter?.chartId
    }
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: CLEAR_BY_NAME,
        name,
        chartId
      })
    })
  }
}

/**
 * Remove chart-level filters on a chart
 * @param chartId The ID of the chart
 * @param layerId (optional) The ID of the chart's layer/source. If unset,
 *   remove all chart-level filters for the chart
 */
export function clearChartFilters(chartId: string, layerId?: string) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: CLEAR_CHART_FILTERS,
        chartId,
        layerId
      })
    })
  }
}

/**
 * Remove crossfilters on a chart
 * @param chartId The ID of the chartId,
 * @param layerId (optional) The ID of the chart's layer/source. If unset,
 *   remove all crossfilters for the chart.
 */
export function clearCrossFilters(chartId: string, layerId?: string) {
  return (dispatch, getState) => {
    const { omnifilters, filterZones } = getState()
    const activeFilterZone = Object.values(filterZones).find(
      (zone) => zone.selected
    )
    const filterNames = activeFilterZone?.filters
    const clearedFilterNames = omnifilters
      .filter(
        (f) =>
          !isOldFilter(f) &&
          f.appliesTo === "CROSSFILTER" &&
          f.chartId === chartId &&
          f.layerId === layerId &&
          (!filterNames || filterNames.includes(f.name))
      )
      .map((f) => f.name)
    batch(() => {
      dispatch(updateDashboardSaveState())
      clearedFilterNames.forEach((name) =>
        dispatch(clearFilterByName(name, chartId))
      )
    })
  }
}

/**
 * Remove dashboard filters. All arguments are optional: only dashboard filters
 * matching the arguments you've passed in will be removed. If you don't pass
 * any arguments, all dashboard filters are removed.
 * @param chartId (optional) The chart to remove dashboard filters from.
 * @param layerId (optional) The layer of the chart to remove dashboard filters
 */
export function clearDashboardFilters(chartId?: string, layerId?: string) {
  return (dispatch, getState) => {
    const { omnifilters, filterZones } = getState()
    const activeFilterZone = Object.values(filterZones).find(
      (zone) => zone.selected
    )
    const filterNames = activeFilterZone?.filters
    const clearedFilterNames = omnifilters
      .filter(
        (f) =>
          !isOldFilter(f) &&
          f.appliesTo === "GLOBAL" &&
          f.chartId === chartId &&
          f.layerId === layerId &&
          (!filterNames || filterNames.includes(f.name))
      )
      .map((f) => f.name)
    batch(() => {
      dispatch(updateDashboardSaveState())
      clearedFilterNames.forEach((name) =>
        dispatch(clearFilterByName(name, chartId))
      )
    })
  }
}

/**
 * Duplicate a filter so we have a new copy of it.
 * @param name The name of the filter to duplicate
 * @param newName (optional) The name of the new filter
 */
export function duplicateOmnifilter(
  oldFilter: FilterMetadata,
  newName?: string
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState(true))
      dispatch({
        type: DUPLICATE_OMNIFILTER,
        oldFilter,
        newName
      })
    })
  }
}

/**
 * Add or update a chart-level filter on a chart
 * @param filter The filter
 * @param chartId The ID of the chart that has created this filter
 * @param layerId (optional) The ID of the chart's layer
 * @param name (optional) The name of the filter - name must be
 *   unique on this dashboard. If a filter exists with the same name,
 *   it'll be overwritten. If unspecified, a name will be randomly generated.
 * @param enable (optional) boolean - enable the filter or not
 */
export function setChartFilter(
  filter: Filter,
  chartId: string,
  layerId?: string,
  name?: string,
  enable?: boolean,
  sharedCustom = false,
  globalCustom = false
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: SET_CHART_FILTER,
        chartId,
        layerId,
        name,
        filter,
        enable,
        sharedCustom,
        globalCustom
      })
    })
  }
}

/**
 * Add or update a chart level cohort filter on a chart, works similar as chart filter
 * @param dimension the cohort dimension
 * @param filter The filter
 * @param chartId The ID of the chart that has created this filter
 * @param layerId (optional) The ID of the chart's layer
 * @param name (optional) The name of the filter - name must be
 *   unique on this dashboard. If a filter exists with the same name, it'll be overwritten.
 *   If unspecified, a name will be randomly generated.
 */
export function setChartCohort(
  dimension: CohortDimension,
  filter: Filter,
  chartId: string,
  layerId?: string,
  name?: string
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: SET_CHART_COHORT,
        chartId,
        layerId,
        dimension,
        name,
        filter
      })
    })
  }
}

/**
 * Add or update a crossfilter
 * @param filter The filter to the end
 * @param chartId The ID of the chart that has created the crossfilter
 * @param layerId (optional) The ID of the chart's layer
 * @param name (optional) The name of the filter - name must be
 *   unique on this dashboard. If a filter exists with the same name, it'll be overwritten.
 *   If unspecified, a name will be randomly generated.
 */
export function setCrossFilter(
  filter: Filter,
  chartId: string,
  layerId?: string,
  name?: string
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: SET_CROSSFILTER,
        chartId,
        layerId,
        name,
        filter
      })
    })
  }
}

/**
 * Add or update a dashboard cohort filter.
 * @param dimension The dimension that the cohort applies to
 *   This should be an object with { name : string, negated : boolean }
 *   if negated === true, it will generate a "NOT IN" cohort.
 *   I've royally overloaded this "cohortDimension" parameter and it needs to be
 *   refactored. It now also contains cohortId (which is a string pointing to the
 *   cohort that originated the filter AND cohortName, which is a string containing
 *   the name of the cohort that built it). This has skewed -way- beyond the original
 *   simple dimension string to be used as a general cohort data bucket.
 *   it needs refactoring.
 * @param filter The filter - all filters must be on a single datasource
 * @param name (optional) The name of the filter - name must be
 *   unique on this dashboard. If a filter exists with the same name, it'll be overwritten.
 *   If unspecified, a name will be randomly generated.
 */
export function setDashboardCohort(
  dimension: CohortDimension,
  filter: Filter,
  name?: string
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: SET_DASHBOARD_COHORT,
        name,
        dimension,
        filter
      })
    })
  }
}

/**
 * Add or update a dashboard filter
 * @param filter The filter
 * @param name (optional) The name of the cohort/filter - the name is "unique":
 *   only a single dashboard filter with the given name may exist. If you set a
 *   new filter with the same name, it overwrites the old filter. If you create
 *   a filter without a name, one will be generated randomly.
 * @param chartId (optional) If the dashboard filter "came from" a chart, you may
 *   optionally set this. The "name" is then unique amongst the filters for the
 *   specified chart rather than all dashboard filters.
 * @param layerId (optional) The ID of the chart's layer. The name is unique
 *   amongst chartId + layerId.
 */
export function setDashboardFilter(
  filter: Filter,
  name?: string,
  chartId?: string,
  layerId?: string,
  enable?: boolean,
  sharedCustom = false,
  globalCustom = false
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: SET_DASHBOARD_FILTER,
        chartId,
        layerId,
        name,
        filter,
        enable,
        sharedCustom,
        globalCustom
      })
    })
  }
}

/**
 * Toggle a filter by name
 * @param name The name of the filter to toggle
 * @param enabled (optional) Explicitly set if the filter should be enabled or
 *   not. If this argument is unset, the value will be toggled.
 */
export function toggleFilterByName(name: string, enabled?: boolean) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: TOGGLE_BY_NAME,
        name,
        enabled
      })
    })
  }
}

/**
 * Toggle a filter's simple mode by name
 * @param name The name of the filter to toggle
 * @param enabled (optional) Explicitly set if the filter should display in
 *   Simple Filters mode. If this argument is unset, the value will be toggled.
 */
export function toggleFilterSimpleModeByName(
  name: string,
  simpleModeEnabled?: boolean
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: TOGGLE_SIMPLE_MODE_BY_NAME,
        name,
        simpleModeEnabled
      })
    })
  }
}

/**
 * Toggle a chart-level filter on or off
 * @param chartId The ID of the chart
 * @param layerId (optional) The ID of the chart's layer.
 * @param enabled (optional) Explicitly set if the filter should be enabled or
 *   not. If this argument is unset, the value will be toggled.
 */
export function toggleChartFilters(
  chartId: string,
  layerId?: string,
  enabled?: boolean
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: TOGGLE_CHART_FILTERS,
        chartId,
        layerId,
        enabled
      })
    })
  }
}

/**
 * Toggle a crossfilter on or off
 * @param chartId The ID of the chart that set the crossfilter
 * @param layerId (optional) The ID of the chart's layer.
 * @param enabled (optional) Explicitly set if the filter should be enabled or
 *   not. If this argument is unset, the value will be toggled.
 */
export function toggleCrossfilters(
  chartId: string,
  layerId?: string,
  enabled?: boolean
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: TOGGLE_CROSSFILTERS,
        chartId,
        layerId,
        enabled
      })
    })
  }
}

/**
 * Toggle dashboard filters. If a chartId is specified, only dashboard filters for
 * that chart (and layer, if also specified) are toggled.
 * @param enabled (optional) Explicitly set if the filter should be enabled or
 *   not. If this argument is unset, the value will be toggled.
 * @param chartId (optional) The ID of the chart
 * @param layerId (optional) The ID of the chart's layer
 */
export function toggleDashboardFilters(
  enabled?: boolean,
  chartId?: string,
  layerId?: string
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: TOGGLE_DASHBOARD_FILTERS,
        chartId,
        layerId,
        enabled
      })
    })
  }
}

/**
 * Update an existing filter by name. It doesn't matter what type (dashboard,
 * cross, etc) of filter it is: the type will remain unchanged. Additionally
 * properties (such as chart ID) will also remain unchanged.
 * @param name The name of the filter to update
 * @param filter The new filter value
 */
export function updateFilterByName(name: string, filter: Filter) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: UPDATE_FILTER_BY_NAME,
        name,
        filter
      })
    })
  }
}

export function updateFilterLayerIdByName(name: string, layerId: string) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: UPDATE_FILTER_LAYER_ID_BY_NAME,
        name,
        layerId
      })
    })
  }
}

export function toggleQuickFilterVisibility(
  name: string,
  quickFilter?: boolean
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: TOGGLE_QUICK_FILTER_VISIBILITY,
        name,
        quickFilter
      })
    })
  }
}

export function setQuickFilterOption(
  name: string,
  value: boolean,
  visible?: boolean
) {
  return (dispatch) => {
    batch(() => {
      dispatch(updateDashboardSaveState())
      dispatch({
        type: SET_QUICK_FILTER_OPTION,
        name,
        value,
        visible
      })
    })
  }
}

/**
 * Resets chart-level filters to their original state when cancelling out of
 * chart editor
 * @param chartId
 * @param savedChartFilters Filters to revert to
 */
export const cancelChartFilterChanges = (
  chartId: string,
  savedChartFilters: FilterMetadata[]
) => (dispatch, getState) => {
  // Note any filters being wiped so we can clear them from filter sets as well
  const clearedFilterNames = _.difference(
    getState()
      .omnifilters.filter(
        (f: FilterMetadata) =>
          f.appliesTo === "CROSSFILTER" && f.chartId === chartId
      )
      .map((f: FilterMetadata) => f.name),
    savedChartFilters.map((f) => f.name)
  )

  batch(() => {
    dispatch(updateDashboardSaveState())
    dispatch({
      type: CANCEL_CHART_FILTER_CHANGES,
      chartId,
      savedChartFilters,
      clearedFilterNames
    })
  })
}
