// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { put, select } from "redux-saga/effects"
import * as AppActions from "actions/app-action-creators"
import Services from "services/immerse"
import { handleUpdatePointmapSettings } from "charts/raster-chart/point/point"
import {
  isWindbarbChartType,
  selectChart
} from "charts/raster-chart/raster-utils"
import { handleUpdateWindbarbSettings } from "charts/raster-chart/windbarb/utils/handle-update-windbarb-settings"
import { mergeR } from "utils/ramda-helpers"
import { addPostFilter } from "charts/raster-chart/raster-chart-actions"
import { updateSelector } from "actions/charts-action-creators"
import { updateChart } from "actions/update-chart-action-creator"

export function* setPointmapPostFilter(action) {
  try {
    yield put(addPostFilter(action))

    const chart = yield select(selectChart(action.chartId))
    const { dcFlag } = chart

    const dcChart =
      typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null

    if (dcChart) {
      yield* isWindbarbChartType(chart.type)
        ? handleUpdateWindbarbSettings({
            ...action,
            chartId: action.chartId
          })
        : handleUpdatePointmapSettings({
            ...action,
            chartId: action.chartId
          })
    }
  } catch (e) {
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
    yield put(
      updateSelector(
        action.chartId,
        "postFilters",
        action.index,
        mergeR({ loading: false, isError: true })
      )
    )
    yield put(updateChart(action.chartId, { loading: false }))
  }
}
