// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as NavBarActions from "actions/nav-bar-action-creators"
import * as UserConfigActions from "actions/user-configurable-ui-action-creators"
import { currentBasemapValue } from "charts/raster-chart/basemap"
import Services from "services/immerse"
import React from "react"
import { connect } from "react-redux"
import Logo from "components/logo/logo"
import { Dispatch } from "redux"
import cx from "classnames"
import { NavLink, Link, Route } from "react-router-dom"
import history from "services/history"
import { WARNING } from "constants/modal-types"
import { setCurrentTheme } from "utils/dark-mode-switcher"
import { openUrlInWindow } from "utils/navigation"
import JupyterButton from "components/jupyter/JupyterButton"
import { User } from "reducers/connection"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import {
  hideModal,
  showModal,
  showDashboardImportModal
} from "actions/ui-action-creators"
import { initializeDashboard } from "actions/dashboards-action-creator"
import {
  ImmerseUIRequired,
  IMMERSE_UI_NAVBAR,
  IMMERSE_UI_DATA_MANAGER,
  IMMERSE_UI_DASHBOARDS,
  IMMERSE_UI_SQL_EDITOR,
  IMMERSE_UI_USER_DROPDOWN,
  IMMERSE_UI_JUPYTER_LABS,
  IMMERSE_UI_SQL_NOTEBOOK
} from "services/immerse-ui-provider"

import {
  inDashboard,
  atDashboardsList,
  atLoginPath,
  atLoggedOutPath,
  routeToSqlEditor,
  routeToDataManager,
  routeToDashboardsList,
  getNavigationTitle,
  routeToSqlNotebook
} from "utils/routerPath"
import AccountPanel from "components/account-panel/account-panel-parent"

import { Tooltip } from "@rmwc/tooltip"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import IconImport from "components/svg-icons/icon-import"
import { IMPORT_DASHBOARD_TEXT, NEW_DASHBOARD_TEXT } from "constants/dashboards"
import AddTableButton from "components/data-manager/add-table-button"
import {
  ROUTE_DATA_MANAGEMENT,
  ROUTE_DATA_MANAGEMENT_IMPORT
} from "routes/paths"
import ImportTableRouteTitle from "components/data-manager/import-table-route-title"
import IconBeta from "components/svg-icons/icon-beta"
import { isSqlNotebookEnabled } from "utils/is-sql-notebook-enabled"

export interface MappedProps {
  appVersion: string
  connected: boolean
  isDemo: boolean
  isTrial: boolean
  isRenderingEnabled: boolean
  isMSDEnabled: boolean
  hasCustomHomeRoute: boolean
  helpMenuOpen: boolean
  userMenuOpen: boolean
  disableHelpMenu: boolean
  enableSqlEditor: boolean
  route: string
  coreVersion: string
  user: User
  username: string
  database: string
  charts: any
  themeTint: number
  warnDashboardUnsaved: boolean
  title: string
  canCreateTable: boolean
  canEditDashboard: boolean
  isSideNavPinned: boolean
  showUnsavedChangesDialog: boolean
}

export function mapStateToProps(state): MappedProps {
  return {
    title: state.dashboard.title,
    appVersion: state.connection.appVersion,
    connected: state.connection.isConnected,
    isTrial: false,
    isDemo: state.connection.isDemo,
    canCreateTable: state.connection.privileges.createTable,
    user: state.connection.user,
    username: state.connection.sessionInfo?.user,
    database: state.connection.sessionInfo?.database,
    hasCustomHomeRoute: Boolean(
      state.connection.isDemo ||
        state.connection.user.customStyles?.logoClickURL
    ),
    isRenderingEnabled: state.connection.isRenderingEnabled,
    isMSDEnabled: state.connection.isMSDEnabled,
    helpMenuOpen: state.navBar.helpMenuOpen,
    userMenuOpen: state.navBar.userMenuOpen,
    disableHelpMenu: Boolean(
      state.connection.user.customStyles &&
        state.connection.user.customStyles.disableHelpMenu
    ),
    enableSqlEditor:
      state.connection.privileges.viewSqlEditor &&
      !getFeatureFlag(available_feature_flags.DISABLE_SQL_EDITOR),
    canEditDashboard: Boolean(
      state.connection.isSuperuser ||
        (!state.connection.isDemo && state.dashboard.privileges.editDashboard)
    ),
    route: state.router.location.pathname,
    coreVersion: state.connection.version,
    charts: state.charts,
    themeTint: state.userConfigurableUI.themeTint,
    warnDashboardUnsaved: Boolean(
      inDashboard(state.router.location.pathname) &&
        state.dashboard.saveState.warnUnsaved
    ),
    showUnsavedChangesDialog: state.navBar?.showUnsavedChangesDialog ?? false
  }
}

type NoopFunction = () => void
export interface MappedDispatch {
  dispatch: Dispatch
  actions: {
    initializeDashboard: Function
    showDashboardImportModal: Function
    discardUnsavedDashboardChanges: Function
    discardUnsavedChanges: Function
    disconnect: NoopFunction
    cancelQueries: NoopFunction
    navigateHome: React.EventHandler<React.MouseEvent>
    navigateToHomeOverride: NoopFunction
    goToCommunityForum: NoopFunction
    goToDocumentation: NoopFunction
    goToTutorials: NoopFunction
    setThemeTint: Function
    toggleUserMenu: React.EventHandler<React.MouseEvent>
    handleAboutClick: React.EventHandler<React.MouseEvent>
  }
}

export function mapDispatchToProps(dispatch): MappedDispatch {
  return {
    dispatch,
    actions: {
      initializeDashboard() {
        dispatch(initializeDashboard())
      },
      showDashboardImportModal() {
        dispatch(showDashboardImportModal())
      },
      discardUnsavedDashboardChanges(nextAction: Function) {
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
      discardUnsavedChanges(nextAction: Function) {
        dispatch(
          showModal({
            type: WARNING,
            heading: "Discard Unsaved Changes",
            content:
              "This page contains unsaved changes. Are you sure you want to discard your changes?",
            primaryAction: {
              action: () => {
                dispatch(UserConfigActions.resetThemeTint())
                dispatch(UserConfigActions.resetUITheme())
                dispatch(NavBarActions.showUnsavedChangesDialog(false))
                nextAction()
              },
              text: "Yes, Discard Changes"
            },
            secondaryAction: {
              action: hideModal,
              text: "No, Cancel"
            }
          })
        )
      },
      cancelQueries() {
        dispatch(
          showModal({
            type: WARNING,
            heading: "Confirm Query Cancellation",
            content:
              "Are you sure you want to cancel all running and pending queries for this user's database session?",
            primaryAction: {
              action: () => dispatch(NavBarActions.cancelQueries()),
              text: "Yes, Cancel Queries"
            },
            secondaryAction: {
              action: hideModal,
              text: "No"
            }
          })
        )
      },
      disconnect() {
        dispatch(NavBarActions.executeLogout())
      },
      navigateHome(e: MouseEvent) {
        if (e && e.metaKey) {
          openUrlInWindow(`/`, e.shiftKey)
        } else {
          dispatch(NavBarActions.handleHomeClick())
        }
      },
      navigateToHomeOverride() {
        dispatch(NavBarActions.routeToHomeOverride())
      },
      goToCommunityForum() {
        dispatch(NavBarActions.routeToCommunityForum())
      },
      goToDocumentation() {
        dispatch(NavBarActions.routeToDocumentation())
      },
      goToTutorials() {
        dispatch(NavBarActions.routeToTutorials())
      },
      toggleUserMenu() {
        dispatch(NavBarActions.toggleUserMenu())
      },
      setThemeTint(color) {
        dispatch(UserConfigActions.setThemeTint(color))
      },
      handleAboutClick(specs: MouseEvent) {
        dispatch(NavBarActions.handleAboutClick(specs))
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
      }
    }
  }
}

export interface DropdownLink {
  icon: JSX.Element
  id: string
  onClick: React.EventHandler<React.MouseEvent>
  text: string
  condition?: boolean
}
type Props = MappedProps & MappedDispatch
export interface MergedProps extends Props {
  handleHomeClick: React.EventHandler<React.MouseEvent>
  provideNavWarning: (e: React.MouseEvent, dest: string) => void
}

export function mergeProps(
  stateProps: MappedProps,
  dispatchProps: MappedDispatch,
  ownProps: {}
) {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    handleHomeClick() {
      const clickAction = stateProps.hasCustomHomeRoute
        ? dispatchProps.actions.navigateToHomeOverride
        : dispatchProps.actions.navigateHome
      if (stateProps.warnDashboardUnsaved && stateProps.canEditDashboard) {
        return dispatchProps.actions.discardUnsavedDashboardChanges(clickAction)
      } else if (stateProps.showUnsavedChangesDialog) {
        return dispatchProps.actions.discardUnsavedChanges(clickAction)
      }
      return clickAction()
    },
    provideNavWarning(e: MouseEvent, dest: string) {
      if (e && e.metaKey) {
        openUrlInWindow(dest, e.shiftKey)
        return
      }
      if (stateProps.showUnsavedChangesDialog) {
        e.preventDefault()
        dispatchProps.actions.discardUnsavedChanges(() => history.push(dest))
      } else if (
        !stateProps.warnDashboardUnsaved ||
        !getFeatureFlag(available_feature_flags.WARN_UNSAVED_DASHBOARD) ||
        !stateProps.canEditDashboard
      ) {
        return
      } else {
        e.preventDefault()
        dispatchProps.actions.discardUnsavedDashboardChanges(() =>
          history.push(dest)
        )
      }
    }
  }
}

export function NavigationBarContainer({
  isDemo,
  isSideNavPinned,
  handleHomeClick,
  provideNavWarning,
  connected,
  actions,
  route,
  helpMenuOpen,
  enableSqlEditor,
  database
}: MappedProps & MappedDispatch & MergedProps) {
  const { GLOBAL_SIDE_NAV } = available_feature_flags
  const showNavigationControls =
    connected && !isDemo && !atLoginPath(route) && !atLoggedOutPath(route)

  return (
    <ImmerseUIRequired uiKey={IMMERSE_UI_NAVBAR}>
      <nav
        className={cx("main-nav", {
          "is-side-nav-enabled": getFeatureFlag(GLOBAL_SIDE_NAV),
          "show-side-nav-trigger": showNavigationControls,
          "is-side-nav-pinned": isSideNavPinned
        })}
      >
        <div className="main-nav-logo" onClick={handleHomeClick}>
          <Logo />
        </div>
        {showNavigationControls &&
          (getFeatureFlag(GLOBAL_SIDE_NAV) ? (
            <div className="nav-buttons">
              <div className="nav-group">
                {getNavigationTitle(route) !== "Dashboard" && (
                  <span
                    className={cx("main-nav__title", {
                      "settings-main-nav__title":
                        getNavigationTitle(route) === "Control Panel"
                    })}
                  >
                    {getNavigationTitle(route)}
                  </span>
                )}
                {getNavigationTitle(route) === "Control Panel" && (
                  <span className="settings-nav-header-icon">
                    <IconBeta />
                  </span>
                )}
              </div>
              {getFeatureFlag(GLOBAL_SIDE_NAV) && (
                <div className="nav-center-header">
                  <Route
                    path={`${ROUTE_DATA_MANAGEMENT_IMPORT}/:connectorType?`}
                  >
                    <ImportTableRouteTitle />
                  </Route>
                </div>
              )}
              <div className="right-nav-buttons">
                {getNavigationTitle(route) === "Dashboards" && (
                  <ImmerseUIRequired uiKey={IMMERSE_UI_DASHBOARDS}>
                    <Tooltip content={IMPORT_DASHBOARD_TEXT} enterDelay={500}>
                      <button
                        style={{ height: "28px" }}
                        className="button import-dashboard-button"
                        data-testid="import-dashboard-button"
                        onClick={actions.showDashboardImportModal}
                      >
                        <IconImport style={{ height: "28px" }} />
                      </button>
                    </Tooltip>
                    <PrimaryButton
                      className="new-dashboard"
                      disabled={isDemo}
                      id="new-dashboard"
                      data-testid="new-dashboard-button"
                      onClick={actions.initializeDashboard}
                    >
                      {NEW_DASHBOARD_TEXT}
                    </PrimaryButton>
                  </ImmerseUIRequired>
                )}
                {getNavigationTitle(route) === "Data Manager" && (
                  <AddTableButton />
                )}
                <Route path={`${ROUTE_DATA_MANAGEMENT_IMPORT}/:connectorType?`}>
                  <Link to={`/${database}/data-manager`}>
                    <SecondaryButton onClick={() => {}}>
                      {"Back to Tables"}
                    </SecondaryButton>
                  </Link>
                </Route>
                <ImmerseUIRequired uiKey={IMMERSE_UI_DASHBOARDS}>
                  <AccountPanel />
                </ImmerseUIRequired>
              </div>
            </div>
          ) : (
            <div className="nav-buttons">
              <div className="nav-group">
                <ImmerseUIRequired uiKey={IMMERSE_UI_DASHBOARDS}>
                  <NavLink
                    className="button home"
                    activeClassName="active"
                    isActive={(match) => match && !helpMenuOpen}
                    id="dashboards"
                    data-testid="dashboards-nav-link"
                    to={routeToDashboardsList(database)}
                    onClick={(e) =>
                      provideNavWarning(e, routeToDashboardsList(database))
                    }
                  >
                    {"Dashboards"}
                  </NavLink>
                </ImmerseUIRequired>

                <ImmerseUIRequired uiKey={IMMERSE_UI_DATA_MANAGER}>
                  <NavLink
                    className="button nav-data-manager"
                    activeClassName="active"
                    isActive={(match) => match && !helpMenuOpen}
                    id="data-manager"
                    to={routeToDataManager(database)}
                    onClick={(e) =>
                      provideNavWarning(e, routeToDataManager(database))
                    }
                  >
                    {"Data Manager"}
                  </NavLink>
                </ImmerseUIRequired>

                {enableSqlEditor && (
                  <ImmerseUIRequired uiKey={IMMERSE_UI_SQL_EDITOR}>
                    <NavLink
                      className="button nav-sql-editor"
                      activeClassName="active"
                      isActive={(match) => match && !helpMenuOpen}
                      id="sql-editor"
                      to={routeToSqlEditor(database)}
                      onClick={(e) =>
                        provideNavWarning(e, routeToSqlEditor(database))
                      }
                    >
                      {"SQL Editor"}
                    </NavLink>
                  </ImmerseUIRequired>
                )}
                {isSqlNotebookEnabled() && (
                  <ImmerseUIRequired uiKey={IMMERSE_UI_SQL_NOTEBOOK}>
                    <NavLink
                      className="button nav-sql-notebook"
                      activeClassName="active"
                      isActive={(match) => Boolean(match && !helpMenuOpen)}
                      id="sql-notebook"
                      to={routeToSqlNotebook(database)}
                      onClick={(e) =>
                        provideNavWarning(e, routeToSqlNotebook(database))
                      }
                    >
                      {"SQL Notebook"}
                    </NavLink>
                  </ImmerseUIRequired>
                )}
              </div>
              <div className="right-nav-buttons">
                <Route path={ROUTE_DATA_MANAGEMENT} exact>
                  <AddTableButton />
                </Route>
                <ImmerseUIRequired uiKey={IMMERSE_UI_JUPYTER_LABS}>
                  <JupyterButton iconOnly />
                </ImmerseUIRequired>
                <ImmerseUIRequired uiKey={IMMERSE_UI_USER_DROPDOWN}>
                  <AccountPanel />
                </ImmerseUIRequired>
                <div className="account-panel-cloud">
                  <a className="button" href="/myaccount">
                    Account
                  </a>
                </div>
              </div>
            </div>
          ))}
      </nav>
    </ImmerseUIRequired>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(NavigationBarContainer)
