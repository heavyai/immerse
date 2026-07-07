// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { put, select } from "redux-saga/effects"
import * as ActionTypes from "../../raster-chart-actions"
import { selectChart, isWindbarbChartType } from "../../raster-utils"
import Services from "../../../../services/immerse"
import { findIndex } from "ramda"
import { isSelectorUsable } from "../../../../utils/selector-helpers"
import { getDefaultFormat } from "../../../../utils/formatter-helper"
import { handleUpdatePointmapSettings } from "../point"
import * as AppActions from "../../../../actions/app-action-creators"
import * as ChartActions from "../../../../actions/charts-action-creators"
import { mergeR } from "../../../../utils/ramda-helpers"
import { updateChart } from "../../../../actions/update-chart-action-creator"
import { getSelectorMetaData } from "./get-selector-meta-data"
import { handleUpdateWindbarbSettings } from "../../windbarb/utils/handle-update-windbarb-settings"

export function* setPointmapOrWindbarbMeasure(action) {
  try {
    yield put(ActionTypes.addMeasure(action))
    const chart = yield select(selectChart(action.chartId))

    yield* getSelectorMetaData(action)

    const { dcFlag } = chart

    const dcChart =
      typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null

    if (action.selector.type === "POINT") {
      // If POINT type, update both x and y measures simultaneously (POINT fills both)
      const { measures } = chart
      const xMeasureIndex = findIndex(
        (measure) => measure.name === "x",
        measures
      )
      const yMeasureIndex = findIndex(
        (measure) => measure.name === "y",
        measures
      )

      if (action.index === xMeasureIndex) {
        const yMeasureAction = { ...action, index: yMeasureIndex }
        yield put(ActionTypes.addMeasure(yMeasureAction))
        yield* getSelectorMetaData(yMeasureAction)
      } else if (action.index === yMeasureIndex) {
        const xMeasureAction = { ...action, index: xMeasureIndex }
        yield put(ActionTypes.addMeasure(xMeasureAction))
        yield* getSelectorMetaData(xMeasureAction)
      }
    }

    // New measures auto populate as popup columns except lat, lon, and geo column
    if (action.selector.type !== "POINT") {
      // need to get updated measures here after the addMeasure and updateMeasure updated redux state
      const updatedChart = yield select(selectChart(action.chartId))
      const { measures, dimensions } = updatedChart

      const newMeasure = measures[action.index]

      if (dimensions.filter((d) => isSelectorUsable(d)).length > 0) {
        // when dimension selected, we add lat & lon columns for popup columns
        yield put(ActionTypes.addPopupColumn(action.chartId, newMeasure))
        // Apply default format for the new popup column
        yield put(
          ActionTypes.setPopupColumnFormat(
            action.chartId,
            action.selector,
            getDefaultFormat(newMeasure.type)
          )
        )
      } else if (action.index !== 0 && action.index !== 1) {
        // without dimension, we don't show lat & lon in popups but color and size measures
        yield put(ActionTypes.addPopupColumn(action.chartId, newMeasure))
        // Apply default format for the new popup column
        yield put(
          ActionTypes.setPopupColumnFormat(
            action.chartId,
            action.selector,
            getDefaultFormat(newMeasure.type)
          )
        )
      }

      // When orientation measure is added, we default to wedge mark type.
      // Two types, wedge and arrow, are supported for angle/orientation
      if (
        action.index === 4 &&
        (chart.markShape !== "wedge" || chart.markShape === "arrow")
      ) {
        yield put(
          ActionTypes.updateRasterChart(action.chartId, { markShape: "wedge" })
        )
      }
    }

    if (dcChart) {
      yield* isWindbarbChartType(chart.type)
        ? handleUpdateWindbarbSettings(action)
        : handleUpdatePointmapSettings(action)
    }
  } catch (e) {
    yield put(AppActions.setAppError("CHART_RENDER_ERROR", e))
    yield put(
      ChartActions.updateSelector(
        action.chartId,
        "measures",
        action.index,
        mergeR({ loading: false, isError: true })
      )
    )
    yield put(updateChart(action.chartId, { loading: false }))
  }
}
