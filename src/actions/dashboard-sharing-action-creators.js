// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { difference } from "ramda"

import {
  OPEN_DASHBOARD_SHARE_MODAL,
  OPEN_DASHBOARD_BULK_SHARE_MODAL,
  CLOSE_DASHBOARD_SHARE_MODAL,
  GET_ALL_USERS_AND_ROLES,
  GET_DASHBOARD_GRANTEES,
  POPULATE_DASHBOARD_SHARED_USERS_LIST,
  UPDATE_DASHBOARD_SHARED_USERS_LIST,
  ADD_DASHBOARD_SHARED_USER,
  REMOVE_DASHBOARD_SHARED_USER,
  UPDATE_DASHBOARD_SHARE_AUTOSUGGEST_VALUE,
  UPDATE_DASHBOARD_SHARE_SUGGESTIONS
} from "constants/action-types"

export function openDashboardShareModal() {
  return {
    type: OPEN_DASHBOARD_SHARE_MODAL
  }
}

export function openDashboardBulkShareModal() {
  return {
    type: OPEN_DASHBOARD_BULK_SHARE_MODAL
  }
}

export function closeDashboardShareModal() {
  return {
    type: CLOSE_DASHBOARD_SHARE_MODAL
  }
}

export function populateDashboardSharedUsersList(payload) {
  return {
    type: POPULATE_DASHBOARD_SHARED_USERS_LIST,
    payload
  }
}

export function addDashboardSharedUser(user) {
  return {
    type: ADD_DASHBOARD_SHARED_USER,
    user
  }
}

export function removeDashboardSharedUser(user) {
  return {
    type: REMOVE_DASHBOARD_SHARED_USER,
    user
  }
}

export function updateDashboardSharedUsersList(payload) {
  return {
    type: UPDATE_DASHBOARD_SHARED_USERS_LIST,
    payload
  }
}

export function updateDashboardAutosuggestValue(value) {
  return {
    type: UPDATE_DASHBOARD_SHARE_AUTOSUGGEST_VALUE,
    value
  }
}

export function updateDashboardShareSuggestions(payload) {
  return {
    type: UPDATE_DASHBOARD_SHARE_SUGGESTIONS,
    payload
  }
}

const getAllUsersAndRoles = () => (dispatch, _getState, services) => {
  const DbCon = services.get("DbCon")
  dispatch({
    type: GET_ALL_USERS_AND_ROLES,
    payload: Promise.all([
      DbCon.getUsersAsync(),
      DbCon.getRolesAsync()
    ]).then(([users, roles]) => ({ users, roles }))
  })
}

export const initializeDashboardSharingModal = (dashboardId) => (
  dispatch,
  _getState,
  services
) => {
  dispatch(getAllUsersAndRoles())

  const DbCon = services.get("DbCon")
  dispatch({
    type: GET_DASHBOARD_GRANTEES,
    payload: DbCon.getDashboardGranteesAsync(dashboardId)
  })

  dispatch(openDashboardShareModal())
}

export const initializeDashboardBulkSharingModal = () => (dispatch) => {
  dispatch(getAllUsersAndRoles())
  dispatch(updateDashboardSharedUsersList([]))
  dispatch(openDashboardBulkShareModal())
}

export const shareDashboard = (dashboardId, sharedUsersList) => (
  dispatch,
  getState,
  services
) => {
  const DbCon = services.get("DbCon")

  const {
    dashboardSharing: { originalSharedUsersList }
  } = getState()

  const sharedUsersListIds = sharedUsersList.map((user) => user.id)
  const originalSharedUsersListIds = originalSharedUsersList.map(
    (user) => user.id
  )

  // share_dashboard is used to grant permissions and unshare_dashboard to revoke -
  // thus, we need to get the delta of the absolute list to update
  const grantList = difference(sharedUsersListIds, originalSharedUsersListIds)
  const revokeList = difference(originalSharedUsersListIds, sharedUsersListIds)

  Promise.all([
    DbCon.shareDashboardAsync(dashboardId, grantList, [], {
      view_: true
    }),
    DbCon.unshareDashboardAsync(dashboardId, revokeList, [], {
      view_: true
    })
  ]).then(() => {
    dispatch(closeDashboardShareModal())
  })
}
