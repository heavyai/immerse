// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"
import { withRouter } from "react-router"
import PropTypes from "prop-types"
import cx from "classnames"
import AppOverlay from "components/app-overlay/app-overlay"
import NavigationBarContainer from "components/navigation-bar/navigation-bar-container"
import GlobalSideNav, {
  PIN_GLOBAL_SIDE_NAV_CACHE_KEY
} from "components/global-side-nav/GlobalSideNav"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { setUserAgent } from "actions/app-action-creators"
import {
  initHeavyDBSession,
  returnOnLogin,
  setAppConfig,
  setUserData,
  loadConfigurationInstance
} from "actions/connection-action-creators"
import { importableStore as store } from "store/importableStore"
import { validateSession } from "services/session"
import { hasCredentials } from "utils/app-config"
import MockConnectorMenu from "components/mock-connector"
import {
  setSessionInvalid,
  setSessionValid,
  updateSessionInfoAction
} from "actions/session-action-creators"
import resetAppState from "actions/reset-app-state-action-creator"
import { RMWCProvider } from "@rmwc/provider"
import { SnackbarQueue } from "@rmwc/snackbar"
import { snackbarMessages } from "services/snackbar"
import "@material/snackbar/dist/mdc.snackbar.css"
import {
  retrieveFromLocalStorage,
  storeInLocalStorage
} from "utils/local-storage"
import { getNavigationTitle } from "utils/routerPath"
import { withMuiTheme } from "utils/with-theme"

const { ENABLE_MOCK_CONNECTOR, GLOBAL_SIDE_NAV } = available_feature_flags

const handleReturnOnLoginAction = (router, connection) => (dispatch) => {
  const pathname = router && router.location && router.location.pathname
  const LOGIN_PATH = "/login"

  // Modify returnOnLogin redirect if we get an old hash-based-routing URL
  const hashPath = window.location.hash && window.location.hash.slice(1)
  if (hashPath) {
    dispatch(returnOnLogin(hashPath === LOGIN_PATH ? "/" : hashPath))
  } else {
    const returnPath = pathname.match(`${LOGIN_PATH}$`)
      ? connection.returnOnLogin
      : // The pathname doesn't include any query parameters that were in the
        // URL, so we have to manually add them back
        pathname + (router?.location?.search || "")

    dispatch(returnOnLogin(returnPath))
  }
}

class AppContainer extends PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]).isRequired
  }

  constructor(props) {
    super(props)
    this.initializeApp(props)
  }

  state = {
    initialized: false,
    isSideNavPinned: retrieveFromLocalStorage(PIN_GLOBAL_SIDE_NAV_CACHE_KEY, {
      defaultValue: true,
      asJSON: true
    })
  }

  async initializeApp(props) {
    const { dispatch, getState } = store

    const { connection, router } = getState()

    // withRouter props
    const { history } = props

    history.listen(async (location, action) => {
      const {
        connection: { sessionInfo }
      } = getState()

      if (action === "POP") {
        if (location.pathname === "/") {
          dispatch(resetAppState())
        }

        const urlDbName = location.pathname.split("/")[1]
        if (sessionInfo && urlDbName && urlDbName !== sessionInfo.database) {
          await dispatch(updateSessionInfoAction())
        }
      }
    })

    const appConfig = dispatch(setAppConfig())
    dispatch(setUserAgent(window.navigator.userAgent))

    const result = await validateSession()

    dispatch(loadConfigurationInstance())

    const autoLoginEnabled = hasCredentials(appConfig)

    if (!result.ok) {
      dispatch(setSessionInvalid())
    } else {
      const parsedSessionBody = await result.json()
      await dispatch(setSessionValid())
      await dispatch(
        setUserData({
          ...connection.user,
          username: parsedSessionBody.username
        })
      )
    }

    dispatch(handleReturnOnLoginAction(router, connection))
    if (result.ok || (!result.ok && autoLoginEnabled)) {
      await dispatch(initHeavyDBSession(appConfig))
    }
    this.setState({ initialized: true })
  }

  toggleSideNavIsPinned = () => {
    storeInLocalStorage(
      PIN_GLOBAL_SIDE_NAV_CACHE_KEY,
      !this.state.isSideNavPinned
    )
    this.setState({
      isSideNavPinned: !this.state.isSideNavPinned
    })
  }

  render() {
    if (this.state.initialized) {
      return (
        <div
          className={cx("app", {
            "is-side-nav-enabled": getFeatureFlag(GLOBAL_SIDE_NAV),
            "is-side-nav-pinned":
              getFeatureFlag(GLOBAL_SIDE_NAV) && this.state.isSideNavPinned
          })}
        >
          <RMWCProvider ripple={false}>
            <div id="custom-dialog-root" />
            <div id="custom-portal-root" />
            <AppOverlay />
            {getFeatureFlag(ENABLE_MOCK_CONNECTOR) && <MockConnectorMenu />}
            {getFeatureFlag(GLOBAL_SIDE_NAV) ? (
              <>
                <GlobalSideNav
                  isPinned={this.state.isSideNavPinned}
                  setIsPinned={this.toggleSideNavIsPinned}
                />
                <section className="app-content">
                  {!["Dashboard", "Editor"].includes(
                    getNavigationTitle(window.location.pathname)
                  ) && (
                    <NavigationBarContainer
                      isSideNavPinned={this.state.isSideNavPinned}
                    />
                  )}
                  {this.props.children}
                </section>
              </>
            ) : (
              <>
                <NavigationBarContainer />
                {this.props.children}
              </>
            )}
            <SnackbarQueue messages={snackbarMessages} />
          </RMWCProvider>
        </div>
      )
    } else {
      return <></>
    }
  }
}

export default withRouter(withMuiTheme(AppContainer))
