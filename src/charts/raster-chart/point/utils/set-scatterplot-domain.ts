// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { call } from "redux-saga/effects"
import { CHART_TYPES } from "constants/chart-types"
import { Measure } from "constants/prop-types"

export function* setBackendScatterDomains(
  dcChart: any,
  chartType: string,
  measures: Measure[]
) {
  if (!dcChart || chartType !== CHART_TYPES.BACKEND_SCATTER) {
    return
  }

  const xDomain = measures[0]?.minMax || measures[0]?.initMinMax || [0, 1]
  if (xDomain && xDomain.length === 2) {
    yield call(dcChart.x().domain, xDomain)
  }

  const yDomain = measures[1]?.minMax || measures[1]?.initMinMax || [0, 1]
  if (yDomain && yDomain.length === 2) {
    yield call(dcChart.y().domain, yDomain)
  }
}
