// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { NavLink } from "react-router-dom"
import cx from "classnames"
import { Tooltip } from "@rmwc/tooltip"

import {
  atDashboardsList,
  inDashboard,
  atLoginPath,
  atLoggedOutPath,
  routeToSqlEditor,
  routeToDataManager,
  routeToDashboardsList,
  routeToSqlNotebook
} from "utils/routerPath"
import { debounce, throttle } from "lodash"

import IconHamburger from "components/svg-icons/icon-hamburger"
import IconDashboards from "components/svg-icons/icon-chart"
import IconDataManager from "components/svg-icons/icon-data-rows"
import JupyterButton from "components/jupyter/JupyterButton"
import AccountPanel from "components/account-panel/account-panel"
import {
  unsavedWrapDatabaseChangeHandler,
  unsavedLogoutClickHandler
} from "utils/unsaved-dashboard-helpers"

import {
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
} from "components/navigation-bar/navigation-bar-container"

import {
  ImmerseUIRequired,
  IMMERSE_UI_GLOBAL_SIDE_NAV,
  IMMERSE_UI_GLOBAL_SIDE_NAV_TOGGLE,
  IMMERSE_UI_DATA_MANAGER,
  IMMERSE_UI_DASHBOARDS,
  IMMERSE_UI_SQL_EDITOR,
  IMMERSE_UI_USER_DROPDOWN,
  IMMERSE_UI_JUPYTER_LABS
} from "services/immerse-ui-provider"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import "./GlobalSideNav.scss"
import { IconConsole } from "components/svg-icons/icon-console"
import { isSqlNotebookEnabled } from "utils/is-sql-notebook-enabled"
import { useImmerseUITheme } from "utils/theme/use-immerse-ui-theme"
import { ImmerseUITheme } from "utils/theme/types"

export const PIN_GLOBAL_SIDE_NAV_CACHE_KEY = "pinGlobalSideNav"
const { GLOBAL_SIDE_NAV } = available_feature_flags

const GlobalSideNav = ({
  isDemo,
  isPinned,
  setIsPinned,
  connected,
  actions,
  route,
  helpMenuOpen,
  userMenuOpen,
  helpDropdownLinks,
  disableHelpMenu,
  enableSqlEditor,
  database,
  username,
  user,
  charts,
  themeTint,
  unsavedDashboard,
  provideNavWarning,
  canEditDashboard
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { setTheme } = useImmerseUITheme()
  useEffect(() => {
    // Don't leave menus protruding if side nav is closed
    if (!(isExpanded || isPinned)) {
      if (helpMenuOpen) {
        actions.toggleHelpMenu()
      }
    }
  }, [isExpanded, isPinned, helpMenuOpen, actions])

  const showNavigationLinks =
    connected && !isDemo && !atLoginPath(route) && !atLoggedOutPath(route)

  // Without debouncing the mouse leave action it's really difficult for a user
  // to get to the account actions at the bottom of the side nav without the menu closing
  const debouncedMouseLeave = debounce(() => setIsExpanded(false), 800)

  const throttledSetThemeTint = throttle(
    (color) => actions.setThemeTint(color),
    200
  )

  return (
    showNavigationLinks && (
      <ImmerseUIRequired uiKey={IMMERSE_UI_GLOBAL_SIDE_NAV}>
        <div className="global-side-nav">
          <ImmerseUIRequired uiKey={IMMERSE_UI_GLOBAL_SIDE_NAV_TOGGLE}>
            <Tooltip
              activateOn="hover"
              showArrow
              align="right"
              enterDelay={500}
              content={isPinned ? "Unpin navigation" : "Pin navigation"}
            >
              <div
                className="global-side-nav__trigger"
                data-testid="global-side-nav-trigger"
                onClick={() => setIsPinned(!isPinned)}
                onMouseEnter={() => {
                  debouncedMouseLeave.cancel()
                  setIsExpanded(true)
                }}
                onMouseLeave={debouncedMouseLeave}
              >
                <IconHamburger />
              </div>
            </Tooltip>
          </ImmerseUIRequired>
          <nav
            onMouseEnter={() => {
              debouncedMouseLeave.cancel()
              setIsExpanded(true)
            }}
            onMouseLeave={debouncedMouseLeave}
            className={cx("global-side-nav__panel", {
              "is-expanded": isExpanded,
              "is-pinned": isPinned
            })}
          >
            <div className="nav-group">
              <ImmerseUIRequired uiKey={IMMERSE_UI_DASHBOARDS}>
                <Tooltip
                  activateOn="hover"
                  showArrow
                  enterDelay={500}
                  align="right"
                  content="Dashboards"
                  open={!isPinned && !isExpanded ? false : undefined}
                >
                  <NavLink
                    className=""
                    activeClassName="is-active"
                    id="dashboards"
                    isActive={(match, location) =>
                      match ||
                      atDashboardsList(location.pathname) ||
                      inDashboard(location.pathname)
                    }
                    data-testid="dashboards-nav-link"
                    to={routeToDashboardsList(database)}
                    onClick={(e) =>
                      provideNavWarning(e, routeToDashboardsList(database))
                    }
                  >
                    <IconDashboards className="side-nav-icon" />
                    <span style={{ display: "block", fontSize: "0.5em" }}>
                      Dashboards
                    </span>
                  </NavLink>
                </Tooltip>
              </ImmerseUIRequired>
              <ImmerseUIRequired uiKey={IMMERSE_UI_DATA_MANAGER}>
                <Tooltip
                  activateOn="hover"
                  showArrow
                  enterDelay={500}
                  align="right"
                  content="Data Manager"
                  open={!isPinned && !isExpanded ? false : undefined}
                >
                  <NavLink
                    className=""
                    activeClassName="is-active"
                    id="data-manager"
                    to={routeToDataManager(database)}
                    onClick={(e) =>
                      provideNavWarning(e, routeToDataManager(database))
                    }
                  >
                    <IconDataManager className="side-nav-icon" />
                    <span style={{ display: "block", fontSize: "0.6em" }}>
                      Data
                    </span>
                  </NavLink>
                </Tooltip>
              </ImmerseUIRequired>
              {enableSqlEditor && (
                <ImmerseUIRequired uiKey={IMMERSE_UI_SQL_EDITOR}>
                  <Tooltip
                    activateOn="hover"
                    showArrow
                    enterDelay={500}
                    align="right"
                    content="SQL Editor"
                    open={!isPinned && !isExpanded ? false : undefined}
                  >
                    <NavLink
                      className=""
                      activeClassName="is-active"
                      id="sql-editor"
                      to={routeToSqlEditor(database)}
                      onClick={(e) =>
                        provideNavWarning(e, routeToSqlEditor(database))
                      }
                    >
                      SQL
                      <span style={{ display: "block", fontSize: "0.6em" }}>
                        Editor
                      </span>
                    </NavLink>
                  </Tooltip>
                </ImmerseUIRequired>
              )}
              <ImmerseUIRequired uiKey={IMMERSE_UI_JUPYTER_LABS}>
                <Tooltip
                  activateOn="hover"
                  showArrow
                  enterDelay={500}
                  align="right"
                  content="Jupyter"
                  open={!isPinned && !isExpanded ? false : undefined}
                >
                  <JupyterButton iconOnly />
                </Tooltip>
              </ImmerseUIRequired>

              {isSqlNotebookEnabled() && (
                <Tooltip
                  activateOn="hover"
                  showArrow
                  enterDelay={500}
                  align="right"
                  content="SQL Notebook"
                  open={!isPinned && !isExpanded ? false : undefined}
                >
                  <NavLink
                    activeClassName="is-active"
                    id="sql-notebook"
                    to={routeToSqlNotebook(database)}
                    onClick={(e) =>
                      provideNavWarning(e, routeToSqlNotebook(database))
                    }
                  >
                    <IconConsole className="side-nav-icon" />
                  </NavLink>
                </Tooltip>
              )}
            </div>
            {!getFeatureFlag(GLOBAL_SIDE_NAV) && (
              <footer className="nav-footer">
                <ImmerseUIRequired uiKey={IMMERSE_UI_JUPYTER_LABS}>
                  <JupyterButton iconOnly />
                </ImmerseUIRequired>
                <ImmerseUIRequired uiKey={IMMERSE_UI_USER_DROPDOWN}>
                  <AccountPanel
                    {...{
                      isOpen: userMenuOpen,
                      onToggleOpen: actions.toggleUserMenu,
                      username,
                      wrapDatabaseChange: (next) =>
                        unsavedWrapDatabaseChangeHandler({
                          next,
                          actions,
                          unsavedDashboard
                        }),
                      themeTint,
                      onThemeSelection: (themeName) => {
                        setTheme(themeName as ImmerseUITheme)
                        actions.setCurrentTheme(themeName, charts, user)
                        actions.toggleUserMenu()
                      },
                      onTintSelection: (color) => {
                        throttledSetThemeTint(color)
                      },
                      onCancelClick: actions.cancelQueries,
                      onLogoutClick: () => {
                        unsavedLogoutClickHandler(
                          {
                            actions,
                            unsavedDashboard,
                            canEditDashboard
                          },
                          () => setIsExpanded(false)
                        )
                      },
                      helpLinks: helpDropdownLinks,
                      disableHelpMenu,
                      showUsage: false
                    }}
                  />

                  <div className="account-panel-cloud">
                    <a className="button" href="/myaccount">
                      Account
                    </a>
                  </div>
                </ImmerseUIRequired>
              </footer>
            )}
          </nav>
        </div>
      </ImmerseUIRequired>
    )
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(GlobalSideNav)
