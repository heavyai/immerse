// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  HANDLE_ERROR_LOGOUT,
  HANDLE_LOGOUT_CLICK,
  SET_IDLE_SESSION_DURATION,
  SET_MAX_SESSION_DURATION,
  SET_SESSION_INVALID,
  SET_SESSION_VALID,
  UPDATE_SESSION_INFO
} from "constants/action-types"
import { setAppError } from "actions/app-action-creators"
import {
  destroyAllSessions,
  destroySession,
  getSessionDurations,
  getSessionDurationsCurrent
} from "services/session"
import { BACKEND_ERROR_SESSION_NOT_VALID } from "utils/error-handling-helpers"
import Services from "../services/immerse"

export const setSessionValid = () => ({
  type: SET_SESSION_VALID
})

export const setSessionInvalid = () => ({
  type: SET_SESSION_INVALID
})

const MAX_32BIT_INT = 0x7fffffff

// JS setTimeout() will only support up to a 32bit, signed int for timeout
// durations (~24.8 days). So we're just capping any durations someone might
// set over that limit.
const capMaxSetTimeoutValue = (milliseconds) => {
  return milliseconds > MAX_32BIT_INT ? MAX_32BIT_INT : milliseconds
}

const SESSION_TIMEOUT_PADDING = 10000

let idleSessionTimeoutHandle = null
let maxSessionTimeoutHandle = null

export const fetchSessionDurations = async () => {
  const durationsResp = await getSessionDurations()
  return durationsResp.ok
    ? await durationsResp.json()
    : new Error(
        `Fetching session durations returned ${durationsResp.status} code`
      )
}

export const setIdleSessionDuration = (idleSessionDuration) => ({
  type: SET_IDLE_SESSION_DURATION,
  idleSessionDuration: capMaxSetTimeoutValue(idleSessionDuration)
})

export const setMaxSessionDuration = (maxSessionDuration) => ({
  type: SET_MAX_SESSION_DURATION,
  maxSessionDuration: capMaxSetTimeoutValue(maxSessionDuration)
})

export const clearIdleTimeout = () => clearTimeout(idleSessionTimeoutHandle)

export const clearMaxTimeout = () => clearTimeout(maxSessionTimeoutHandle)

const getIdleSessionDuration = async () => {
  const sessionDurationResp = await getSessionDurationsCurrent()
  if (!sessionDurationResp.ok) {
    return 0
  }
  const responseBody = await sessionDurationResp.json()
  return responseBody.idleDuration - SESSION_TIMEOUT_PADDING
}

export function handleErrorLogout(destroySessionMethod) {
  return {
    type: HANDLE_ERROR_LOGOUT,
    destroySessionMethod
  }
}

const setSessionTimeout = (duration, destroySessionMethod, dispatch) =>
  setTimeout(() => {
    dispatch(handleErrorLogout(destroySessionMethod))
    dispatch(setAppError(undefined, BACKEND_ERROR_SESSION_NOT_VALID))
  }, duration)

const setIdleSessionTimeout = (duration, destroySessionMethod, dispatch) =>
  setTimeout(async () => {
    const remainingDuration = await getIdleSessionDuration()
    if (remainingDuration > SESSION_TIMEOUT_PADDING * 2) {
      // The idle timeout on the real session is not imminent as we guessed -
      // just reset to this new source of truth instead
      dispatch(setIdleSessionDuration(remainingDuration))
      // eslint-disable-next-line no-use-before-define, @typescript-eslint/no-use-before-define
      dispatch(setIdleTimeout())
    } else {
      dispatch(handleErrorLogout(destroySessionMethod))
      dispatch(setAppError(undefined, BACKEND_ERROR_SESSION_NOT_VALID))
    }
  }, duration)

export const setIdleTimeout = () => (dispatch, getState) => {
  const {
    session: { idleSessionDuration }
  } = getState()

  clearIdleTimeout()

  idleSessionTimeoutHandle = setIdleSessionTimeout(
    idleSessionDuration - SESSION_TIMEOUT_PADDING,
    destroySession,
    dispatch
  )
}

export const setMaxTimeout = () => (dispatch, getState) => {
  const {
    session: { maxSessionDuration }
  } = getState()

  clearMaxTimeout()

  maxSessionTimeoutHandle = setSessionTimeout(
    maxSessionDuration - SESSION_TIMEOUT_PADDING,
    destroyAllSessions,
    dispatch
  )
}
export const fetchSessionInfoAction = () => {
  const connector = Services.get("DbCon")
  return async () => {
    return await connector.getSessionInfoAsync()
  }
}
export const updateSessionInfoAction = () => async (dispatch) => {
  const sessionInfo = await dispatch(fetchSessionInfoAction())
  await dispatch({
    type: UPDATE_SESSION_INFO,
    sessionInfo
  })
}

// eslint-disable-next-line init-declarations
let logoutListenerIntervalId

const logoutListener = (dispatch) => () => {
  // Logout message defined in web server: internal/util/auth.go
  const logoutMessage = "logout-initiated"
  const loggedOut = document.cookie.includes(logoutMessage)
  if (loggedOut) {
    dispatch({
      type: HANDLE_LOGOUT_CLICK
    })
  }
}

export const initLogoutListener = () => (dispatch) => {
  logoutListenerIntervalId = window.setInterval(logoutListener(dispatch), 1000)
}

export const clearLogoutListener = () =>
  window.clearInterval(logoutListenerIntervalId)
