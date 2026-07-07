// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { put, select } from "redux-saga/effects"

import Services from "services/immerse"
import { updateSelector } from "actions/charts-action-creators"
import { mergeR } from "utils/ramda-helpers"
import { getSelectorMetaData } from "charts/raster-chart/point/utils/get-selector-meta-data"
import * as AppActions from "actions/app-action-creators"
import { updateChart } from "actions/update-chart-action-creator"

import {
  handleUpdateCrossSectionSettings,
  handleUpdateCrossSectionTerrainSettings
} from "./cross-section/cross-section"
import * as ActionTypes from "./raster-chart-actions"
import { selectChart } from "./raster-utils"
import { SINGLE_VALUE_STR_TYPE } from "constants/data-types"
import { CHART_TYPES } from "constants/chart-types"

export function* setCrossSectionMeasure({ index, chartId, selector }) {
  // TODO(C): This could cause a bug, as we're shoving terrain here too, but z prob isnt
  // a selector.name for terrain
  try {
    yield put(ActionTypes.addMeasure({ index, chartId, selector }))
    if (selector?.type !== SINGLE_VALUE_STR_TYPE) {
      yield* getSelectorMetaData({ index, chartId, selector })
    }

    yield put(
      updateSelector(
        chartId,
        "measures",
        index,
        mergeR({ loading: false, isError: true })
      )
    )

    const chart = yield select(selectChart(chartId))
    const { dcFlag } = chart
    const dcChart =
      typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null

    if (dcChart) {
      if (chart.type === CHART_TYPES.CROSS_SECTION) {
        yield* handleUpdateCrossSectionSettings({ index, chartId, selector })
      } else {
        yield* handleUpdateCrossSectionTerrainSettings({
          index,
          chartId,
          selector
        })
      }
    }
  } catch (e) {
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
    yield put(
      updateSelector(
        chartId,
        "measures",
        index,
        mergeR({ loading: false, isError: true })
      )
    )
    yield put(updateChart(chartId, { loading: false }))
  }
}
