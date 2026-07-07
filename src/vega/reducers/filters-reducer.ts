// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"

import createReducer from "utils/redux/create-reducer"
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
  UPDATE_FILTER_BY_NAME,
  TOGGLE_QUICK_FILTER_VISIBILITY,
  SET_QUICK_FILTER_OPTION,
  CANCEL_CHART_FILTER_CHANGES,
  UPDATE_FILTER_LAYER_ID_BY_NAME
} from "vega/constants/filter-action-types"

import {
  APPLY_CHART_EDITS,
  CLEAR_CHART_FILTERS as CLEAR_CHART_FILTERS_OLD,
  DELETE_FILTER_CROSSFILTER,
  SET_FILTER_CROSSFILTER,
  TOGGLE_FILTER_CROSSFILTER
} from "constants/action-types"

import { Filter } from "vega/constants/filter-types"
import {
  CohortDimension,
  FilterMetadata,
  isOldFilter,
  buildDashboardCohortFilterMetadata,
  buildDashboardFilterMetadata,
  buildCrossFilterMetadata,
  buildChartFilterMetadata,
  buildChartCohortFilterMetadata,
  QuickFilter
} from "vega/constants/filter-metadata-types"

import { isQuickFilterSupported } from "components/quick-filters/quick-filter-utils"

import { getDataSourcesForFilter, getTablesForFilter } from "vega/utils/filter"
import { chartSupportsChartSpecificFilters } from "../../charts/utils/chart-type"

export const initialState: FilterMetadata[] = []

type ByNamePayload = {
  name: string
}

type ToggleByNamePayload = ByNamePayload & {
  enabled?: boolean
}

type ToggleSimpleModeByNamePayload = ByNamePayload & {
  simpleModeEnabled?: boolean
}

type DashboardMetaPayload = {
  chartId?: string
  layerId?: string
  enabled?: boolean
  sharedCustom?: boolean
  globalCustom?: boolean
}

type SetDashboardMetaPayload = DashboardMetaPayload & {
  filter: Filter
  name?: string
  enable?: string
}

type ChartMetaPayload = {
  chartId: string
  layerId?: string
}

type SetChartMetaPayload = ChartMetaPayload & {
  filter: Filter
  name?: string
  enable?: boolean
  sharedCustom?: boolean
  globalCustom?: boolean
}

type ToggleChartMetaPayload = ChartMetaPayload & {
  enabled?: boolean
}

type SetChartMetaCohortPayload = SetChartMetaPayload & {
  dimension: CohortDimension
}

type SetDashboardCohortPayload = SetDashboardMetaPayload & {
  dimension: CohortDimension
}

type DuplicatePayload = {
  oldFilter: FilterMetadata
  newName?: string
}

type UpdateFilterPayload = {
  name: string
  filter: Filter
}

/**
 * When using one of the "set" actions (such as setDashboardFilter), any existing
 * filter with the given name will be overwritten. When this happens, we want
 * our new filter to retain the enabled/disabled state, simple mode setting,
 * and, in some cases, quick filter visibility of the old filter.
 *
 * This function takes the current state and a name that is used to determine
 * what filter to remove, but it also keeps track of what the original value of
 * "enabled" and "simpleModeEnabled" was for the removed filter.
 *
 * If a value for forcedEnabledState is passed in, it will override the original
 * "enabled" value.
 */
function filterStateAndDetermineEnabled(
  state: FilterMetadata[],
  name: string,
  forcedEnabledState?: boolean,
  filter?: Filter
): [FilterMetadata[], boolean, boolean, QuickFilter | {}] {
  let enabled = true
  let quickFilter = filter ? getQuickFilterState(filter) : {}
  let simpleModeEnabled = false
  const filters = state.filter((f) => {
    if (f.name === name) {
      enabled = f.enabled
      simpleModeEnabled = f.simpleModeEnabled
      quickFilter = filter ? getQuickFilterState(filter, f) : {}
      return false
    }
    return true
  })

  enabled = forcedEnabledState !== undefined ? forcedEnabledState : enabled
  return [filters, enabled, simpleModeEnabled, quickFilter]
}

/**
 * Returns the QuickFilter state of a filter, transferring properties from
 * existing filter if applicable.
 */
function getQuickFilterState(
  filter: Filter,
  oldFilterMetadata?: FilterMetadata
): QuickFilter {
  // Not quick filter compatible? Let's bail.
  if (!isQuickFilterSupported(filter)) {
    return {
      visible: false,
      optionValues: {}
    }
  }

  // Make sure the current value for the filter is visible as a dropdown value.
  const optionValuesFromNewFilter =
    filter.value === null
      ? {}
      : {
          [filter.value]: true
        }

  // If this is a new filter, or it's being edited from an incompatible filter
  // type, it should default to visible.
  if (!oldFilterMetadata || !isQuickFilterSupported(oldFilterMetadata.filter)) {
    return {
      visible: true,
      optionValues: optionValuesFromNewFilter
    }
  }

  // Otherwise, we might want to transfer some things:
  let visible = true
  let optionValuesFromOldFilter = {}

  if (oldFilterMetadata.quickFilter) {
    // If the existing filter was explicitly toggled hidden, retain that state.
    visible = oldFilterMetadata.quickFilter.visible !== false

    // Transfer existing quick filter option values if column is unchanged
    if (
      filter.dataSource === oldFilterMetadata.filter.dataSource &&
      filter.dataExpression === oldFilterMetadata.filter.dataExpression
    ) {
      optionValuesFromOldFilter = oldFilterMetadata.quickFilter.optionValues
    }
  }

  return {
    visible,
    optionValues: {
      ...optionValuesFromNewFilter,
      ...optionValuesFromOldFilter
    }
  }
}

const crossfilterReducers = {
  [CLEAR_ALL_CHART_FILTERS](
    state: FilterMetadata[],
    { chartId }: ChartMetaPayload
  ): FilterMetadata[] {
    return state.filter((f) => f.chartId !== chartId)
  },

  [CLEAR_ALL_FILTERS](): FilterMetadata[] {
    return []
  },

  [CLEAR_BY_NAME](
    state: FilterMetadata[],
    { name }: ByNamePayload
  ): FilterMetadata[] {
    return state.filter((f) => f.name !== name)
  },

  [CLEAR_CHART_FILTERS](
    state: FilterMetadata[],
    { chartId, layerId }: ChartMetaPayload
  ): FilterMetadata[] {
    return state.filter(
      (f) =>
        isOldFilter(f) ||
        f.appliesTo !== "CHART" ||
        f.chartId !== chartId ||
        f.layerId !== layerId
    )
  },

  [DUPLICATE_OMNIFILTER](
    state: FilterMetadata[],
    { oldFilter, newName }: DuplicatePayload
  ): FilterMetadata[] {
    if (oldFilter) {
      return [...state, { ...oldFilter, name: newName }]
    }
    return state
  },

  [SET_CROSSFILTER](
    state: FilterMetadata[],
    { chartId, layerId, name, filter }: SetChartMetaPayload
  ): FilterMetadata[] {
    if (!name) {
      name = pushid()
    }
    const [filters, enabled] = filterStateAndDetermineEnabled(state, name)
    const newFilter = buildCrossFilterMetadata(
      name,
      filter,
      enabled,
      chartId,
      layerId
    )
    return [...filters, newFilter]
  },

  [SET_CHART_COHORT](
    state: FilterMetadata[],
    { chartId, layerId, dimension, name, filter }: SetChartMetaCohortPayload
  ): FilterMetadata[] {
    if (!name) {
      name = pushid()
    }
    const [filters, enabled] = filterStateAndDetermineEnabled(state, name)
    const newFilter = buildChartCohortFilterMetadata(
      name,
      dimension,
      filter,
      enabled,
      chartId,
      layerId
    )
    return [...filters, newFilter]
  },

  [SET_CHART_FILTER](
    state: FilterMetadata[],
    {
      chartId,
      layerId,
      name,
      filter,
      enable,
      sharedCustom,
      globalCustom
    }: SetChartMetaPayload
  ): FilterMetadata[] {
    if (!name) {
      name = pushid()
    }

    const [filters, enabled, , quickFilter] = filterStateAndDetermineEnabled(
      state,
      name,
      enable,
      filter
    )

    const newFilter = buildChartFilterMetadata(
      name,
      filter,
      enabled,
      chartId,
      layerId,
      quickFilter,
      sharedCustom,
      globalCustom
    )
    return [...filters, newFilter]
  },

  [SET_DASHBOARD_COHORT](
    state: FilterMetadata[],
    { name, dimension, filter }: SetDashboardCohortPayload
  ): FilterMetadata[] {
    if (!name) {
      name = pushid()
    }
    const [
      filters,
      enabled,
      simpleModeEnabled
    ] = filterStateAndDetermineEnabled(state, name)
    const newFilter = buildDashboardCohortFilterMetadata(
      name,
      dimension,
      filter,
      enabled,
      simpleModeEnabled
    )
    return [...filters, newFilter]
  },

  [SET_DASHBOARD_FILTER](
    state: FilterMetadata[],
    {
      chartId,
      layerId,
      name,
      filter,
      enable,
      sharedCustom,
      globalCustom
    }: SetDashboardMetaPayload
  ): FilterMetadata[] {
    if (!name) {
      name = pushid()
    }
    const [
      filters,
      enabled,
      simpleModeEnabled
    ] = filterStateAndDetermineEnabled(state, name, enable)
    const newFilter = buildDashboardFilterMetadata(
      name,
      filter,
      enabled,
      chartId,
      layerId,
      simpleModeEnabled,
      sharedCustom,
      globalCustom
    )
    return [...filters, newFilter]
  },

  [TOGGLE_BY_NAME](
    state: FilterMetadata[],
    { name, enabled }: ToggleByNamePayload
  ): FilterMetadata[] {
    return state.map((f) =>
      !isOldFilter(f) && f.name === name
        ? {
            ...f,
            enabled: typeof enabled === "boolean" ? enabled : !f.enabled
          }
        : f
    )
  },

  [TOGGLE_SIMPLE_MODE_BY_NAME](
    state: FilterMetadata[],
    { name, simpleModeEnabled }: ToggleSimpleModeByNamePayload
  ): FilterMetadata[] {
    return state.map((f) =>
      !isOldFilter(f) && f.name === name
        ? {
            ...f,
            simpleModeEnabled:
              typeof simpleModeEnabled === "boolean"
                ? simpleModeEnabled
                : !f.simpleModeEnabled
          }
        : f
    )
  },

  [TOGGLE_CHART_FILTERS](
    state: FilterMetadata[],
    { chartId, layerId, enabled }: ToggleChartMetaPayload
  ): FilterMetadata[] {
    return state.map((f) => {
      if (
        isOldFilter(f) ||
        f.appliesTo !== "CHART" ||
        f.chartId !== chartId ||
        f.layerId !== layerId
      ) {
        return f
      }
      return {
        ...f,
        enabled: typeof enabled === "boolean" ? enabled : !f.enabled
      }
    })
  },

  [TOGGLE_CROSSFILTERS](
    state: FilterMetadata[],
    { chartId, layerId, enabled }: ToggleChartMetaPayload
  ): FilterMetadata[] {
    return state.map((f) => {
      if (
        isOldFilter(f) ||
        f.appliesTo !== "CROSSFILTER" ||
        f.chartId !== chartId ||
        f.layerId !== layerId
      ) {
        return f
      }
      return {
        ...f,
        enabled: typeof enabled === "boolean" ? enabled : !f.enabled
      }
    })
  },

  [TOGGLE_DASHBOARD_FILTERS](
    state: FilterMetadata[],
    { chartId, layerId, enabled }: DashboardMetaPayload
  ): FilterMetadata[] {
    if (chartId) {
      return state.map((f) => {
        if (
          isOldFilter(f) ||
          f.appliesTo !== "GLOBAL" ||
          f.chartId !== chartId ||
          f.layerId !== layerId
        ) {
          return f
        }
        return {
          ...f,
          enabled: typeof enabled === "boolean" ? enabled : !f.enabled
        }
      })
    }

    return state.map((f) => {
      if (isOldFilter(f) || f.appliesTo !== "GLOBAL") {
        return f
      }
      return {
        ...f,
        enabled: typeof enabled === "boolean" ? enabled : !f.enabled
      }
    })
  },

  [UPDATE_FILTER_BY_NAME](
    state: FilterMetadata[],
    { name, filter }: UpdateFilterPayload
  ): FilterMetadata[] {
    return state.map((f) =>
      !isOldFilter(f) && f.name === name
        ? {
            ...f,
            filter,
            dataSources: Array.from(getDataSourcesForFilter(filter)),
            quickFilter: getQuickFilterState(filter, f)
          }
        : f
    )
  },

  [UPDATE_FILTER_LAYER_ID_BY_NAME]: (
    state: FilterMetadata[],
    { name, layerId }
  ): FilterMetadata[] =>
    state.map((f) =>
      !isOldFilter(f) && f.name === name
        ? {
            ...f,
            layerId
          }
        : f
    ),

  // This is an old action that has no concept of names or layerId... it just
  // clears all filters on a given chart
  [CLEAR_CHART_FILTERS_OLD](
    state: FilterMetadata[],
    action: any
  ): FilterMetadata[] {
    return state.filter(
      (filter) => !(isOldFilter(filter) && filter.chartId === action.id)
    )
  },

  // This is from the old crossfilter interop
  [SET_FILTER_CROSSFILTER](
    state: FilterMetadata[],
    action: any
  ): FilterMetadata[] {
    const newState = state.filter(
      (filter) => filter.name !== action.payload.name
    )
    newState.push(action.payload)
    return newState
  },

  // This is from the old crossfilter interop
  [DELETE_FILTER_CROSSFILTER](
    state: FilterMetadata[],
    action: any
  ): FilterMetadata[] {
    return state.filter((filter) => filter.name !== action.payload.name)
  },

  // This is from the old crossfilter interop
  [TOGGLE_FILTER_CROSSFILTER](
    state: FilterMetadata[],
    action: any
  ): FilterMetadata[] {
    const newState = [...state]
    const filterIndex = newState.findIndex(
      (f) => f.name === action.payload.name
    )
    newState[filterIndex] = { ...newState[filterIndex] }
    newState[filterIndex].enabled =
      action.payload.enabled !== undefined
        ? action.payload.enabled
        : !newState[filterIndex].enabled
    return newState
  },

  // TODO: once heavyai-charting has been removed, we can uncomment this and remove the
  // call to clearAllChartFilters from deleteChart in charts-action-creators.
  // [DELETE_CHART](state: FilterMetadata[], action: any): FilterMetadata[] {
  //   const chartId = action.chartId
  //   return state.filter((f) => f.chartId !== chartId)
  // },

  [TOGGLE_QUICK_FILTER_VISIBILITY](
    state: FilterMetadata[],
    { name, quickFilter }: any
  ) {
    return state.map((f) =>
      f.name === name
        ? {
            ...f,
            quickFilter: {
              ...f.quickFilter,
              visible:
                typeof quickFilter === "boolean"
                  ? quickFilter
                  : !f.quickFilter.visible
            }
          }
        : f
    )
  },
  [SET_QUICK_FILTER_OPTION](
    state: FilterMetadata[],
    { name, value, visible }: any
  ) {
    const quickFilterState = (f: FilterMetadata) => {
      const quickFilter = f.quickFilter
        ? {
            ...f.quickFilter,
            optionValues: { ...f.quickFilter.optionValues }
          }
        : { visible: true, optionValues: {} }

      if (
        typeof visible === "boolean"
          ? visible
          : quickFilter.optionValues[value] !== true
      ) {
        return {
          ...quickFilter,
          optionValues: { ...quickFilter.optionValues, [value]: true }
        }
      }

      delete quickFilter.optionValues[value]
      return quickFilter
    }

    return state.map((f) =>
      f.name === name
        ? {
            ...f,
            quickFilter: quickFilterState(f)
          }
        : f
    )
  },

  [CANCEL_CHART_FILTER_CHANGES](
    state: FilterMetadata[],
    { chartId, savedChartFilters }: any
  ) {
    return [
      ...state.filter(
        (f) =>
          !(
            (f.appliesTo === "CHART" || f.appliesTo === "CROSSFILTER") &&
            f.chartId === chartId
          )
      ),
      ...savedChartFilters.filter(
        (f: FilterMetadata) =>
          f.appliesTo === "CHART" || f.appliesTo === "CROSSFILTER"
      )
    ]
  },

  /** Cleans up any chart level filters that no longer apply: if none of the
   * filter's data sources exist on the chart anymore, or if the chart type
   * has been edited to one that is not compatible with chart level filters.
   */
  [APPLY_CHART_EDITS](
    state: FilterMetadata[],
    { chartId, chartType, activeTablesForChart }: any
  ) {
    return [
      ...state.filter((f) => {
        const filterTables = getTablesForFilter(f.filter)
        // The chart contains every table in the filter
        const filterHasChartTables = Array.from(
          filterTables
        ).every((filterTable) =>
          Array.from(activeTablesForChart).includes(filterTable)
        )
        const removeChartFilter =
          !chartSupportsChartSpecificFilters({ type: chartType }) ||
          !filterHasChartTables

        return !(
          f.chartId === chartId &&
          f.appliesTo === "CHART" &&
          removeChartFilter
        )
      })
    ]
  }
}

export default createReducer(crossfilterReducers, initialState)
