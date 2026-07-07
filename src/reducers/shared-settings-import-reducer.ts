// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnyAction } from "redux"

import produce from "immer"
import {
  CLEAR_IMPORT_DASHBOARD_ID,
  LOAD_DASHBOARD_SHARED_SETTINGS_ERROR,
  LOAD_DASHBOARD_SHARED_SETTINGS_REQUEST,
  LOAD_DASHBOARD_SHARED_SETTINGS_SUCCESS
} from "../components/shared-settings/import/shared-settings-import-actions"

export const initialState = {
  loading: false,
  sharedSettings: { mappings: [] },
  error: ""
}

export const sharedSettingsImport = produce(
  (
    state = initialState,
    action: AnyAction
    // eslint-disable-next-line consistent-return
  ) => {
    switch (action.type) {
      case LOAD_DASHBOARD_SHARED_SETTINGS_REQUEST: {
        state.loading = true
        state.sharedSettings = initialState.sharedSettings
        state.error = ""
        state.selectedDashboardId = action.id
        break
      }
      case LOAD_DASHBOARD_SHARED_SETTINGS_SUCCESS: {
        state.loading = false
        state.sharedSettings = action.sharedSettings
        state.error = ""
        break
      }
      case LOAD_DASHBOARD_SHARED_SETTINGS_ERROR: {
        state.loading = false
        state.sharedSettings = initialState.sharedSettings
        state.error = "Error loading mappings"
        break
      }
      case CLEAR_IMPORT_DASHBOARD_ID: {
        delete state.selectedDashboardId
        break
      }
      default:
        return state
    }
  }
)
