// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import compose from "ramda/src/compose"
import {
  maybeSetCustomColor,
  maybeSetMeasureState,
  setSummableStateForPie
} from "./charts-reducer-helpers"
import { getTrueSelectorIndex } from "reducers/charts/helpers/multi-source-helpers"
import { CHART_TYPES } from "constants/charts"

import {
  HEAT_DIMENSION_X_AXIS_NAME,
  HEAT_DIMENSION_Y_AXIS_NAME
} from "charts/heat/constants"

const syncMinMaxAndCurrentHighLowValues = (selector) => {
  const hasMinMax = selector.minMax && selector.minMax.length
  if (hasMinMax && selector.minMax[0] !== selector.currentLowValue) {
    selector.currentLowValue = selector.minMax[0]
  }
  if (hasMinMax && selector.minMax[1] !== selector.currentHighValue) {
    selector.currentHighValue = selector.minMax[1]
  }
  return selector
}

const resetMinMaxAndCurrentHighLowValues = (selector) => {
  selector.minMax = [selector.min_val, selector.max_val]
  selector.currentLowValue = selector.min_val
  selector.currentHighValue = selector.max_val
}

// TODO: multiSource
// Take second look at this "true index" pattern to see if it can be done any better
export default function updateSelectorReducer(
  charts,
  {
    chartId,
    selectorType,
    selectorIndex,
    trueIndex,
    multiSourceIndex,
    setter,
    elasticX,
    elasticY
  }
) {
  const trueSelectorIndex =
    typeof trueIndex === "undefined"
      ? getTrueSelectorIndex(
          charts[chartId][selectorType],
          selectorIndex,
          multiSourceIndex
        )
      : trueIndex

  const deltaSelector = [...charts[chartId][selectorType]]
  const newSelector = setter(deltaSelector[trueSelectorIndex])
  if (
    charts[chartId].type === CHART_TYPES.HEAT &&
    ((newSelector.name === HEAT_DIMENSION_Y_AXIS_NAME && elasticY) ||
      (newSelector.name === HEAT_DIMENSION_X_AXIS_NAME && elasticX))
  ) {
    resetMinMaxAndCurrentHighLowValues(newSelector)
  } else if (charts[chartId].type === CHART_TYPES.HEAT) {
    syncMinMaxAndCurrentHighLowValues(newSelector)
  }
  deltaSelector[trueSelectorIndex] = newSelector

  return compose(
    setSummableStateForPie(
      chartId,
      charts[chartId].type,
      newSelector,
      selectorType,
      trueSelectorIndex
    ),
    maybeSetMeasureState(chartId, multiSourceIndex),
    maybeSetCustomColor(trueSelectorIndex, selectorType, chartId)
  )({
    ...charts,
    [chartId]: {
      ...charts[chartId],
      [selectorType]: deltaSelector
    }
  })
}
