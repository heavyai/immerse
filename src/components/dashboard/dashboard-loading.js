// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import DashboardContainer from "./dashboard-container"
import {
  getDashboard,
  loadDash,
  softSaveDashboardTab,
  stopStreaming,
  loadDashboardTab,
  copyCommonTabState,
  setDashboardPrivileges
} from "actions/dashboard-action-creators"
import { importableStore as store } from "store/importableStore"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
const { DASHBOARD_TABS } = available_feature_flags

class DashboardLoading extends PureComponent {
  static propTypes = {
    loadComplete: PropTypes.bool,
    params: PropTypes.object,
    children: PropTypes.element,
    match: PropTypes.object.isRequired
  }

  componentDidMount() {
    const { match, location } = this.props

    // Sometimes dashboardId is "chart" due to bad route/component nesting.
    // See todo comment in componentDidUpdate.
    if (match.params.dashboardId && match.params.dashboardId !== "chart") {
      const queryParams = new URLSearchParams(location.search)
      const selectedFilterSet =
        queryParams.get("filterSet") || match.params.selectedFilterSet
      const selectedTabId = queryParams.get("tab")

      const parametersFromQueryString = {}
      for (const [key, value] of queryParams) {
        if (key.startsWith("parameter.")) {
          const parameterKey = key.slice(10)
          parametersFromQueryString[parameterKey] = value
        }
      }

      store.dispatch(
        getDashboard(
          match.params.dashboardId,
          selectedFilterSet,
          selectedTabId,
          parametersFromQueryString
        )
      )
    } else {
      store.dispatch(loadDash())
      store.dispatch(
        setDashboardPrivileges({
          editDashboard: true,
          deleteDashboard: true
        })
      )
    }
  }

  componentDidUpdate = async ({
    match: { params: { dashboardId: prevDashboardId } = {} } = {},
    location: { search: prevSearch },
    selectedTabId: prevTabId,
    tabs: prevTabs
  }) => {
    const {
      match: { params: { dashboardId, selectedFilterSet } = {} } = {},
      location: { search },
      tabs,
      selectedTabId
    } = this.props
    const queryParams = new URLSearchParams(search)
    const filterSet = queryParams.get("filterSet") || selectedFilterSet

    // TODO: dashboardIds route params ends up being "chart" because of our bad nesting of
    // ChartEditor inside of Dashboard and it's requirement as a dependency.
    // Need to refactor those so we don't have to do all this complicated logic for
    // loading dashboard data just to render the ChartEditor.
    if (
      (!prevDashboardId && dashboardId && dashboardId !== "chart") ||
      (prevDashboardId &&
        prevDashboardId !== dashboardId &&
        prevDashboardId !== "chart")
    ) {
      stopStreaming()
      store.dispatch(getDashboard(dashboardId, filterSet, selectedTabId))
    } else if (
      getFeatureFlag(DASHBOARD_TABS) &&
      prevDashboardId === dashboardId
    ) {
      /**
       * Danger lurks here; prevTabParam can be null or invalid:
       * a) after we handle an invalid or missing query param
       * b) on initial dashboard load
       * c) before the first tab switch on a newly-created/unsaved dashboard
       */
      const tab = queryParams.get("tab")
      const prevTabParam = new URLSearchParams(prevSearch).get("tab")

      /**
       * Fall back to prevTabId from the store in those cases. If a saved
       * dashboard has been loaded, the query param will have been validated.
       * Otherwise, we have to check if it is both present and valid.
       */
      const prevTab = tabs?.[prevTabParam] ? prevTabParam : prevTabId

      /**
       * This next check should only pass on the update where the user has
       * deleted the current tab, in which case we need to load an adjacent tab
       * and avoid soft saving the deleted tab.
       *
       * A simpler check (tabs && !tabs.[prevTab]) *should* also work now that we're
       * doing the above validity check, but this should hopefully be safer.
       *
       * Check for existence of `tabs` is to prevent check from passing on CLEAR_DASHBOARD
       */
      if (prevTabs?.[prevTab] && tabs && !tabs[prevTab]) {
        stopStreaming()
        // See note below re: setTimeout
        setTimeout(
          // Use selectedTabId; it'll be set in the same update where the tab is
          // deleted, whereas the query param won't be updated in the same tick.
          () => store.dispatch(loadDashboardTab(filterSet, selectedTabId)),
          0
        )
        return
      }

      if (prevTab && prevTab !== tab && tabs?.[tab]) {
        if (tabs[prevTab]) {
          await store.dispatch(softSaveDashboardTab())
          // Copy any changes that should apply to the entire dashboard (save
          // state, title) from current tab to the tab we are selecting
          store.dispatch(copyCommonTabState(tab))
        }

        // Refresh interval is unique to each tab; clear current
        stopStreaming()

        /**
         * Load-bearing setTimeout alert! It looks like dispatching this from
         * componentDidUpdate might cause timing issues where mapStateToProps
         * runs on connected child components when they should no longer be
         * rendered (specifically, ChartContainer descendents when the chart
         * doesn't exist on the tab that is being loaded).
         * This looks suspiciously similar to https://github.com/reduxjs/react-redux/issues/1397
         */
        setTimeout(() => store.dispatch(loadDashboardTab(filterSet, tab)), 0)
      }
    }
  }

  componentWillUnmount() {
    /**
     * If a user routes from an unsaved dashboard to SQL Editor, the user can subsequently use the back button
     * to restore the unsaved dashboard state. For this to work, we need to "soft save" the current dashboard
     * (that is, copy the current dashboard state to the dashboard.tabs state in redux).
     */
    store.dispatch(softSaveDashboardTab())
    stopStreaming()
  }

  render() {
    const {
      loadComplete,
      children,
      match: { params }
    } = this.props

    return loadComplete ? (
      <DashboardContainer params={params}>{children}</DashboardContainer>
    ) : (
      <div className="dashboard-top-panel" data-testid="dashboard-top-panel">
        <div className="dashboard-top-panel-inner" />
      </div>
    )
  }
}

export default DashboardLoading
