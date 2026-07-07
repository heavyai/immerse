// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dispatch } from "redux"
import { deserialize } from "utils/dashboard-load"
import {
  CLEAR_IMPORT_DASHBOARD_ID,
  LOAD_DASHBOARD_SHARED_SETTINGS_ERROR,
  LOAD_DASHBOARD_SHARED_SETTINGS_REQUEST,
  LOAD_DASHBOARD_SHARED_SETTINGS_SUCCESS
} from "components/shared-settings/import/shared-settings-import-actions"

export const loadDashboardSharedSettingsRequest = (id: string) => {
  return {
    type: LOAD_DASHBOARD_SHARED_SETTINGS_REQUEST,
    id
  }
}

export const loadDashboardSharedSettingsSuccess = (sharedSettings = {}) => {
  return {
    type: LOAD_DASHBOARD_SHARED_SETTINGS_SUCCESS,
    sharedSettings
  }
}

export const loadDashboardSharedSettingsError = () => {
  return {
    type: LOAD_DASHBOARD_SHARED_SETTINGS_ERROR
  }
}

export const clearImportDashboardId = () => {
  return {
    type: CLEAR_IMPORT_DASHBOARD_ID
  }
}

export const selectImportDashboard = (id: string) => async (
  dispatch: Dispatch,
  _getState: () => any,
  services: any
) => {
  dispatch(loadDashboardSharedSettingsRequest(id))

  const connector = services.get("DbCon")
  try {
    const dashboard = await connector.getDashboardAsync(id)
    const deserializedDashboardState = deserialize(dashboard.dashboard_state)

    dispatch(
      loadDashboardSharedSettingsSuccess(
        deserializedDashboardState.sharedSettings
      )
    )
  } catch {
    dispatch(loadDashboardSharedSettingsError())
  }
}
