// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"
import {
  CLEAR_ALL_DASHBOARD_SELECTIONS,
  CONFIRM_DELETE_DASHBOARD_ERROR,
  CONFIRM_GET_DASHBOARDS_ERROR,
  CONFIRM_LOAD_DASHBOARD_DATA_ACCESS_ERROR,
  DELETE_DASHBOARD_DONE,
  DELETE_DASHBOARD_ERROR,
  DELETE_DASHBOARD_REQUEST,
  DELETE_DASHBOARD_SUCCESS,
  DESELECT_ALL_DASHBOARDS_IN_LIST,
  GET_DASHBOARDS_ERROR,
  GET_DASHBOARDS_REQUEST,
  GET_DASHBOARDS_SUCCESS,
  SELECT_ALL_DASHBOARDS_IN_LIST,
  TOGGLE_DASHBOARD,
  TRACK_INITIALIZE_DASHBOARD
} from "constants/action-types"

import { delay } from "utils/redux/delay-middleware"
import { push } from "connected-react-router"
import { MS_IN_HALF_SECONDS } from "constants/magic-variables"
import { getDatabase } from "selectors"

import { snackbarNotify } from "services/snackbar"
import { hideModal, modalLoading, showModal } from "./ui-action-creators"
import {
  DANGER as DANGER_MODAL_TYPE,
  INFO as INFO_MODAL_TYPE
} from "constants/modal-types"

export const getDashboardsRequest = ({ hideLoadingOverlay }) => ({
  type: GET_DASHBOARDS_REQUEST,
  hideLoadingOverlay
})

export const getDashboardsError = (error) => ({
  type: GET_DASHBOARDS_ERROR,
  error
})

export const getDashboardsSuccess = (response) => ({
  type: GET_DASHBOARDS_SUCCESS,
  response
})

export const confirmGetDashboardsError = () => ({
  type: CONFIRM_GET_DASHBOARDS_ERROR
})

export const confirmLoadDashboardDataAccessError = () => ({
  type: CONFIRM_LOAD_DASHBOARD_DATA_ACCESS_ERROR
})

export function getDashboards({ hideLoadingOverlay } = {}) {
  return (dispatch, getState, services) => {
    dispatch(getDashboardsRequest({ hideLoadingOverlay }))
    return services
      .get("DbCon")
      .getDashboardsAsync()
      .then((dashboards) => {
        // parse formatted names if present
        const dashboardsWithFormattedTitle = dashboards.map((dashboard) => {
          if (
            !dashboard.dashboard_metadata ||
            !dashboard.dashboard_metadata.includes("dashboard_name_formatted")
          ) {
            return dashboard
          }

          let dashboard_name_formatted = "Untitled"
          try {
            dashboard_name_formatted = JSON.parse(dashboard.dashboard_metadata)
              .dashboard_name_formatted
          } catch (error) {
            dashboard_name_formatted = "Untitled"
          }

          return { ...dashboard, dashboard_name_formatted }
        })

        dispatch(getDashboardsSuccess(dashboardsWithFormattedTitle))
      })
      .catch((error) => {
        dispatch(getDashboardsError(error))
      })
  }
}

export function initializeDashboard() {
  return (dispatch, getState) => {
    dispatch({
      type: TRACK_INITIALIZE_DASHBOARD
    })
    dispatch(push(`/${getDatabase(getState())}/dashboard`))
  }
}

export const deleteDashboardRequest = (id) => ({
  type: DELETE_DASHBOARD_REQUEST,
  id
})

export const deleteDashboardError = () => ({
  type: DELETE_DASHBOARD_ERROR
})

export const confirmDeleteDashboardError = () => ({
  type: CONFIRM_DELETE_DASHBOARD_ERROR
})

export const deleteDashboardSuccess = (id) => (dispatch) => {
  dispatch({ type: DELETE_DASHBOARD_DONE })
  dispatch(
    delay(() => {
      dispatch({ type: DELETE_DASHBOARD_SUCCESS, id })
    }, MS_IN_HALF_SECONDS)
  )
}

export function deleteDashboard(id) {
  return (dispatch, getState, services) => {
    dispatch(deleteDashboardRequest(id))
    return services
      .get("DbCon")
      .deleteDashboardAsync(id)
      .then(() => dispatch(deleteDashboardSuccess(id)))
      .catch(() => dispatch(deleteDashboardError()))
  }
}

export const toggleDashboard = (id) => ({
  type: TOGGLE_DASHBOARD,
  id
})

export const selectAllDashboardsInList = (ids) => ({
  type: SELECT_ALL_DASHBOARDS_IN_LIST,
  ids
})

export const deselectAllDashboardsInList = (ids) => ({
  type: DESELECT_ALL_DASHBOARDS_IN_LIST,
  ids
})

export const clearAllDashboardSelections = () => ({
  type: CLEAR_ALL_DASHBOARD_SELECTIONS
})

export const bulkExport = () => async (dispatch, getState) => {
  const ids = Array.from(getState().dashboards.selected)
  if (ids.length > 0) {
    dispatch(modalLoading(`Exporting ${ids.length} dashboards...`))

    const form = document.createElement("form")
    form.action = `${APP_CONFIG.url}/dashboards/export`
    form.method = "POST"
    form.target = "_blank"

    ids.forEach((id) => {
      const hidden = document.createElement("input")
      hidden.type = "hidden"
      hidden.name = "ids"
      hidden.value = id

      form.appendChild(hidden)
    })

    document.body.appendChild(form)
    form.submit()

    setTimeout(() => {
      document.body.removeChild(form)
      dispatch(hideModal())
    }, 250)
  } else {
    dispatch(hideModal())
  }
}

export const bulkShare = (sharedUsersList) => async (
  dispatch,
  getState,
  services
) => {
  const grantList = sharedUsersList.map((user) => user.id)
  const ids = Array.from(getState().dashboards.selected)
  if (grantList.length > 0 && ids.length > 0) {
    const numDashboardsText =
      ids.length > 1 ? `${ids.length} dashboards` : "1 dashboard"
    const numGrantsText =
      grantList.length > 1 ? `${grantList.length} users/roles` : "1 user/role"
    dispatch(
      showModal({
        type: INFO_MODAL_TYPE,
        heading: "Sharing Dashboards",
        content: `Sharing ${numDashboardsText} to ${numGrantsText}...`
      })
    )
    dispatch(modalLoading("Sharing..."))

    const conn = services.get("DbCon")
    try {
      await conn.shareDashboardsAsync(ids, grantList, { view_: true })
      dispatch(getDashboards())
      dispatch(hideModal())
      snackbarNotify({
        title: "Success",
        body: `${numDashboardsText} have been shared to ${numGrantsText}.`,
        dismissesOnAction: true,
        icon: "check",
        actions: [
          {
            title: "Dismiss"
          }
        ]
      })
    } catch (e) {
      dispatch(getDashboards())
      dispatch(
        showModal({
          type: DANGER_MODAL_TYPE,
          heading: "Error",
          content: `There was an error while sharing dashboards: ${e}`
        })
      )
    }
  }
}

export const bulkUnshare = (sharedUsersList) => async (
  dispatch,
  getState,
  services
) => {
  const grantList = sharedUsersList.map((user) => user.id)
  const ids = Array.from(getState().dashboards.selected)
  if (grantList.length > 0 && ids.length > 0) {
    const numDashboardsText =
      ids.length > 1 ? `${ids.length} dashboards` : "1 dashboard"
    const numGrantsText =
      grantList.length > 1 ? `${grantList.length} users/roles` : "1 user/role"
    dispatch(
      showModal({
        type: INFO_MODAL_TYPE,
        heading: "Unsharing Dashboards",
        content: `Unsharing ${numDashboardsText} from ${numGrantsText}...`
      })
    )
    dispatch(modalLoading("Unsharing..."))

    const conn = services.get("DbCon")
    try {
      await conn.unshareDashboardsAsync(ids, grantList, { view_: true })
      dispatch(getDashboards())
      dispatch(hideModal())
      snackbarNotify({
        title: "Success",
        body: `${numDashboardsText} have been unshared from ${numGrantsText}.`,
        dismissesOnAction: true,
        icon: "check",
        actions: [
          {
            title: "Dismiss"
          }
        ]
      })
    } catch (e) {
      dispatch(getDashboards())
      dispatch(
        showModal({
          type: DANGER_MODAL_TYPE,
          heading: "Error",
          content: `There was an error while unsharing dashboards: ${e}`
        })
      )
    }
  }
}

export const bulkDelete = () => async (dispatch, getState, services) => {
  const ids = Array.from(getState().dashboards.selected)
  if (ids.length > 0) {
    const numDashboardsText =
      ids.length > 1 ? `${ids.length} dashboards` : "1 dashboard"
    dispatch(modalLoading(`Deleting ${numDashboardsText}...`))

    const conn = services.get("DbCon")
    try {
      await conn.deleteDashboardsAsync(ids)
      dispatch(clearAllDashboardSelections())
      dispatch(getDashboards())
      dispatch(hideModal())
      snackbarNotify({
        title: "Success",
        body: `${numDashboardsText} have been deleted.`,
        dismissesOnAction: true,
        icon: "check",
        actions: [
          {
            title: "Dismiss"
          }
        ]
      })
    } catch (e) {
      dispatch(getDashboards())
      dispatch(
        showModal({
          type: DANGER_MODAL_TYPE,
          heading: "Error",
          content: `There was an error while deleting dashboards: ${e}`
        })
      )
    }
  } else {
    dispatch(hideModal())
  }
}
