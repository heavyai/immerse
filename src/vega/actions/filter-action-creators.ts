// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO:
// This file is a proxy to the action creators in
// filter-action-creators-actual.ts. These proxies ultimately dispatch the
// actual action creators, which results in filters getting set in the redux
// state. But, before they do that, they also pass these filters off to
// old crossfilter so that the new charts can crossfilter with old charts.
//
// Therefore, any code that needs to disptach crossfilter actions should import
// *this* file. In the future, when we remove old crossfilter, all of the
// content in filter-action-creators-actual.ts should replace this file.
// In this way, the rest of the code will not need to be updated since it's
// already importing the action creators from here.
import pushid from "pushid"

import * as actual from "./filter-action-creators-actual"
import { redrawAll, redrawChart } from "actions/dc-action-creators"
import { Filter } from "vega/constants/filter-types"
import {
  CohortDimension,
  FilterMetadata,
  OldFilterMetadata,
  isOldFilter
} from "vega/constants/filter-metadata-types"
import { getTablesForFilter } from "vega/utils/filter"
import { postFilterNotification } from "services/external-messenger-api/api/registerForFilterNotifications"
import { CrossLink } from "constants/crosslink-types"
import { importableServices as Services } from "services/immerse-importable"

type CFCrossFilter = {
  toggleFilter(index: number, enabled?: boolean): void
  toggleGlobalFilter(index: number, enabled?: boolean): void
  filter(global: boolean): CFFilter
}

type DbCon = {}

type CFManager = {
  getCrossfilter(key: string): CFCrossFilter
  getCrossfilterById(id: number): CFCrossFilter | null
  setCrossfilter(key: string, cf: CFCrossFilter): void
}

type ServiceTypes = {
  CrossFilter: { crossfilter(con: DbCon, ds: string[]): CFCrossFilter }
  DbCon: DbCon
  crossfilter: CFManager
}

type Services = {
  get<TService extends keyof ServiceTypes>(
    serviceName: TService
  ): ServiceTypes[TService]
}

type CFFilter = {
  getCrossfilterId(): number
  getFilterIndex(): number
  filterAll(): CFFilter
  filter(sql: string): CFFilter
  getTables(): string[]
  toggleFilter(disabled?: boolean): void
}

/**
 * Calls redrawAll unless the initial render has not yet finished
 * @param dispatch The redux dispatch
 * @param getState A function to get the redux state
 * @param dataSources A set of data sources that should be redrawn
 * @param options.onlyLinked If true, only redraw data sources linked to the
 *   provided data sources.
 * @param options.skipLinked If true, skip redrawing linked data sources
 */
export async function doRedrawAll(
  dispatch: Function,
  getState: Function,
  tables: Set<string>,
  options: { onlyLinked?: boolean; skipLinked?: boolean } = {}
): void {
  const {
    dc: { initialRender },
    charts,
    crossLinks,
    dashboard: { selectedTabId },
    parameters: { crossfilterTokens } = { crossfilterTokens: null }
  } = getState()
  if (initialRender.done) {
    const groups =
      options.onlyLinked && !options.skipLinked
        ? new Set<string | undefined>()
        : new Set<string | undefined>(tables)

    if (!options.skipLinked) {
      crossLinks.forEach(({ sourceA, sourceB, enabled }: CrossLink) => {
        if (enabled) {
          if (tables.has(sourceA)) {
            groups.add(sourceB)
          } else if (tables.has(sourceB)) {
            groups.add(sourceA)
          }
        }
      })
    }

    // Seems data sources are used as "groups" in heavyai-charting, but there's also an
    // "undefined" group that some things end up in, so include that, too
    if (!options.onlyLinked) {
      groups.add(undefined)
    }

    const redrawPromises = [dispatch(redrawAll([...groups]))]

    if (crossfilterTokens?.[selectedTabId]) {
      let allgroups = groups
      if (options.onlyLinked) {
        // if onlyLinked was set, groups won't contain dataSources, but we need
        // them here
        allgroups = new Set([...groups, ...tables])
      }

      const refreshedCharts = new Set()
      crossfilterTokens[selectedTabId].forEach((r) => {
        if (allgroups.has(r.table) && !refreshedCharts.has(r.chartId)) {
          if (charts[r.chartId] && charts[r.chartId].dcFlag) {
            const dcChart = Services.get("dc").getChart(
              charts[r.chartId].dcFlag
            )
            // chartGroups can be a string (single) or an array of strings (multiple)
            const chartGroups = dcChart?.chartGroup?.() ?? []
            const groupsMatch = Array.isArray(chartGroups)
              ? chartGroups.some((group: string) => groups.has(group))
              : groups.has(chartGroups)
            if (dcChart && groupsMatch) {
              redrawPromises.push(dispatch(redrawChart(dcChart, r.chartId)))
            }
          }
          refreshedCharts.add(r.chartId)
        }
      })
    }

    await Promise.allSettled(redrawPromises)
  }
}

/**
 * Remove all crossfilters, chart-level filters, and dashboard filters associated
 * with a chart.
 * @param chartId The id of the chart to clear filters for
 */
export function clearAllChartFilters(chartId: string) {
  return async (dispatch, getState) => {
    const tables = getState()
      .omnifilters.filter((f) => f.chartId === chartId)
      .reduce((ds, f) => {
        return new Set([
          ...ds,
          ...getTablesForFilter(f, { useDataSource: true })
        ])
      }, new Set())

    // remove filters
    dispatch(actual.clearAllChartFilters(chartId))

    // trigger a @heavyai/charting redraw
    doRedrawAll(dispatch, getState, tables)
  }
}

/**
 * Remove all filters.
 */
export const clearAllFilters = actual.clearAllFilters

/**
 * Remove a filter by name.
 * @param name The name of the filter to remove
 */
export function clearFilterByName(name: string) {
  return async (dispatch, getState) => {
    const tables = getState()
      .omnifilters.filter((f) => f.name === name)
      .reduce((ds, f) => {
        return new Set([
          ...ds,
          ...getTablesForFilter(f, { useDataSource: true })
        ])
      }, new Set())

    // remove filter from redux
    dispatch(actual.clearFilterByName(name))

    // trigger a @heavyai/charting redraw
    doRedrawAll(dispatch, getState, tables)

    // and finally, if we have any external listeners, notify them.
    postFilterNotification()
  }
}

/**
 * Remove chart-level filters on a chart
 * @param chartId The ID of the chart
 * @param layerId (optional) The ID of the chart's layer/source. If unset,
 *   remove all chart-level filters for the chart
 */
export const clearChartFilters = actual.clearChartFilters

/**
 * Remove crossfilters on a chart
 * @param chartId The ID of the chartId,
 * @param layerId (optional) The ID of the chart's layer/source. If unset,
 *   remove all crossfilters for the chart.
 */
export function clearCrossFilters(chartId: string, layerId?: string) {
  return async (dispatch, getState) => {
    const tables = getState()
      .omnifilters.filter(
        (f: FilterMetadata) =>
          !isOldFilter(f) &&
          f.appliesTo === "CROSSFILTER" &&
          f.chartId === chartId &&
          f.layerId === layerId
      )
      .reduce((ds, f) => {
        return new Set([
          ...ds,
          ...getTablesForFilter(f, { useDataSource: true })
        ])
      }, new Set())

    // remove the filters from the new redux state
    dispatch(actual.clearCrossFilters(chartId, layerId))

    // trigger a @heavyai/charting redraw
    doRedrawAll(dispatch, getState, tables)

    // and finally, if we have any external listeners, notify them.
    postFilterNotification()
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
  return async (dispatch, getState) => {
    const tables = getState()
      .omnifilters.filter(
        chartId
          ? (f: FilterMetadata) =>
              !isOldFilter(f) &&
              f.appliesTo === "GLOBAL" &&
              f.chartId === chartId &&
              f.layerId === layerId
          : (f: FilterMetadata) => !isOldFilter(f) && f.appliesTo === "GLOBAL"
      )
      .reduce((ds, f) => {
        return new Set([
          ...ds,
          ...getTablesForFilter(f, { useDataSource: true })
        ])
      }, new Set())

    // remove the filters from the new redux state
    dispatch(actual.clearDashboardFilters(chartId, layerId))

    // trigger a @heavyai/charting redraw
    doRedrawAll(dispatch, getState, tables)

    // and finally, if we have any external listeners, notify them.
    postFilterNotification()
  }
}

/**
 * Duplicate a filter so we have a new copy of it.
 * @param name The name of the filter to duplicate
 * @param newName (optional) The name of the new filter
 */
export const duplicateOmnifilter = actual.duplicateOmnifilter

/**
 * Add or update a chart-level filter on a chart
 * @param filter The filter
 * @param chartId The ID of the chart that has created this filter
 * @param layerId (optional) The ID of the chart's layer
 * @param name (optional) The name of the filter - name must be
 *   unique. If a filter exists with the same name, it'll be overwritten.
 *   If unspecified, a name will be randomly generated.
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
  return async (dispatch, getState) => {
    if (!name) {
      name = pushid()
    }
    // add the filter to the new redux state
    dispatch(
      actual.setChartFilter(
        filter,
        chartId,
        layerId,
        name,
        enable,
        sharedCustom,
        globalCustom
      )
    )
    const tables = getTablesForFilter(filter, { useDataSource: true })

    // trigger a @heavyai/charting redraw
    doRedrawAll(dispatch, getState, tables)
  }
}

/**
 * Add or update a chart level cohort filter on a chart, works similar as chart filter
 * @param dimension the cohort dimension
 * @param filter The filter
 * @param chartId The ID of the chart that has created this filter
 * @param layerId (optional) The ID of the chart's layer
 * @param name (optional) The name of the filter - name must be
 *   unique. If a filter exists with the same name, it'll be overwritten.
 *   If unspecified, a name will be randomly generated.
 */

export function setChartCohort(
  dimension: CohortDimension,
  filter: Filter,
  chartId: string,
  layerId?: string,
  name?: string
) {
  return async (dispatch, getState) => {
    if (!name) {
      name = pushid()
    }
    // add the filter to the new redux state
    dispatch(actual.setChartCohort(dimension, filter, chartId, layerId, name))

    const tables = getTablesForFilter(filter, { useDataSource: true })

    // trigger a @heavyai/charting redraw
    doRedrawAll(dispatch, getState, tables)
  }
}

/**
 * Add or update a crossfilter
 * @param filter The filter to the end
 * @param chartId The ID of the chart that has created the crossfilter
 * @param layerId (optional) The ID of the chart's layer
 * @param name (optional) The name of the filter - name must be
 *   unique. If a filter exists with the same name, it'll be overwritten.
 *   If unspecified, a name will be randomly generated.
 */
export function setCrossFilter(
  filter: Filter,
  chartId: string,
  layerId?: string,
  name?: string
) {
  return async (dispatch, getState) => {
    if (!name) {
      name = pushid()
    }
    // add the filter to the new redux state
    dispatch(actual.setCrossFilter(filter, chartId, layerId, name))

    const tables = getTablesForFilter(filter, { useDataSource: true })

    // trigger a @heavyai/charting redraw
    doRedrawAll(dispatch, getState, tables)

    // and finally, if we have any external listeners, notify them.
    postFilterNotification()
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
 *   unique. If a filter exists with the same name, it'll be overwritten.
 *   If unspecified, a name will be randomly generated.
 */
export function setDashboardCohort(
  dimension: CohortDimension,
  filter: Filter,
  name?: string
) {
  return async (dispatch, getState) => {
    if (!name) {
      name = pushid()
    }

    // add the filter to the new redux state
    dispatch(actual.setDashboardCohort(dimension, filter, name))

    const tables = getTablesForFilter(filter, { useDataSource: true })

    // trigger a @heavyai/charting redraw
    doRedrawAll(dispatch, getState, tables)
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
 * @param enabled (optional) Should filter be applied and copied to crossfilter.
 *   Assume enabled unless false is explicitly passed.
 */
export function setDashboardFilter(
  filter: Filter,
  name?: string,
  chartId?: string,
  layerId?: string,
  enabled?: boolean,
  sharedCustom = false,
  globalCustom = false
) {
  return async (dispatch, getState) => {
    if (!name) {
      name = pushid()
    }

    if (enabled === undefined) {
      const currentFilterMetaData = getState().omnifilters.find(
        (f) => f.name === name
      ) || { enabled: true }
      enabled = currentFilterMetaData.enabled
    }

    // add the filter to the new redux state
    dispatch(
      actual.setDashboardFilter(
        filter,
        name,
        chartId,
        layerId,
        enabled,
        sharedCustom,
        globalCustom
      )
    )

    const tables = getTablesForFilter(filter, { useDataSource: true })

    // redraw
    doRedrawAll(dispatch, getState, tables)

    // and finally, if we have any external listeners, notify them.
    postFilterNotification()
  }
}

/**
 * Toggle a filter by name
 * @param name The name of the filter to toggle
 * @param enabled (optional) Explicitly set if the filter should be enabled or
 *   not. If this argument is unset, the value will be toggled.
 */
export function toggleFilterByName(name: string, enabled?: boolean) {
  return async (dispatch, getState) => {
    // toggle in the new redux state
    dispatch(actual.toggleFilterByName(name, enabled))

    const tables = getState()
      .omnifilters.filter((f) => f.name === name)
      .reduce((ds, f) => {
        return new Set([
          ...ds,
          ...getTablesForFilter(f, { useDataSource: true })
        ])
      }, new Set())

    // trigger a @heavyai/charting redraw
    doRedrawAll(dispatch, getState, tables)
  }
}

/**
 * Toggle a chart-level filter on or off
 * @param chartId The ID of the chart
 * @param layerId (optional) The ID of the chart's layer.
 * @param enabled (optional) Explicitly set if the filter should be enabled or
 *   not. If this argument is unset, the value will be toggled.
 */
export const toggleChartFilters = actual.toggleChartFilters

/**
 * Toggle a filter's simple mode by name
 * @param name The name of the filter to toggle
 * @param enabled (optional) Explicitly set if the filter should display in
 *   Simple Filters mode. If this argument is unset, the value will be toggled.
 */
export const toggleFilterSimpleModeByName = actual.toggleFilterSimpleModeByName

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
  return async (dispatch, getState) => {
    // toggle the filters in the new redux state
    dispatch(actual.toggleCrossfilters(chartId, layerId, enabled))

    const tables = getState()
      .omnifilters.filter(
        (f: FilterMetadata) =>
          !isOldFilter(f) &&
          f.appliesTo === "CROSSFILTER" &&
          f.chartId === chartId &&
          f.layerId === layerId
      )
      .reduce((ds, f) => {
        return new Set([
          ...ds,
          ...getTablesForFilter(f, { useDataSource: true })
        ])
      }, new Set())

    // trigger a @heavyai/charting redraw
    doRedrawAll(dispatch, getState, tables)
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
  return async (dispatch, getState) => {
    // toggle the filters in the new redux state
    dispatch(actual.toggleDashboardFilters(enabled, chartId, layerId))

    const tables = getState()
      .omnifilters.filter(
        chartId
          ? (f: FilterMetadata) =>
              !isOldFilter(f) &&
              f.appliesTo === "GLOBAL" &&
              f.chartId === chartId &&
              f.layerId === layerId
          : (f: FilterMetadata) => !isOldFilter(f) && f.appliesTo === "GLOBAL"
      )
      .map((f: Filter) =>
        Array.from(getTablesForFilter(f, { useDataSource: true }))
      )
      .flat()

    // trigger a @heavyai/charting redraw
    doRedrawAll(dispatch, getState, new Set(tables))
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
  return async (dispatch, getState) => {
    // update the filter in the new redux state
    dispatch(actual.updateFilterByName(name, filter))

    doRedrawAll(
      dispatch,
      getState,
      getTablesForFilter(filter, { useDataSource: true })
    )
  }
}

/**
 * Toggle an old filter (ie, a filter that has been copied from
 * old crossfilter into the new redux state).
 * @param name The name of the filter to toggle
 */
export function toggleOldFilter(name: string, enabled?: boolean) {
  return (_, getState, services: Services) => {
    const { omnifilters } = getState()
    const filter = (omnifilters as FilterMetadata[]).find(
      (f) => isOldFilter(f) && f.name === name
    ) as OldFilterMetadata | undefined
    if (filter) {
      const cfManager = services.get("crossfilter")
      const cf = cfManager.getCrossfilterById(filter.crossfilterId)
      if (cf) {
        if (filter.appliesTo === "GLOBAL") {
          cf.toggleGlobalFilter(filter.index, enabled)
        } else {
          cf.toggleFilter(filter.index, enabled)
        }
      }
    }
  }
}

export const toggleQuickFilterVisibility = actual.toggleQuickFilterVisibility

export const setQuickFilterOption = actual.setQuickFilterOption

/**
 * Resets chart-level filters to their original state when cancelling out of
 * chart editor
 * @param chartId Id for chart that is being edited
 */
export const cancelChartFilterChanges = actual.cancelChartFilterChanges
