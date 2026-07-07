// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as ActionTypes from "constants/action-types"
import * as ConnectionActions from "actions/connection-action-creators"
import { all, call, put, select, takeEvery } from "redux-saga/effects"
import {
  COMMUNITY_URL,
  DEMO_URL,
  DOCUMENTATION_URL,
  TUTORIALS_URL
} from "constants/hyperlinks"
import { clearDashboard } from "actions/dashboard-action-creators"
import { push } from "connected-react-router"
import resetAppState from "actions/reset-app-state-action-creator"
import { showModal } from "actions/ui-action-creators"
import {
  clearIdleTimeout,
  clearLogoutListener,
  clearMaxTimeout,
  setSessionInvalid
} from "actions/session-action-creators"
import { navigateToDashboardsList } from "actions/nav-bar-action-creators"
import Services from "../services/immerse"
import { noop } from "../utils/helpers"
import { clearRefreshListener } from "../actions/refresh-action-creators"

export function* handleRouting(action) {
  const LOGO_URL = yield select(
    ({
      connection: { user: { customStyles: { logoClickURL } = {} } = {} } = {}
    }) => logoClickURL
  )

  switch (action.type) {
    case ActionTypes.ROUTE_TO_COMMUNITY_FORUM:
      yield call([window, "open"], COMMUNITY_URL)
      return
    case ActionTypes.ROUTE_TO_HOME_OVERRIDE:
      yield call([window, "open"], LOGO_URL || DEMO_URL)
      return
    case ActionTypes.ROUTE_TO_DOCUMENTATION:
      yield call([window, "open"], DOCUMENTATION_URL)
      return
    case ActionTypes.ROUTE_TO_TUTORIALS:
      yield call([window, "open"], TUTORIALS_URL)
      return
    default:
      return
  }
}

function* handleLogout({ destroySessionMethod = noop }) {
  clearIdleTimeout()
  clearMaxTimeout()
  yield put(clearDashboard())
  yield put(resetAppState())

  clearLogoutListener()
  clearRefreshListener()
  const connector = Services.get("DbCon")
  connector.events.removeAllListeners("error")

  destroySessionMethod()
  // If SAML is enabled, going to the login screen will put the user into a
  // deadend flow, since we don't have a "login w/ Okta" button, or something
  // similar. So we instead take you to a dedicated, stand-alone "logged out"
  // page, with a button that will allow the user to go back through the SAML
  // auth flow.
  const inSAML = yield select(
    ({ connection: { user: { SAMLurl } = {} } = {} }) => Boolean(SAMLurl)
  )
  if (inSAML) {
    yield put(push("/logged-out"))
  } else {
    yield put(push("/login"))
  }

  yield put(setSessionInvalid())
  // Resets the connection status in the Redux state
  yield put(ConnectionActions.disconnect())
}

function* handleHome() {
  yield put(navigateToDashboardsList())
}

function* handleAbout(action) {
  yield put(showModal(action.specs))
}

export default function* routingRootSaga() {
  yield all([
    takeEvery(ActionTypes.ROUTE_TO_COMMUNITY_FORUM, handleRouting),
    takeEvery(ActionTypes.ROUTE_TO_HOME_OVERRIDE, handleRouting),
    takeEvery(ActionTypes.ROUTE_TO_DOCUMENTATION, handleRouting),
    takeEvery(ActionTypes.ROUTE_TO_TUTORIALS, handleRouting),
    takeEvery(ActionTypes.HANDLE_HOME_CLICK, handleHome),
    takeEvery(ActionTypes.HANDLE_LOGOUT_CLICK, handleLogout),
    takeEvery(ActionTypes.HANDLE_ERROR_LOGOUT, handleLogout),
    takeEvery(ActionTypes.HANDLE_ABOUT_CLICK, handleAbout)
  ])
}
