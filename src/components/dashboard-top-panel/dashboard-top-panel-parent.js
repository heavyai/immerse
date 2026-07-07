// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ChartActions from "actions/charts-action-creators"
import * as ChartFilterActions from "actions/charts-filter-action-creators"
import * as DashboardActions from "actions/dashboard-action-creators"
import * as FilterActions from "actions/dashboard-filters-action-creators"
import * as UIActions from "actions/ui-action-creators"

import { compose, filter, length, map, not, prop, sum, values } from "ramda"
import { withRouter } from "react-router-dom"
import { connect } from "react-redux"
import { setDashboardStyles } from "actions/user-configurable-ui-action-creators"
import { createNewChartAfterMax } from "actions/create-new-chart-action-creators"
import DashboardTopPanel from "./dashboard-top-panel"
import { newChartIndex } from "utils/add-chart-helpers"
import { isSharingRestricted } from "components/dashboard/dashboard-helpers"
import {
  toggleFilterByName,
  clearFilterByName
} from "../../vega/actions/filter-action-creators"
import { clearCrossFiltersFromFilterSet } from "components/new-filters/filter-sets-action-creators"
import { toggleFilterX } from "vega/actions/filter-action-creators-crossfilter-interop"
import { getSelectedFilterSet } from "components/new-filters/filter-sets-selectors"
import { makeFilterValidator } from "components/new-filters/filter-selectors"
import { getActiveDataSources } from "utils/currently-active-datasources"
import { redrawAll } from "actions/dc-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"

const extractChartFilter = (chart) => {
  if (chart.filters && chart.filters.length) {
    return chart.filters
  } else if (chart.rangeFilter && chart.rangeFilter.length) {
    return chart.rangeFilter
  } else {
    return []
  }
}

export const mapNumFilters = compose(
  sum,
  values,
  map(length),
  map(extractChartFilter)
)

const isValid = compose(not, Boolean, prop("error"))
const hasValue = compose(Boolean, prop("value"))
const hasOperand = compose(Boolean, prop("operand"))
const hasExpression = compose(Boolean, prop("expression"))
const isNullFilter = (f) =>
  f.operator === "IS NULL" || f.operator === "NOT NULL"

const shouldBeCounted = (filterObj) =>
  ((hasValue(filterObj) && hasOperand(filterObj)) ||
    hasExpression(filterObj) ||
    isNullFilter(filterObj)) &&
  isValid(filterObj)
export const mapNumFilterValues = compose(length, filter(shouldBeCounted))

function mapStateToProps(state, ownProps) {
  const {
    charts,
    connection,
    dashboard,
    filters,
    ui,
    omnifilters,
    parameters
  } = state
  const { location = { pathname: "" }, showAdvancedFilterControls } = ownProps

  const selectedFilterSet = getSelectedFilterSet(state)

  const selectedFilterIds = selectedFilterSet ? selectedFilterSet.filters : []

  const numActiveFiltersForSelectedFilterSet = omnifilters
    .filter(
      (f) =>
        selectedFilterIds.includes(f.name) || selectedFilterSet === undefined
    )
    .filter((f) => f.enabled && !f.isBinnedFilter).length

  const currentDataSource =
    dashboard.currentDataSource || getActiveDataSources(state, true)[0]

  const filterValidator = makeFilterValidator(state)

  return {
    currentDataSource,
    dashboardId: dashboard.id,
    isDemo: connection.isDemo,
    isClearFiltersDropdownShown: ui.showClearFiltersDropdown,
    isOwner: dashboard.owner === connection.user.username,
    numChartFilters: mapNumFilters(charts),
    numFilters: mapNumFilters(charts) + mapNumFilterValues(filters),
    numInputFilters: mapNumFilterValues(filters),
    dashboardContainers: dashboard.chartContainers,
    dashboardTitle: dashboard.title || "",
    dashboardTitleFormatted: dashboard.titleFormatted || "",
    parameters,
    privileges: dashboard.privileges,
    userPrivileges: connection.privileges,
    route: location.pathname,
    saveState: dashboard.saveState,
    showAdvancedFilterControls,
    dataSources: Object.keys(dashboard.dataSources),
    streamingInterval: dashboard.streaming.interval,
    isRefreshing: dashboard.streaming.request,
    omnifilters,
    numActiveFiltersForSelectedFilterSet,
    selectedFilterSet,
    filterValidator,
    isSharingRestricted: isSharingRestricted(connection),
    roles: connection.roles
  }
}

function mapDispatchToProps(dispatch) {
  return {
    redrawAll(group, allCharts) {
      if (allCharts) {
        dispatch(DashboardActions.refreshDashboard())
      } else {
        dispatch(redrawAll(group, allCharts))
      }
    },
    hideClearFiltersDropDown() {
      dispatch(UIActions.hideClearFiltersDropDown())
    },
    showClearFiltersDropdown() {
      dispatch(UIActions.showClearFiltersDropDown())
    },
    addChart(newChartId) {
      dispatch(createNewChartAfterMax(newChartId))
    },
    clearAllFilters() {
      dispatch(ChartActions.clearChartFiltersForAllCharts())
      dispatch(FilterActions.clearAllInputFilters())
      dispatch(updateDashboardSaveState())
    },
    setStreamingInterval(interval) {
      dispatch(DashboardActions.setStreamingInterval(interval))
    },
    refreshDashboard() {
      dispatch(DashboardActions.refreshDashboard())
    },
    clearAllInputFilters() {
      dispatch(FilterActions.clearAllInputFilters())
      dispatch(updateDashboardSaveState())
    },
    clearChartFilters() {
      dispatch(ChartActions.clearChartFiltersForAllCharts())
      dispatch(updateDashboardSaveState())
    },
    clearFilterSetCrossFilters(filterSetId) {
      dispatch(clearCrossFiltersFromFilterSet(filterSetId))
    },
    setChartFilters(chartId, filters) {
      dispatch(ChartFilterActions.setChartFilters(chartId, filters))
    },

    /**
     * @param {string} name
     * @param {string} oldName
     * @param {string?} nameFormatted
     */
    handleUpdateDashboardName(name, oldName, nameFormatted) {
      const nameOrEmpty =
        nameFormatted && nameFormatted !== name ? nameFormatted : ""
      dispatch(DashboardActions.updateDashboardName(name))
      dispatch(DashboardActions.updateDashboardNameFormatted(nameOrEmpty))
      if (name !== oldName) {
        dispatch(updateDashboardSaveState(true))
      }
    },

    saveDashboard() {
      // Copy over any unsaved changes the user made to the config UI panel to
      // the dashboard state before we save
      dispatch(setDashboardStyles())

      dispatch(DashboardActions.saveDashboard())
    },
    async toggleFilterByName(name, newVal) {
      await dispatch(toggleFilterByName(name, newVal))
    },
    toggleFilterX(name, newVal) {
      dispatch(toggleFilterX(name, newVal))
    },
    clearDashboardFilter(name) {
      dispatch(clearFilterByName(name))
    }
  }
}

function mergeProps(
  { dashboardContainers, ...stateProps },
  { addChart, ...dispatchProps },
  ownProps
) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    addNewChart() {
      // Colored add chart button in the dashboard toolbar. This is also possible with the large
      // grey CTA on the dashboard itself, when there are no charts yet - see
      // src/components/dashboard/dashboard.js#236
      addChart(newChartIndex(dashboardContainers))
    },
    shouldAnimateFromRight:
      ownProps.prevPath && ownProps.prevPath.indexOf("edit") >= 0
  })
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withRouter(DashboardTopPanel))
