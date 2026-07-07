// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { inDashboard, onEditPath } from "utils/routerPath"
import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  AUTO_REFRESH_VALUES,
  AUTO_REFRESH_VALUE_2S
} from "constants/auto-refresh-values"
import APP_CONFIG from "constants/app-config"

import { Tooltip } from "@rmwc/tooltip"
import CustomSelector from "components/custom-selector/custom-selector"
import cx from "classnames"
import { dashboardSaveStateShape } from "constants/prop-types"
import AnnotationsControls from "components/annotations/AnnotationsControls"
import DashboardTopPanelTitle from "components/dashboard-top-panel-title/dashboard-top-panel-title"
import FilterSetsList from "components/new-filters/filter-sets/filter-sets-list"
import FilterSetsCrossFilter from "components/new-filters/filter-sets/filter-sets-cross-filter"
import MultiCount from "components/multi-count/multi-count"
import ShareLink from "components/share-link/share-link-parent"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import IconSave from "components/svg-icons/icon-save"
import IconRefresh2 from "components/svg-icons/icon-refresh2"
import { Icon } from "@rmwc/icon"
import { isOldFilter } from "vega/constants/filter-metadata-types"
import DashboardKebab from "components/dashboard-top-panel/dashboard-kebab"
import AccountPanel from "components/account-panel/account-panel-parent"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import {
  ImmerseUIRequired,
  IMMERSE_UI_HEADERBAR,
  IMMERSE_UI_FILTER_SETS,
  IMMERSE_UI_ANNOTATION,
  IMMERSE_UI_SAVE,
  IMMERSE_UI_REFRESH,
  IMMERSE_UI_ADD_CHART,
  REMOVE_BY_NO_DISPLAY,
  IMMERSE_UI_USER_DROPDOWN
} from "services/immerse-ui-provider"
import LogoParent from "components/logo/logo-parent"
import useChartsCount from "hooks/useChartsCount"
import { exportAsImage } from "chart-addons/export-as-image"
import { isUserExportDisabled } from "utils/user"

const {
  ENABLE_ANNOTATIONS,
  ENABLE_AUTO_DASHBOARD_REFRESH,
  GLOBAL_SIDE_NAV,
  LIMIT_CHARTS_PER_DASHBOARD,
  ENABLE_DASHBOARD_IMAGE_EXPORT,
  KIOSK_MODE
} = available_feature_flags

const SIXTY_SECONDS = 60

const exportDashboard = (dashboardId) => {
  exportAsImage(
    "dashboard-grid-container",
    () => document.getElementsByClassName("dashboard-grid-container")[0],
    `dashboard-${dashboardId}`
  )
}

export const formatInterval = (interval) => {
  if (interval > SIXTY_SECONDS) {
    return `${interval / SIXTY_SECONDS}m`
  } else {
    return `${interval}s`
  }
}

export const LeftWrapper = (props) => {
  const {
    clearFilterSetCrossFilters,
    toggleFilterByName,
    toggleFilterX,
    omnifilters,
    numActiveFiltersForSelectedFilterSet,
    selectedFilterSet,
    showAdvancedFilterControls,
    filterValidator
  } = props

  const toggleAll = () => {
    const filters =
      selectedFilterSet && selectedFilterSet.filters
        ? selectedFilterSet.filters
        : []

    // If there are no active filters, we want to toggle to true.
    // If there are any active filters, we want to toggle to false.
    const newValue = numActiveFiltersForSelectedFilterSet === 0

    filters.forEach((name) => {
      const filter = omnifilters.find((f) => f.name === name)
      if (filter) {
        // if the filter isn't validated, don't do anything. Just ignore it.
        if (filterValidator(filter) === false) {
          return
        }
        if (isOldFilter(filter)) {
          toggleFilterX(name, newValue)
        } else {
          toggleFilterByName(name, newValue)
        }
      }
    })
  }

  const numValidFiltersForFilterSet =
    selectedFilterSet &&
    selectedFilterSet.filters.reduce((num, filterName) => {
      if (filterValidator({ name: filterName }) === true) {
        num += 1
      }
      return num
    }, 0)

  return (
    <div className="left-wrapper">
      <ImmerseUIRequired uiKey={IMMERSE_UI_FILTER_SETS}>
        <FilterSetsList
          toggleAllFilters={toggleAll}
          numActiveFiltersForSelectedFilterSet={
            numActiveFiltersForSelectedFilterSet
          }
          numValidFiltersForFilterSet={numValidFiltersForFilterSet}
          showAdvancedFilterControls={showAdvancedFilterControls}
        />
      </ImmerseUIRequired>
      {!getFeatureFlag(KIOSK_MODE) && (
        <FilterSetsCrossFilter
          redrawAll={props.redrawAll}
          clearFilterSetCrossFilters={clearFilterSetCrossFilters}
          omnifilters={omnifilters}
          selectedFilterSet={selectedFilterSet}
        />
      )}
      {getFeatureFlag(ENABLE_ANNOTATIONS) && !getFeatureFlag(KIOSK_MODE) && (
        <ImmerseUIRequired uiKey={IMMERSE_UI_ANNOTATION}>
          <AnnotationsControls />
        </ImmerseUIRequired>
      )}
    </div>
  )
}

LeftWrapper.propTypes = {
  showAdvancedFilterControls: PropTypes.bool.isRequired,
  toggleFilterByName: PropTypes.func.isRequired,
  toggleFilterX: PropTypes.func.isRequired,
  omnifilters: PropTypes.arrayOf(PropTypes.object),
  clearDashboardFilter: PropTypes.func,
  numActiveFiltersForSelectedFilterSet: PropTypes.number
}

export const CenterWrapper = ({
  dashboardTitle,
  dashboardTitleFormatted,
  handleUpdateDashboardName,
  route,
  currentDataSource,
  parameters,
  dashboardTitleValid,
  setDashboardTitleValid
}) => (
  <div className="center-wrapper">
    <div className="dashboard-name">
      <DashboardTopPanelTitle
        {...{
          dashboardTitle,
          dashboardTitleFormatted,
          handleUpdateDashboardName,
          parameters,
          dashboardTitleValid,
          setDashboardTitleValid
        }}
      />
    </div>
    {(inDashboard(route) || onEditPath(route)) && currentDataSource && (
      <MultiCount />
    )}
  </div>
)

CenterWrapper.propTypes = {
  dashboardTitle: PropTypes.string.isRequired,
  saveState: dashboardSaveStateShape.isRequired,
  parameters: PropTypes.object,
  handleUpdateDashboardName: PropTypes.func
}

export const RightWrapper = ({
  dashboardTitle,
  isDemo,
  streamingInterval,
  isRefreshing,
  refreshDashboard,
  setStreamingInterval,
  dashboardId,
  privileges,
  userPrivileges,
  addNewChart,
  saveState,
  saveDashboard,
  isSharingRestricted,
  restrictViewing,
  setDashboardTitleValid,
  roles
}) => {
  const validateAndSaveDashboard = (e) => {
    if (!dashboardTitle || !dashboardTitle.length) {
      setDashboardTitleValid(false)
      return
    }
    setDashboardTitleValid(true)
    saveDashboard(e)
  }
  const chartsCount = useChartsCount()
  const chartsLimit = getFeatureFlag(LIMIT_CHARTS_PER_DASHBOARD)

  const isTrialMode = isUserExportDisabled(roles)
  const canExport =
    !isTrialMode && getFeatureFlag(ENABLE_DASHBOARD_IMAGE_EXPORT)

  return (
    <div className="right-wrapper">
      {canExport && (
        <Tooltip
          content={"Export dashboard as image"}
          enterDelay={500}
          align="right"
        >
          <div
            className={cx("export-dashboard-as-image")}
            id="export-dashboard-as-image"
            onClick={() => exportDashboard(dashboardId)}
          >
            <Icon icon="photo_camera" className="icon" />
          </div>
        </Tooltip>
      )}
      {!isDemo && !getFeatureFlag(KIOSK_MODE) && (
        <div
          className={cx(
            "dashboard-action",
            "streaming-btn",
            { "streaming-active": Boolean(streamingInterval) },
            { disabled: isRefreshing }
          )}
        >
          <div
            className={cx("loading-gfx-refresh", {
              "loading-gfx-hide": !isRefreshing
            })}
          >
            <div className="main-loading-icon" />
          </div>

          <ImmerseUIRequired uiKey={IMMERSE_UI_REFRESH}>
            <div className="dashboard-action" onClick={refreshDashboard}>
              <IconRefresh2 className="icon" />
              {streamingInterval > 0 && (
                <span className="streaming-badge">
                  {formatInterval(streamingInterval)}
                </span>
              )}
              {!getFeatureFlag(GLOBAL_SIDE_NAV) && (
                <div className="icon-label">Refresh</div>
              )}
            </div>
            {getFeatureFlag(ENABLE_AUTO_DASHBOARD_REFRESH) && (
              <div className="streaming-dropdown">
                <PrimaryButton
                  className="refresh-now-btn"
                  data-testid="refresh-now-btn"
                  onClick={refreshDashboard}
                >
                  Refresh Now
                </PrimaryButton>
                <div className={"update-interval-text"}>Auto Refresh</div>
                <CustomSelector
                  className="streaming-interval-dropdown"
                  currentValue={streamingInterval}
                  hideOnMouseLeave
                  onChange={setStreamingInterval}
                  options={
                    // If configured in servers.json, this includes a 2 second refresh option
                    // and ensures it displays in the right order
                    APP_CONFIG.enable_2s_refresh_rate
                      ? AUTO_REFRESH_VALUES.concat([
                          AUTO_REFRESH_VALUE_2S
                        ]).sort((a, b) => a.value - b.value)
                      : AUTO_REFRESH_VALUES
                  }
                  renderOption={({ label }) => (
                    <div>
                      <span>{label}</span>
                    </div>
                  )}
                />
              </div>
            )}
          </ImmerseUIRequired>
        </div>
      )}
      {dashboardId &&
        privileges.editDashboard &&
        !isSharingRestricted &&
        !getFeatureFlag(KIOSK_MODE) && <ShareLink />}
      {(privileges.editDashboard || userPrivileges.createDashboard) &&
        getFeatureFlag(GLOBAL_SIDE_NAV) &&
        !getFeatureFlag(KIOSK_MODE) && <DashboardKebab />}
      {(!dashboardId || privileges.editDashboard) &&
        !saveState.isLink &&
        !isDemo &&
        !getFeatureFlag(KIOSK_MODE) && (
          <ImmerseUIRequired uiKey={IMMERSE_UI_SAVE}>
            <div>
              <SecondaryButton
                className={cx(
                  "button save save-button",
                  { "is-saving": saveState.request },
                  { success: saveState.isSaved }
                )}
                id="dashboard-save"
                data-testid="save-dashboard-button"
                icon={<IconSave className="button-icon" />}
                onClick={validateAndSaveDashboard}
              >
                {saveState.isSaved ? "Saved" : "Save *"}
              </SecondaryButton>
            </div>
          </ImmerseUIRequired>
        )}
      {!restrictViewing && !getFeatureFlag(KIOSK_MODE) && (
        <ImmerseUIRequired uiKey={IMMERSE_UI_ADD_CHART}>
          {chartsLimit > 0 && chartsCount >= chartsLimit ? (
            <Tooltip
              content={`Disabled because the administrative chart limit is currently set to ${chartsLimit}`}
              enterDelay={200}
            >
              <div>
                <PrimaryButton
                  className="add-chart"
                  id="dashboard-add-chart"
                  data-testid="dashboard-add-chart"
                  onClick={addNewChart}
                  icon={
                    getFeatureFlag(GLOBAL_SIDE_NAV) ? null : { icon: "add" }
                  }
                  disabled
                >
                  Add Chart
                </PrimaryButton>
              </div>
            </Tooltip>
          ) : (
            <div>
              <PrimaryButton
                className="add-chart"
                id="dashboard-add-chart"
                data-testid="dashboard-add-chart"
                onClick={addNewChart}
                icon={getFeatureFlag(GLOBAL_SIDE_NAV) ? null : { icon: "add" }}
              >
                Add Chart
              </PrimaryButton>
            </div>
          )}
        </ImmerseUIRequired>
      )}
      {getFeatureFlag(GLOBAL_SIDE_NAV) ? (
        <ImmerseUIRequired uiKey={IMMERSE_UI_USER_DROPDOWN}>
          <AccountPanel />
        </ImmerseUIRequired>
      ) : (
        (privileges.editDashboard || userPrivileges.createDashboard) && (
          <DashboardKebab />
        )
      )}
    </div>
  )
}

RightWrapper.propTypes = {
  addNewChart: PropTypes.func.isRequired,
  dashboardId: PropTypes.number,
  isDemo: PropTypes.bool.isRequired,
  isOwner: PropTypes.bool.isRequired,
  isRefreshing: PropTypes.bool,
  privileges: PropTypes.shape({
    deleteDashboard: PropTypes.bool,
    viewDashboard: PropTypes.bool,
    editDashboard: PropTypes.bool
  }),
  userPrivileges: PropTypes.shape({
    createDashboard: PropTypes.bool,
    createTable: PropTypes.bool,
    fetchComplete: PropTypes.bool,
    viewSqlEditor: PropTypes.bool
  }),
  refreshDashboard: PropTypes.func,
  saveDashboard: PropTypes.func.isRequired,
  saveState: dashboardSaveStateShape.isRequired,
  setStreamingInterval: PropTypes.func,
  streamingInterval: PropTypes.number.isRequired,
  isSharingRestricted: PropTypes.bool,
  roles: PropTypes.arrayOf(PropTypes.string)
}

const DashboardTopPanel = (props) => {
  const [dashboardTitleValid, setDashboardTitleValid] = useState(true)
  return (
    <ImmerseUIRequired uiKey={IMMERSE_UI_HEADERBAR} type={REMOVE_BY_NO_DISPLAY}>
      <div data-testid="dashboard-top-panel" className={"dashboard-top-panel"}>
        {getFeatureFlag(GLOBAL_SIDE_NAV) ? (
          <div className="dashboard-top-panel-inner">
            <div id="side-nav-dash-panel">
              <LogoParent />
              <CenterWrapper
                {...{
                  ...props,
                  dashboardTitleValid,
                  setDashboardTitleValid
                }}
              />
            </div>
            <LeftWrapper {...props} />

            <RightWrapper
              {...{
                ...props,
                setDashboardTitleValid
              }}
            />
          </div>
        ) : (
          <div className="dashboard-top-panel-inner">
            <LeftWrapper {...props} />
            <CenterWrapper
              {...{
                ...props,
                dashboardTitleValid,
                setDashboardTitleValid
              }}
            />
            <RightWrapper
              {...{
                ...props,
                setDashboardTitleValid
              }}
            />
          </div>
        )}
      </div>
    </ImmerseUIRequired>
  )
}

DashboardTopPanel.defaultProps = {
  isDemo: false
}

DashboardTopPanel.propTypes = {
  ...LeftWrapper.propTypes,
  ...CenterWrapper.propTypes,
  ...RightWrapper.propTypes
}

export default DashboardTopPanel
