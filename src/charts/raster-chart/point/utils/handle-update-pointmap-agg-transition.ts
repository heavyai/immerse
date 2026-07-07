// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { select } from "redux-saga/effects"
import * as rasterUtils from "../../raster-utils"
import { isSelectorUsable } from "../../../../utils/selector-helpers"
import { setPointmapOrWindbarbMeasure } from "./set-pointmap-or-windbarb-measure"

export function* handleUpdatePointmapAggTransition(action) {
  const chartSpec = yield select(rasterUtils.selectChart(action.chartId))
  const colorMeasureIndex = chartSpec.measures.findIndex(
    (m) => m.name === "color"
  )

  const colorMeasure = chartSpec.measures[colorMeasureIndex]
  if (isSelectorUsable(colorMeasure)) {
    yield* setPointmapOrWindbarbMeasure({
      ...action,
      index: colorMeasureIndex,
      selector: colorMeasure
    })
  }
}
