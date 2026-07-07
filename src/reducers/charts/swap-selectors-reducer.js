// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  maybeResetColorDomain,
  updateChart
} from "reducers/charts/charts-reducer-helpers"
import { compose } from "ramda"

export default swapSelectorsReducer

function swapSelectorsReducer(
  state,
  { chartId, selectorType, hoverIndex, dragIndex }
) {
  const swapSelectors = updateChart(chartId, selectorType, () => {
    const selectors = state[chartId][selectorType]
    const newSelectors = selectors.slice()

    const hover = selectors[hoverIndex]
    const drag = selectors[dragIndex]

    newSelectors[dragIndex] = Object.assign({}, hover, {
      name: drag.name,
      inactive: drag.inactive,
      originIndex: dragIndex
    })

    newSelectors[hoverIndex] = Object.assign({}, drag, {
      name: hover.name,
      inactive: hover.inactive,
      originIndex: hoverIndex
    })

    return newSelectors
  })

  return compose(
    maybeResetColorDomain(chartId, selectorType, hoverIndex),
    maybeResetColorDomain(chartId, selectorType, dragIndex),
    swapSelectors
  )(state)
}
