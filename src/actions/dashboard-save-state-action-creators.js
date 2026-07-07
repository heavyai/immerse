// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { UPDATE_DASHBOARD_SAVE_STATE } from "constants/action-types"

export function updateDashboardSaveState(warnUnsaved = false) {
  return {
    type: UPDATE_DASHBOARD_SAVE_STATE,
    warnUnsaved
  }
}
