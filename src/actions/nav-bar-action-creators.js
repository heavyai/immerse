// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { push } from "connected-react-router"

import { getDatabase } from "selectors"
import { routeToDashboardsList } from "utils/routerPath"

import * as ActionTypes from "constants/action-types"
import { destroyAllSessions } from "../services/session"
import { thriftInterruptAsync } from "services/thrift/interrupt"

import { WARNING } from "constants/modal-types"
import { hideModal, showModal } from "actions/ui-action-creators"
import {
  available_feature_flags,
  getFeatureFlag
} from "../components/control-panel/featureflags"
import { thriftInterrupt } from "../services/thrift/interrupt"

export const toggleUserMenu = (status) => ({
  type: ActionTypes.TOGGLE_USER_MENU,
  status
})

export const toggleDocsMenu = (status) => ({
  type: ActionTypes.TOGGLE_DOCS_MENU,
  status
})

export const showUnsavedChangesDialog = (visible) => ({
  type: ActionTypes.SHOW_UNSAVED_CHANGES_DIALOG,
  visible
})

export function routeToHomeOverride() {
  return {
    type: ActionTypes.ROUTE_TO_HOME_OVERRIDE
  }
}

export function routeToCommunityForum() {
  return {
    type: ActionTypes.ROUTE_TO_COMMUNITY_FORUM
  }
}

export function routeToDocumentation() {
  return {
    type: ActionTypes.ROUTE_TO_DOCUMENTATION
  }
}

export function routeToTutorials() {
  return {
    type: ActionTypes.ROUTE_TO_TUTORIALS
  }
}

export const executeLogout = () => (dispatch) => {
  getFeatureFlag(available_feature_flags.INTERRUPT_SESSION_QUERIES) &&
    thriftInterrupt()
  dispatch(handleLogoutClick())
}

export function handleLogoutClick() {
  return {
    type: ActionTypes.HANDLE_LOGOUT_CLICK,
    destroySessionMethod: destroyAllSessions
  }
}

export const cancelQueries = () => async (dispatch) => {
  const result = await thriftInterruptAsync()

  if (!result.ok) {
    dispatch(
      showModal({
        type: WARNING,
        heading: "Query Cancellation Failed",
        content:
          "Query interrupt is not currently enabled on this instance. Talk to your system administrator to enable that HeavyDB feature.",
        primaryAction: {
          action: hideModal,
          text: "OK"
        }
      })
    )
  }
}

export function handleHomeClick() {
  return {
    type: ActionTypes.HANDLE_HOME_CLICK
  }
}

export function handleAboutClick(specs) {
  return {
    type: ActionTypes.HANDLE_ABOUT_CLICK,
    specs
  }
}

export const navigateToDashboardsList = () => (dispatch, getState) => {
  const route = routeToDashboardsList(getDatabase(getState()))

  dispatch(push(route))
}
