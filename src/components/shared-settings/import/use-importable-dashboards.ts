// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"
import { AppState } from "vega/charts/types"

// Returns all dashboards, excluding the current dashboard
export const useImportableDashboards = () => {
  const dashboards = useSelector((state: AppState) => state.dashboards.list)
  const currentDashboardId = useSelector(
    (state: AppState) => state.dashboard.id
  )

  return dashboards.filter(
    ({ dashboard_id }) => dashboard_id !== currentDashboardId
  )
}
