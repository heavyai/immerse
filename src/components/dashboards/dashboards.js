// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"

import { Tooltip } from "@rmwc/tooltip"
import { PrimaryButton } from "widgets/button/Button"
import DashboardsList from "components/dashboards-list"
import SearchInput from "components/search-input/search-input"
import IconImport from "components/svg-icons/icon-import"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { frontEndViewShape } from "constants/prop-types"
import {
  IMPORT_DASHBOARD_TEXT,
  NEW_DASHBOARD_TEXT,
  SEARCH_PLACEHOLDER
} from "constants/dashboards"
import {
  retrieveFromLocalStorage,
  storeInLocalStorage
} from "utils/local-storage"
import { atDashboardsList } from "utils/routerPath"
import Drawer from "components/drawer/drawer"
import DashboardManagerFilterCount from "components/dashboards/dashboard-manager-filters/DashboardManagerFilterCount"
import WelcomeSection from "components/dashboards/welcome-section"
import DashboardManagerFiltersComponent from "./dashboard-manager-filters/dashboard-manager-filters"
import BulkActions from "./dashboard-bulk-actions"

const { GLOBAL_SIDE_NAV } = available_feature_flags
const { LANDING_PAGE_PANELS } = available_feature_flags
const WELCOME_PANEL_OPEN_KEY = "WELCOME_PANEL_OPEN"

export default class Dashboards extends Component {
  static propTypes = {
    canCreateDashboard: PropTypes.bool,
    dashboards: PropTypes.shape({
      list: PropTypes.arrayOf(frontEndViewShape).isRequired,
      error: PropTypes.bool.isRequired,
      loading: PropTypes.bool.isRequired
    }),
    getDashboards: PropTypes.func.isRequired,
    hideModal: PropTypes.func.isRequired,
    initializeDashboard: PropTypes.func.isRequired,
    isDemo: PropTypes.bool,
    loadDashboardLink: PropTypes.func.isRequired,
    loadLinkId: PropTypes.string,
    showModal: PropTypes.func.isRequired,
    showDashboardImportModal: PropTypes.func.isRequired,
    version: PropTypes.string,
    dbName: PropTypes.string
  }

  state = {
    searchVal: "",
    dm_filters: [],
    dm_filteredCount: null,
    dm_filterEnabled: true
  }

  componentDidMount() {
    this.props.clearDashboard()
    this.props.resetAppState()
    if (this.props.loadLinkId) {
      this.props.loadDashboardLink(this.props.loadLinkId)
    } else {
      this.props.getDashboards()
    }
  }

  componentDidUpdate(prevProps) {
    if (
      atDashboardsList(this.props.pathname) &&
      prevProps.pathname !== this.props.pathname
    ) {
      this.props.getDashboards()
    }
  }

  updateSearchVal = (val) => {
    this.setState({ searchVal: val })
  }

  updateFilters = (values) => {
    this.setState({ dm_filters: values })
  }

  updateFilteredListCount = (count) => {
    this.setState({ dm_filteredCount: count })
  }

  toggleFilter = (toggleState) => {
    this.setState({ dm_filterEnabled: toggleState })
  }

  render() {
    const {
      canCreateDashboard,
      isDemo,
      initializeDashboard,
      dashboards,
      username
    } = this.props
    const sharingEnabled = true

    return (
      <div className="dashboards-page">
          <div className="left-container">
            {getFeatureFlag(LANDING_PAGE_PANELS) ? (
              <Drawer
                position="top"
                drawerOpen={retrieveFromLocalStorage(WELCOME_PANEL_OPEN_KEY, {
                  defaultValue: true,
                  asJSON: true
                })}
                tabText="Welcome Panel"
                toggleDrawerCallback={(open) => {
                  storeInLocalStorage(WELCOME_PANEL_OPEN_KEY, open)
                }}
              >
                <WelcomeSection />
              </Drawer>
            ) : (
              ""
            )}
            <DashboardManagerFiltersComponent
              list={dashboards.list}
              updateFilters={this.updateFilters}
              toggleFilter={this.toggleFilter}
              filterEnabled={this.state.dm_filterEnabled}
              database={this.props.dbName}
              username={username}
              subComponents={
                <div className={"dashboard-manager-right-section"}>
                  <SearchInput
                    placeholder={SEARCH_PLACEHOLDER}
                    searchVal={this.state.searchVal}
                    updateSearchVal={this.updateSearchVal}
                  />
                  <DashboardManagerFilterCount
                    filteredListCount={this.state.dm_filteredCount}
                    fullListCount={dashboards.list.length}
                  />
                </div>
              }
            />
            <div className="top-panel">
              <div className="left-wrapper">
                <BulkActions />
              </div>
              {canCreateDashboard && !getFeatureFlag(GLOBAL_SIDE_NAV) && (
                <div className="right-wrapper">
                  <Tooltip content={IMPORT_DASHBOARD_TEXT} enterDelay={500}>
                    <button
                      className="button import-dashboard-button"
                      data-testid="import-dashboard-button"
                      onClick={this.props.showDashboardImportModal}
                    >
                      <IconImport />
                    </button>
                  </Tooltip>
                  <PrimaryButton
                    className="button primary new-dashboard"
                    disabled={isDemo}
                    id="new-dashboard"
                    data-testid="new-dashboard-button"
                    onClick={initializeDashboard}
                  >
                    {NEW_DASHBOARD_TEXT}
                  </PrimaryButton>
                </div>
              )}
            </div>
            <DashboardsList
              {...{
                canCreateDashboard,
                sharingEnabled,
                list: dashboards.list,
                selected: dashboards.selected,
                searchVal: this.state.searchVal,
                filters: this.state.dm_filters,
                updateFilteredListCount: this.updateFilteredListCount,
                filterEnabled: this.state.dm_filterEnabled
              }}
            />
          </div>
        </div>
    )
  }
}
