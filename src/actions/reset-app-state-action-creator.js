// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { RESET_APP_STATE } from "constants/action-types"

export default function resetAppState() {
  return function resetAppStateThunk(dispatch, getState, services) {
    const dc = services.get("dc")
    dc.chartRegistry.list().forEach((chart) => {
      chart.on("filtered", null)
      chart.filterAll()
      chart.resetSvg()
      chart.destroyChart()
    })
    dc.deregisterAllCharts()
    dc.resetState()
    dispatch({ type: RESET_APP_STATE })
  }
}
