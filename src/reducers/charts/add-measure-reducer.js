// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  addSelector,
  maybeAddEmptySelector,
  maybeOffsetSorting,
  maybeResetColorByDimension,
  maybeResetColorDomain,
  maybeSetCustomColor,
  setChartNextColor,
  updateMeasure,
  setSummableStateForPie,
  maybeSetDateFormatForTable
} from "./charts-reducer-helpers"
import { compose, inc } from "ramda"
import { createNewMeasure } from "./helpers/measure-object-helpers"

export default function addMeasureReducer(state, { chartId, index, measure }) {
  const chart = state[chartId]
  const chartType = chart.type
  const newMeasure = createNewMeasure(measure, chartType)
  const addMeasure = updateMeasure(
    chartId,
    index,
    addSelector(newMeasure, index)
  )

  return compose(
    setSummableStateForPie(chartId, chartType, newMeasure, "measures", index),
    setChartNextColor(chartId, measure.multiSourceIndex),
    maybeResetColorDomain(chartId, index),
    maybeSetCustomColor(index, "measures", chartId),
    maybeResetColorByDimension(chartId, newMeasure),
    maybeOffsetSorting(inc, index, "measures", chartId, chart),
    maybeSetDateFormatForTable(
      chartId,
      chartType,
      newMeasure,
      "measures",
      index
    ),
    maybeAddEmptySelector(
      "measures",
      chartId,
      chartType,
      measure.multiSourceIndex
    ),
    addMeasure
  )(state)
}
