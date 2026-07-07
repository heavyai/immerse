// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { put, select } from "redux-saga/effects"
import { selectChart, isWindbarbChartType } from "../../raster-utils"
import * as ActionTypes from "../../raster-chart-actions"
import Services from "../../../../services/immerse"
import { handleUpdatePointmapSettings } from "../point"
import { getSelectorMetaData } from "./get-selector-meta-data"
import { handleUpdateWindbarbSettings } from "../../windbarb/utils/handle-update-windbarb-settings"

export function* updatePointmapOrWindbarbMeasure({ chartId, index }) {
  const { measures, type } = yield select(selectChart(chartId))

  yield* getSelectorMetaData({
    chartId,
    index,
    selector: measures[index]
  })

  yield put(ActionTypes.updatePopupColumn(chartId, measures[index]))

  const { dcFlag } = yield select(selectChart(chartId))
  const dcChart =
    typeof dcFlag === "number" ? Services.get("dc").getChart(dcFlag) : null

  if (dcChart) {
    yield* isWindbarbChartType(type)
      ? handleUpdateWindbarbSettings({
          chartId
        })
      : handleUpdatePointmapSettings({
          chartId
        })
  }
}
