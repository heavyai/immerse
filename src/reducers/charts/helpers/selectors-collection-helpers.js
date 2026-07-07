// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  compose,
  concat,
  curry,
  filter,
  flip,
  lensIndex,
  map,
  over,
  range
} from "ramda"
import {
  setActive,
  setInactive,
  setSelectorClear
} from "./selector-object-helpers"
import { CHARTS } from "constants/charts"
import { filterIdx } from "utils/ramda-helpers"

const setAllActive = compose(
  map(setActive),
  flip(concat)([{}]),
  filter(({ value }) => value)
)

function maxFilter(m) {
  return (d, i) => d.value && (d.originIndex || i) >= m
}

function setInactiveIfOver(max = 0) {
  return (selectors) => {
    const active = range(0, max)
      .map((num, index) => selectors[index] || {})
      .map(setActive)

    const inactive = selectors.filter(maxFilter(max)).map(setInactive)

    return concat(active, inactive)
  }
}

const selectorToMaxMap = {
  dimensions: "maxDimensions",
  measures: "maxMeasures",
  postFilters: "maxPostFilters"
}

export function maybeSetActive(selectorType, chartType) {
  const max = CHARTS[chartType][selectorToMaxMap[selectorType]]
  return max === Infinity ? setAllActive : setInactiveIfOver(max)
}

export function removeSelector(selectorIndex) {
  return filterIdx((val, index) => selectorIndex !== index)
}

export const updateSelectorAt = curry((updater, index) =>
  over(lensIndex(index), updater)
)

export const clearSelector = updateSelectorAt(setSelectorClear)
