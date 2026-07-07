// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { setChartColor, updateChart } from "./charts-reducer-helpers"
import { CHARTS_DEFAULT_COLORS, getColors } from "services/colors"
import compose from "ramda/src/compose"
import identity from "ramda/src/identity"
import ifElse from "ramda/src/ifElse"
import { clearSelector } from "./helpers/selectors-collection-helpers"

function nextColor(savedColors, defaultColor) {
  return savedColors[defaultColor.type]
    ? savedColors[defaultColor.type]
    : defaultColor
}

function removeColorByDimension(state, id) {
  return {
    ...state,
    [id]: {
      ...state[id],
      colorByDimension: null
    }
  }
}

export default function clearSelectorReducer(
  state,
  { chartId, selectorType, selectorIndex }
) {
  const chart = state[chartId]
  const selectors = chart[selectorType]
  const { name } = selectors[selectorIndex]
  const updateSelectorBy = updateChart(chartId, selectorType)

  return compose(
    ifElse(
      () =>
        name === "color" ||
        ((chart.type === "line" || chart.type === "histogram") &&
          selectorIndex === 1),
      compose(
        setChartColor(
          chartId,
          nextColor(
            chart.savedColors,
            getColors(CHARTS_DEFAULT_COLORS)[chart.type]
          )
        ),
        (stateArg) => removeColorByDimension(stateArg, chartId)
      ),
      identity
    ),
    updateSelectorBy(clearSelector(selectorIndex))
  )(state)
}
