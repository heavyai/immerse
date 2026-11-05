// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash"
import { resetDashboardOwnedState } from "./reset-dashboard-owned-state"
import * as dashboard from "reducers/dashboard"
import * as ui from "reducers/ui-reducer"
import { CLEAR_DASHBOARD } from "constants/action-types"
import { initialState as sharedSettingsImportInitialState } from "reducers/shared-settings-import-reducer"

export default function clearDashboard(reducer) {
  return (state, action) => {
    switch (action.type) {
      case CLEAR_DASHBOARD:
        return Object.assign(
          {},
          resetDashboardOwnedState(state),
          { charts: {} },
          { dashboard: cloneDeep(dashboard.initialState) },
          { ui: cloneDeep(ui.initialState) },
          { filters: [] },
          { joinDataSources: [] },
          { sharedSettings: { mappings: [] } },
          { sharedSettingsImport: sharedSettingsImportInitialState }
        )

      default:
        return reducer(state, action)
    }
  }
}
