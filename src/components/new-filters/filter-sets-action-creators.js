// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"

import { isMultiLayer } from "charts/raster-chart/raster-utils"

import { navigateToDashboard } from "actions/dashboard-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import {
  toggleFilterByName,
  setDashboardCohort,
  clearFilterByName,
  duplicateOmnifilter
} from "vega/actions/filter-action-creators"
import {
  deleteFilterX,
  toggleFilterX
} from "vega/actions/filter-action-creators-crossfilter-interop"
import {
  andFilter,
  buildOmnifilterSql,
  emptyCohortSql
} from "vega/constants/filter-types"
import { isOldFilter } from "vega/constants/filter-metadata-types"
import {
  isFocusChartFilterName,
  isRangeChartFilterName,
  focusChartFilterName,
  rangeChartFilterName,
  getTablesForFilter
} from "vega/utils/filter"
import { addCohort } from "components/new-filters/cohorts-action-creators"
import { setChartZoom } from "actions/map-charts-filter-action-creators"
import { getFilterSets } from "components/new-filters/filter-sets-selectors"
import { batch } from "react-redux"

import { FILTER_TYPE_SQL } from "vega/constants/filter-type-constants"
import { importableServices as Services } from "services/immerse-importable"

export const ADD_FILTER_SET = "ADD_FILTER_SET"
export const RENAME_FILTER_SET = "RENAME_FILTER_SET"
export const DELETE_FILTER_SET = "DELETE_FILTER_SET"
export const DUPLICATE_FILTER_SET = "DUPLICATE_FILTER_SET"
export const CLEAR_ALL_FILTER_SETS = "CLEAR_ALL_FILTER_SETS"

export const ADD_FILTER_TO_FILTER_SET = "ADD_FILTER_TO_FILTER_SET"
export const REMOVE_FILTER_FROM_FILTER_SET = "REMOVE_FILTER_FROM_FILTER_SET"

export const SET_COHORT_AGGREGATE_FILTER = "SET_COHORT_AGGREGATE_FILTER"
export const REMOVE_COHORT_AGGREGATE_FILTER = "REMOVE_COHORT_AGGREGATE_FILTER"
export const TOGGLE_COHORT_AGGREGATE_FILTER = "TOGGLE_COHORT_AGGREGATE_FILTER"
export const SET_COHORT_AGGREGATE_FILTER_VALIDITY =
  "SET_COHORT_AGGREGATE_FILTER_VALIDITY"

export const SET_FILTER_SET_DIMENSION = "SET_FILTER_SET_DIMENSION"

export const SELECT_FILTER_SET = "SELECT_FILTER_SET"
export const SET_ENABLED_FILTER_SET_FILTERS = "SET_ENABLED_FILTER_SET_FILTERS"

export function getDefaultFilterSet(id = pushid()) {
  return {
    id,
    filterSet: {
      id,
      name: "Default Filter Set",
      filters: [],
      selected: true
    }
  }
}

export function addFilterSet(name, id = pushid(), navigate = true) {
  return async (dispatch, getState) => {
    const filterSets = getFilterSets(getState())
    dispatch({
      type: ADD_FILTER_SET,
      payload: {
        id,
        name: name || `New Filter Set ${Object.keys(filterSets).length + 1}`
      }
    })
    dispatch(updateDashboardSaveState(name !== "Default Filter Set"))

    // okay. we need to jump through a few hoops when we add a new filterSet to ensure that rasters
    // behave properly. So get our current state, pull out the charts, and reduce it into a map
    // of chartId -> mapZoomCenter.
    const charts = getState().charts

    const boundingBoxes = Object.entries(charts).reduce(
      (bboxes, [chartId, chart]) => {
        if (chart.mapZoomCenter !== undefined) {
          bboxes[chartId] = chart.mapZoomCenter
        }
        return bboxes
      },
      {}
    )

    await dispatch(selectFilterSet(id, navigate))

    // After we add a filterSet, we need to look at all of the raster charts and add a bounding box filter
    // since it's a new filterSet, we can guarantee that there aren't any other filters in place that we could possibly
    // stomp on, so it really is nothing to worry about.
    //
    // we call isMultiLayer because we only want to do this for the map charts with bounding boxes. That includes
    // all the map charts, which happens to be the multilayer compatible ones, but ignores frontend choropleth.
    // - isRasterChart would also catch scatter and blow up.
    for (const chartId of Object.keys(charts)) {
      if (isMultiLayer(charts[chartId].type)) {
        await dispatch(setChartZoom(chartId, boundingBoxes[chartId]))
      }
    }
  }
}

export function duplicateFilterSet(id, newId = pushid()) {
  return async (dispatch, getState) => {
    const omnifilters = getState().omnifilters
    const filterSet = getFilterSets(getState())[id]

    // we only want to enable the filters in the new set that are enabled in our current
    // set. So we yank out the list of enabled filters in our current set.
    const oldEnabledFilters = getFilterSetEnabledFilters(filterSet, omnifilters)

    const enabledFilters = []
    const filters = []

    for (const filterId of filterSet.filters
      // We're not properly removing filters from filter sets right now.
      // Skip any ghost filters that don't exist in omnifilters.
      .filter((name) => omnifilters.some((f) => f.name === name))
      .sort((a, b) => a.localeCompare(b))) {
      // create a new filter id
      let newFilterName = pushid()

      // If the filter is a crossfilter, we use the filter set id in the name
      const oldFilter = omnifilters.find((f) => f.name === filterId)
      if (oldFilter.appliesTo === "CROSSFILTER") {
        if (isFocusChartFilterName(oldFilter.name)) {
          newFilterName = focusChartFilterName(oldFilter.chartId, newId)
        } else if (isRangeChartFilterName(oldFilter.name)) {
          newFilterName = rangeChartFilterName(oldFilter.chartId, newId)
        }
      }

      // duplicate it
      await dispatch(duplicateOmnifilter(oldFilter, newFilterName))
      // and add it to our new list of filters
      filters.push(newFilterName)
      // finally, if the old filter is enabled, then the new one should be too.
      if (oldEnabledFilters.includes(filterId)) {
        enabledFilters.push(newFilterName)
      }
    }

    await dispatch({
      type: DUPLICATE_FILTER_SET,
      payload: {
        id,
        newId,
        filters,
        enabledFilters
      }
    })

    await dispatch(selectFilterSet(newId))
  }
}

export const renameFilterSetAction = (id, newName) => ({
  type: RENAME_FILTER_SET,
  payload: { id, newName }
})

export const renameFilterSet = (id, newName) => (dispatch) => {
  dispatch(renameFilterSetAction(id, newName))
  dispatch(updateDashboardSaveState(true))
}

export function deleteFilterSet(id) {
  return async (dispatch, getState) => {
    const filterSets = getFilterSets(getState())
    const filterSet = filterSets[id]
    const sortedFilterSets = Object.keys(filterSets).sort()
    const filterSetIdx = sortedFilterSets.findIndex((z) => z === id)

    // deleting a filterSet will also delete its filters.
    // Do this before selecting a new filter set; crossfilter interop can end up
    // wiping out any crossfilters on the filter set we're switching to otherwise.
    await dispatch(clearAllFiltersFromFilterSet(id))

    // Select the next filterSet if the one we're deleting was selected
    // Do this before deleting the previous set so that we always have a valid filter set selected
    if (filterSet.selected) {
      const indexModifier = filterSetIdx === 0 ? 1 : -1

      await dispatch(
        selectFilterSet(sortedFilterSets[filterSetIdx + indexModifier])
      )
    }

    // and delete the filterSet itself
    dispatch({
      type: DELETE_FILTER_SET,
      payload: { id }
    })

    dispatch(updateDashboardSaveState(true))
  }
}

export function clearCrossFiltersFromFilterSet(id, dataSource = "") {
  return clearFiltersFromFilterSet(id, new Set(["CROSSFILTER"]), dataSource)
}

export function clearDashboardFiltersFromFilterSet(id, dataSource = "") {
  return clearFiltersFromFilterSet(id, new Set(["GLOBAL"]), dataSource)
}

export function clearAllFiltersFromFilterSet(id, dataSource = "") {
  return clearFiltersFromFilterSet(
    id,
    new Set(["CROSSFILTER", "GLOBAL"]),
    dataSource
  )
}

export function clearFiltersFromFilterSet(
  id,
  types = new Set(),
  dataSource = ""
) {
  return async (dispatch, getState) => {
    const filterSets = getFilterSets(getState())
    const omnifilters = getState().omnifilters
    const filterSet = filterSets[id]
    // clear all the filters. Easy!
    if (filterSet && filterSet.filters.length) {
      filterSet.filters.forEach(async (name) => {
        const filter = omnifilters.find(
          (f) =>
            f.name === name &&
            types.has(f.appliesTo) &&
            (!dataSource || f.dataSources.includes(dataSource))
        )
        if (filter) {
          if (isOldFilter(filter)) {
            await dispatch(deleteFilterX(name))
          } else {
            await dispatch(clearFilterByName(name))
          }
        }
      })
    }
  }
}

export function clearAllFilterSets(navigate = false) {
  return (dispatch) => {
    batch(() => {
      dispatch({ type: CLEAR_ALL_FILTER_SETS })
      dispatch(addFilterSet("Default Filter Set", pushid(), navigate))
    })
  }
}

export function addFilterToFilterSet(id, filter) {
  return {
    type: ADD_FILTER_TO_FILTER_SET,
    payload: { id, filter }
  }
}

export function removeFilterFromFilterSet(id, filter) {
  return {
    type: REMOVE_FILTER_FROM_FILTER_SET,
    payload: { id, filter }
  }
}

export function setCohortAggregateFilter(filter, name = pushid()) {
  return (dispatch) => {
    dispatch(updateDashboardSaveState(true))
    dispatch({
      type: SET_COHORT_AGGREGATE_FILTER,
      payload: { filter, name }
    })
  }
}

export function removeCohortAggregateFilter(filterId) {
  return (dispatch) => {
    dispatch(updateDashboardSaveState(true))
    dispatch({
      type: REMOVE_COHORT_AGGREGATE_FILTER,
      payload: { filterId }
    })
  }
}

export function toggleCohortAggregateFilter(filterId, enabled) {
  return (dispatch) => {
    dispatch(updateDashboardSaveState())
    dispatch({
      type: TOGGLE_COHORT_AGGREGATE_FILTER,
      payload: { filterId, enabled }
    })
  }
}

export function setCohortAggregateFilterValidity(filterId, valid) {
  return {
    type: SET_COHORT_AGGREGATE_FILTER_VALIDITY,
    payload: { filterId, valid }
  }
}

export function setFilterSetDimension(id, dataSource, table, dimension) {
  return {
    type: SET_FILTER_SET_DIMENSION,
    payload: { id, dataSource, table, dimension }
  }
}

export function setEnabledFilterSetFilters(id, enabledFilters) {
  return {
    type: SET_ENABLED_FILTER_SET_FILTERS,
    payload: { id, enabledFilters }
  }
}

function getFilterSetEnabledFilters(selectedFilterSet, omnifilters) {
  return ((selectedFilterSet || {}).filters || []).reduce((zef, name) => {
    const filter = omnifilters.find((f) => f.name === name)
    if (filter && filter.enabled) {
      zef.push(name)
    }
    return zef
  }, [])
}

export function selectFilterSet(id, navigate = true) {
  return async (dispatch, getState) => {
    const omnifilters = getState().omnifilters
    const filterSets = getFilterSets(getState())

    // If the filterSet doesn't exist, don't select it.
    // Otherwise, if you were to attempt to select a filterSet which doesn't exist
    // (which is an error anyway), you'd deselect your currently selected filterSet
    // and then select nothing. Whoops. This could happen during dashboard load.
    const filterSetToSelect = filterSets[id]

    if (filterSetToSelect !== undefined) {
      // bow out and do nothing if we're trying to re-select the currently selected filterSet.
      const selectedFilterSet = Object.values(filterSets).find(
        (filterSet) => filterSet.selected
      )

      if (
        selectedFilterSet !== undefined &&
        selectedFilterSet.id === filterSetToSelect.id
      ) {
        return
      }

      // get names of dashboard filters that should be enabled
      const filterSetFilters = (
        filterSetToSelect.enabledFilters ||
        filterSetToSelect.filters ||
        []
      ).filter((name) => {
        const filter = omnifilters.find((f) => f.name === name)
        return filter !== undefined && filter.appliesTo === "GLOBAL"
      })

      // get names of dashboard filters that should be disabled
      const otherFilters = omnifilters
        .filter(
          (f) =>
            f.appliesTo === "GLOBAL" &&
            !filterSetFilters.includes(f.name) &&
            f.enabled === true
        )
        .map((f) => f.name)

      if (selectedFilterSet) {
        const filterSetEnabledFilters = getFilterSetEnabledFilters(
          selectedFilterSet,
          omnifilters
        )

        await dispatch(
          setEnabledFilterSetFilters(
            selectedFilterSet.id,
            filterSetEnabledFilters
          )
        )
      }

      // enable the dashboard filters that should be enabled; disable the dashboard
      // filters that should be disabled
      await batch(() => {
        filterSetFilters.forEach((name) =>
          dispatch(toggleFilterByName(name, true))
        )
        otherFilters.map((name) => dispatch(toggleFilterByName(name, false)))
      })

      // XXX TODO - what about chart filters? Do they belong to filter sets? If
      // so, uncomment this code. We don't need to worry about doing anything
      // fancy with chart filters because they only exist in the new redux
      // state.
      // await batch( () => {
      //   omnifilters
      //     .filter(
      //       (f) =>
      //         f.appliesTo === "CHART" &&
      //         f.enabled !==
      //           (filterSetToSelect.enabledFilters || []).includes(f.name)
      //     )
      //     .forEach((f) => dispatch(toggleFilterByName(f.name)))
      // })

      // okay, that handles the dashboard filters. Now we need to deal with the crossfilters.
      // and shut off all crossfilters in different filterSets
      await Promise.all(
        omnifilters
          .filter(
            (f) =>
              f.appliesTo === "CROSSFILTER" &&
              !filterSetFilters.includes(f.name) &&
              f.enabled === true
          )
          .map((f) =>
            isOldFilter(f)
              ? dispatch(toggleFilterX(f.name, false))
              : dispatch(toggleFilterByName(f.name, false))
          )
      )

      // actually select the filterSet
      dispatch({
        type: SELECT_FILTER_SET,
        payload: { id }
      })

      // now that the filterSet is selected, we can re-enable the filters for that filterSet. crossfilters are twitchy
      // and rely upon knowledge of the current filterSet.
      // So here's what we're gonna do - we're gonna loop over the filterSets filters and find the crossfilters.
      // we used to only look at the enabledFilters, but there's a special case down below
      const filterSetCrossfilters = (filterSetToSelect.filters || []).flatMap(
        (name) => {
          const filter = omnifilters.find(
            (f) => f.appliesTo === "CROSSFILTER" && f.name === name
          )
          return filter ? [filter] : []
        }
      )

      for (const filter of filterSetCrossfilters) {
        // okay, for each filter, figure out if it's enabled. It'll have an entry in enabledFilters if it does
        const enabled = Boolean(
          (filterSetToSelect.enabledFilters || []).find(
            (f) => f === filter.name
          )
        )
        // and then we toggle it, handing in the 3rd argument to recenter it. That way non-bounding box
        // raster filters will recenter the chart, even if they're disabled. Magic!
        if (isOldFilter(filter)) {
          await dispatch(toggleFilterX(filter.name, enabled, true))
        } else if (enabled) {
          await dispatch(toggleFilterByName(filter.name, true))
        }
      }

      // finally, we also need to update the URL with the new filter set.
      // XXX TODO - this is temporary until such time as we replace it with better persistence/linking
      if (navigate) {
        // and navigate to it our new URL. Note that it will implicitly now include the filter set in the URL
        dispatch(navigateToDashboard(getState().dashboard.id))
      }
      // END temporary nav section
    }
  }
}

export function makeCohortFromSelectedFilterSet(
  dataSource,
  dataSourceTables,
  name,
  createNewFilterSet,
  replaceFilterSet,
  shouldClearDimension
) {
  return async (dispatch, getState) => {
    // okay. There's a lot going on here. First, we get our filters
    const omnifilters = getState().omnifilters

    // and our selected filterSet. Only continue if we have one.
    const selectedFilterSet = Object.values(getFilterSets(getState())).find(
      (filterSet) => filterSet.selected
    )

    // This grabs it from the filterZone, so it's just table.column here, boo
    const dimension = selectedFilterSet.dimensions[dataSource]

    const crossfilter = Services.get("crossfilter").getCrossfilter(dataSource)
    const columns = crossfilter.getColumns()
    const column = columns[dimension]

    if (dimension === undefined || column === undefined) {
      return
    }

    // can't do anything if we don't have a selectedFilterSet with a dimension
    if (selectedFilterSet && dimension) {
      const filters = []
      // We need a selected filterSet + a dimension on it + filters
      if (selectedFilterSet?.filters?.length) {
        // convert filter names => filter objects and remove the ones that are either
        // not enabled or for a different data source
        const filterSetFilters = selectedFilterSet.filters
          .map((filterName) =>
            omnifilters.find((filter) => filter.name === filterName)
          )
          .filter((filter) => {
            const filterTables = getTablesForFilter(filter)
            const allFilterTablesIntersect = Array.from(
              filterTables
            ).every((ft) => dataSourceTables.includes(ft))
            return filter?.enabled && allFilterTablesIntersect
          })
          .map((filterMetadata) => {
            if (filterMetadata.cohortDimension) {
              return {
                filterType: FILTER_TYPE_SQL,
                dataSource: filterMetadata.dataSources[0],
                sql: buildOmnifilterSql(filterMetadata)
              }
            } else {
              return filterMetadata.filter
            }
          })
        filters.push(...filterSetFilters)
      } // end if filters

      const postFilters =
        (selectedFilterSet.cohortAggregateFilters &&
          Object.values(selectedFilterSet.cohortAggregateFilters)
            .filter((metadata) => metadata.enabled && metadata.valid)
            .map((metadata) => metadata.filter)) ||
        []

      // the name of the cohort is the name of the current filterSet
      const cohortName = name

      // create an actual cohort
      const table = column.table
      const cohort = {
        dimension: {
          name: dimension,
          negated: false,
          cohortName,
          dataSource,
          postFilters
        },
        filter: filters.length
          ? andFilter(filters)
          : emptyCohortSql(dataSource, dimension, table),
        name: cohortName
      }

      await dispatch(
        addCohort({
          dataSource,
          table,
          ...cohort
        })
      )

      if (createNewFilterSet || replaceFilterSet) {
        if (createNewFilterSet) {
          // add a new filterSet to hold the cohort
          // adding the filterSet will automatically select it
          const cohortFilterSetId = pushid()
          await dispatch(
            addFilterSet(`${cohortName} Filter Set`, cohortFilterSetId)
          )
        } else if (replaceFilterSet) {
          await dispatch(clearAllFiltersFromFilterSet(selectedFilterSet.id))
        }

        // now we actually create the cohort filter
        // which will also automatically add it to the currently selected filterSet.
        const cohortFilterId = pushid()
        await dispatch(
          setDashboardCohort(cohort.dimension, cohort.filter, cohortFilterId)
        )
      }

      // If we're clearing the dimension from the "Cohort Builder" state in
      // the filter panel, then clear out the dimension from the filterSet /
      // `filterSets.dimensions`
      if (shouldClearDimension) {
        await dispatch(
          setFilterSetDimension(
            selectedFilterSet.id,
            dataSource,
            table,
            undefined
          )
        )
      }

      // and done.
    } // end if selectedFilterSet
  } // end thunk
}
