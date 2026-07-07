// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { connect } from "react-redux"
import * as NavBarActions from "actions/nav-bar-action-creators"
import { hideModal, showModal } from "actions/ui-action-creators"
import { inDashboard } from "utils/routerPath"
import { openUrlInWindow } from "utils/navigation"
import { unsavedWrapDatabaseChangeHandler } from "utils/unsaved-dashboard-helpers"
import { WARNING } from "constants/modal-types"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { setCurrentTheme } from "utils/dark-mode-switcher"
import Services from "services/immerse"
import { currentBasemapValue } from "charts/raster-chart/basemap"

import AccountPanel from "./account-panel"
import { useImmerseUITheme } from "utils/theme/use-immerse-ui-theme"
import { ImmerseUITheme } from "utils/theme/types"
import DocsPanel from "components/docs-panel/docs-panel"

function mapStateToProps(state) {
  return {
    appVersion: state.connection.appVersion,
    coreVersion: state.connection.version,
    userMenuOpen: state.navBar?.userMenuOpen,
    docsMenuOpen: state.navBar?.docsMenuOpen,
    user: state.connection.user,
    username: state.connection.sessionInfo?.user,
    database: state.connection.sessionInfo?.database,
    charts: state.charts,
    hasCustomHomeRoute: Boolean(
      state.connection.isDemo ||
        state.connection.user.customStyles?.logoClickURL
    ),
    unsavedDashboard: Boolean(
      inDashboard(state.router.location.pathname) &&
        !state.dashboard.saveState.isSaved
    ),
    canEditDashboard: Boolean(
      state.connection.isSuperuser ||
        (!state.connection.isDemo && state.dashboard.privileges.editDashboard)
    ),
    canViewKeyManager:
      getFeatureFlag(available_feature_flags.ENABLE_KEY_MANAGER) &&
      state.connection.isSuperuser,
    isSuperuser: state.connection.isSuperuser
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      navigateHome(e) {
        if (e && e.metaKey) {
          openUrlInWindow(`/`, e.shiftKey)
        } else {
          dispatch(NavBarActions.handleHomeClick())
        }
      },
      navigateToHomeOverride() {
        dispatch(NavBarActions.routeToHomeOverride())
      },
      discardUnsavedDashboardChanges(nextAction) {
        if (getFeatureFlag(available_feature_flags.WARN_UNSAVED_DASHBOARD)) {
          dispatch(
            showModal({
              type: WARNING,
              heading: "Discard Unsaved Changes",
              content:
                "This dashboard contains unsaved changes. Are you sure you want to discard your changes?",
              primaryAction: {
                action: () => nextAction(),
                text: "Yes, Discard Changes"
              },
              secondaryAction: {
                action: hideModal,
                text: "No, Cancel"
              }
            })
          )
        } else {
          nextAction()
        }
      },
      toggleUserMenu() {
        dispatch(NavBarActions.toggleUserMenu())
      },
      toggleDocsMenu() {
        dispatch(NavBarActions.toggleDocsMenu())
      },
      handleDocsClick() {
        window.open("https://docs.heavy.ai", "_blank")
      },
      cancelQueries() {
        dispatch(NavBarActions.cancelQueries())
      },
      setCurrentTheme(themeName, charts) {
        setCurrentTheme(themeName)

        Object.values(charts).forEach((chart) => {
          const RasterChart = Services.get("dc").getChart(chart.dcFlag)
          if (
            RasterChart &&
            RasterChart.mapStyle &&
            (!chart.basemap || chart.basemap.value === "current")
          ) {
            RasterChart.mapStyle(currentBasemapValue(chart))
            RasterChart.renderAsync()
          }
        })
      },
      handleLogoutClick() {
        dispatch(NavBarActions.toggleUserMenu())
        dispatch(NavBarActions.handleLogoutClick())
      }
    }
  }
}

export function mergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    handleHomeClick() {
      const clickAction = stateProps.hasCustomHomeRoute
        ? dispatchProps.actions.navigateToHomeOverride
        : dispatchProps.actions.navigateHome
      if (stateProps.unsavedDashboard && stateProps.canEditDashboard) {
        return dispatchProps.actions.discardUnsavedDashboardChanges(clickAction)
      }
      return clickAction()
    },
    helpDropdownLinks: []
  }
}

const AccountPanelParent = ({
  actions,
  userMenuOpen,
  docsMenuOpen,
  helpDropdownLinks,
  username,
  user,
  database,
  charts,
  unsavedDashboard,
  isSuperuser
}) => {
  const { setTheme } = useImmerseUITheme()
  return (
    <>
      <DocsPanel
        isOpen={docsMenuOpen}
        onToggleOpen={actions.toggleDocsMenu}
        onDocsClick={actions.handleDocsClick}
      />
      <AccountPanel
        {...{
          isOpen: userMenuOpen,
          onToggleOpen: actions.toggleUserMenu,
          username,
          database,
          wrapDatabaseChange: (next) =>
            unsavedWrapDatabaseChangeHandler({
              next,
              actions,
              unsavedDashboard
            }),
          onThemeSelection: (themeName) => {
            setTheme(themeName as ImmerseUITheme)
            actions.setCurrentTheme(themeName, charts, user)
            actions.toggleUserMenu()
          },
          onCancelClick: actions.cancelQueries,
          onLogoutClick: actions.handleLogoutClick,
          helpLinks: helpDropdownLinks,
          isSuperuser
        }}
      />
    </>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(AccountPanelParent)
