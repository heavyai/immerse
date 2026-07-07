// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  setChartSpecificBinFilters,
  setFilterX
} from "vega/actions/filter-action-creators-crossfilter-interop"
import * as ActionTypes from "constants/action-types"

export function updateChart(chartId, params) {
  return async (dispatch, getState) => {
    const { charts } = getState()

    if (charts[chartId]) {
      // I don't know where else to put this mod right now. So it's here. It shouldn't be. I'm sorry.
      const chart = charts[chartId]
      if (
        charts[chartId].type === "table" &&
        !chart.dimensions.some((d) => d.value !== undefined) &&
        params.filters &&
        params.filters.length
      ) {
        params.filters = [params.filters[params.filters.length - 1]]
      }
      // end of apology

      if (
        params.filters !== undefined ||
        params.rangeFilter !== undefined ||
        params.mapZoomCenter !== undefined
      ) {
        await dispatch(setFilterX(chartId, params))
      }

      if (params.showNullDimensions !== undefined) {
        await dispatch(setChartSpecificBinFilters(chartId))
      }
    }

    await dispatch({
      type: ActionTypes.UPDATE_CHART,
      chartId,
      payload: params
    })
  }
}
