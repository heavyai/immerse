// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CONNECTION_ERROR,
  CONNECTION_REQUEST,
  CONNECTION_SUCCESS,
  DROP_CONNECTION,
  INIT_HEAVYDB_SESSION,
  LOAD_GEOJSON_CONFIG,
  RETURN_ON_LOGIN,
  SET_DATABASE_NAME,
  SET_CONNECTION_INFO,
  SET_USER_ROLES,
  SET_USER_DATA,
  GET_HARDWARE_INFO_SUCCESS
} from "constants/action-types"
import { fetchJsonPromiseSameOrigin } from "utils/fetch-json-promise"
import { setUIThemeDefault } from "utils/dark-mode-switcher"
import APP_CONFIG from "constants/app-config"
import browserCookies from "browser-cookies"
import { SESSION_AUTHORIZED_COOKIE } from "constants/saml"
import { DEFAULT_PAGE_TITLE } from "constants/text"
import { setCustomTitle, setCustomMetadata } from "utils/page-and-meta-helpers"
import {
  initConnectorErrorListener,
  initConnectorMethodCalledListener
} from "actions/connector-event-listeners"
import { enableCookieHandler } from "constants/feature-flags"
import Services, { spoofDbConnector } from "services/immerse"
import {
  fetchSessionDurations,
  fetchSessionInfoAction,
  initLogoutListener,
  setIdleSessionDuration,
  setIdleTimeout,
  setMaxSessionDuration,
  setMaxTimeout,
  setSessionValid
} from "actions/session-action-creators"
import {
  createSessionWithTimeout,
  getAllRolesForUser,
  modifySessionDurations
} from "services/session"
import { getUserPrivileges } from "actions/privileges-thunks"
import { initializeProductTour } from "services/product-tour"
import { replace } from "connected-react-router"
import { getDatabase } from "selectors"
import {
  setServersJSONColors,
  setDatabaseStyles,
  fetchConfigurationDB,
  setThemeTint,
  setCustomThemeEnabled,
  SET_UI_THEME
} from "actions/user-configurable-ui-action-creators"
import { initializeAvailableBasemaps } from "charts/raster-chart/basemap"
import { isServiceError } from "../services/util/is-service-error.util"
import { setDefaultImmerseUIKeys } from "services/immerse-ui-provider"
import { createExternalListeners } from "services/external-messenger-api/ExternalMessenger"
import { getConfigurationInstance } from "services/configuration-instance"
import {
  initRefreshListener,
  updateConfigInstanceCache
} from "./refresh-action-creators"

export const setAppConfig = () => (dispatch) => {
  const serversJson = APP_CONFIG
  if (serversJson) {
    // Normalize serversJson structure due to artifact from past attempts
    // at "client-side load balancing"
    const serverConfig = APP_CONFIG
    dispatch(setConnectionInfo(serverConfig))
    return serverConfig
  } else {
    const error = new Error(
      "Application config not found. Please ensure servers.json is available on server."
    )
    dispatch(connectionError(error))
    return error
  }
}

export function connectionRequest(user) {
  return {
    type: CONNECTION_REQUEST,
    user
  }
}

export function setConnectionInfo(user) {
  createExternalListeners(user.event_origins)
  setDefaultImmerseUIKeys(user.immerse_ui_keys, user.immerse_ui_embed_keys)
  return {
    type: SET_CONNECTION_INFO,
    user
  }
}

export const setUserData = (user) => ({
  user,
  type: SET_USER_DATA
})

export function connectionError(error) {
  // This console lets us actually see what went wrong in the massive try-catch
  // in initHeavyDBSession() without it just being swallowed.
  // eslint-disable-next-line no-console
  console.error(error)
  return {
    type: CONNECTION_ERROR,
    error
  }
}

export function connectionSuccess(sessionId, sessionInfo, statuses, GTM) {
  return {
    type: CONNECTION_SUCCESS,
    sessionId,
    sessionInfo,
    statuses,
    GTM
  }
}

export function returnOnLogin(path) {
  return {
    type: RETURN_ON_LOGIN,
    payload: path
  }
}

export function loadGeoJsonConfig(config) {
  return {
    type: LOAD_GEOJSON_CONFIG,
    config
  }
}

export function fetchGeoJsonConfig() {
  return (dispatch) =>
    fetchJsonPromiseSameOrigin("/geojson/geoconfig.json").then((config) => {
      dispatch(loadGeoJsonConfig(config))
    })
}

const handleGetHardwareInfo = (connector) => async (dispatch) => {
  const { hardware_info } = await connector.getHardwareInfoAsync()
  dispatch({ type: GET_HARDWARE_INFO_SUCCESS, hardware_info })

  return hardware_info
}

export const handleGetUserRoles = (isSuperuser) => async (
  dispatch,
  getState
) => {
  const {
    connection: { sessionInfo: { user: username } = {} } = {}
  } = getState()

  let roles = []
  if (username) {
    try {
      const roleResults = await getAllRolesForUser(username)
      if (roleResults.ok) {
        roles = await roleResults.json()
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("An exception occurred in handleGetUserRoles : ", e)
    }
  }

  dispatch(setUserRoles(isSuperuser, roles))
}

const handleRouting = (loadDashboard) => (dispatch, getState) => {
  const {
    connection: { loadLink, returnOnLogin: loginReturnPath } = {}
  } = getState()
  if (loadDashboard && !loadLink && loginReturnPath === "/") {
    dispatch(replace(`/${getDatabase(getState())}/dashboard/${loadDashboard}`))
  } else {
    // this logic is squirrelly. We want to go to a /:database root URL for the
    // dashboard list instead of just /. Surely there's a better way to do it,
    // but for now let's circle back.
    const routedPath =
      loginReturnPath === "/"
        ? `/${getDatabase(getState())}${loginReturnPath}dashboards`
        : loginReturnPath
    dispatch(replace(routedPath))
  }
}

export const handleCustomStyles = (customStyles = {}) => (dispatch) => {
  // Data coming from servers.json
  const { colors = {}, title = "", metadata = "" } = customStyles

  // Send colors from servers.json to redux
  if (Object.keys(colors).length !== 0) {
    dispatch(setServersJSONColors(colors))
  }
  // Send DB styles from webserver to redux
  // TODO: update this when window.DB_CONFIG is fixed
  fetchConfigurationDB()
    .then((res) => {
      dispatch(setDatabaseStyles(res))
    })
    .catch((e) => {
      dispatch(setDatabaseStyles({}))
      // eslint-disable-next-line no-console
      console.error(e)
    })

  if (title !== "") {
    setCustomTitle(title)
  }
  setCustomMetadata(metadata)
}

export const loadConfigurationInstance = () => async (dispatch) => {
  try {
    const resp = await getConfigurationInstance()
    const data = await resp.json()
    if (data?.theming) {
      dispatch(setUserData({ customStyles: data.theming }))
      if (data.theming.themeTint) {
        dispatch(setThemeTint(data.theming.themeTint))
      }
      if (data.theming?.customThemeEnabled) {
        dispatch(setCustomThemeEnabled(data.theming.customThemeEnabled))
      }
      if (data.theming?.defaultTheme) {
        setUIThemeDefault(data.theming.defaultTheme)
      }
    }
    if (data?.colors) {
      dispatch(setServersJSONColors(data.colors))
    }
    // set custom title if it exists, if not use default title
    setCustomTitle(data?.theming?.title || DEFAULT_PAGE_TITLE)

    updateConfigInstanceCache(data)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching configuration instance:", error)
  }
}

export const initHeavyDBSession = (config) => async (dispatch, getState) => {
  const {
    connection: { user: { database } = {}, user } = {},
    session: { valid: sessionValid } = {}
  } = getState()

  const basemapPromise = initializeAvailableBasemaps(user)
  const connector = Services.get("DbCon")

  browserCookies.erase(SESSION_AUTHORIZED_COOKIE)
  dispatch(connectionRequest(config))
  dispatch({
    type: INIT_HEAVYDB_SESSION,
    config
  })

  try {
    dispatch(initConnectorErrorListener())
    enableCookieHandler()
    spoofDbConnector({ ...config, database })

    const preConnectTime = performance.now()
    if (!sessionValid) {
      await createSessionWithTimeout({
        database,
        ...config
      })
    }
    const postConnectTime = performance.now()
    dispatch(setSessionValid())
    const connectTimeDelta = Math.round(postConnectTime - preConnectTime)

    const fetchedSessionDurations = await fetchSessionDurations()
    if (isServiceError(fetchedSessionDurations)) {
      // eslint-disable-next-line no-console
      console.error(fetchedSessionDurations)
    }

    const sessionDurations = modifySessionDurations(
      fetchedSessionDurations,
      connectTimeDelta
    )

    const sessionInfo = await dispatch(fetchSessionInfoAction())

    dispatch(setIdleSessionDuration(sessionDurations.idleSessionDuration))
    dispatch(setMaxSessionDuration(sessionDurations.maxSessionDuration))
    dispatch(setIdleTimeout())
    dispatch(setMaxTimeout())

    dispatch(initLogoutListener())
    dispatch(initConnectorMethodCalledListener())
    dispatch(fetchGeoJsonConfig())
    dispatch(handleCustomStyles(config.customStyles))
    dispatch(initRefreshListener())

    const connectionStatuses = await connector.getStatusAsync()
    await dispatch(
      connectionSuccess(
        connector.sessionId(),
        sessionInfo,
        connectionStatuses,
        config.GTM
      )
    )

    await dispatch(handleGetHardwareInfo(connector))

    await dispatch(handleGetUserRoles(sessionInfo.is_super))
    await dispatch(getUserPrivileges(sessionInfo.database))

    if (user.walkme) {
      initializeProductTour()
    }
    await basemapPromise
    dispatch(handleRouting(config.loadDashboard))
  } catch (e) {
    dispatch(connectionError(e))
  }
}

export function disconnect() {
  return { type: DROP_CONNECTION }
}

export function setDatabaseName(database) {
  return {
    type: SET_DATABASE_NAME,
    database
  }
}

export function setUserRoles(isSuperuser, roles) {
  return {
    type: SET_USER_ROLES,
    payload: { isSuperuser, roles }
  }
}
