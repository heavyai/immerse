// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { has, identity, ifElse, isNil, lensProp, set } from "ramda"
import { CHARTS } from "../../../constants/charts"

export const setSelectorClear = ({ multiSourceIndex, name }) => ({
  ...(!isNil(multiSourceIndex) && { multiSourceIndex }),
  ...(!isNil(name) && { name })
})

export const setIsError = set(lensProp("isError"))
export const setIsRequired = set(lensProp("isRequired"))
export const setInactive = set(lensProp("inactive"), true)
export const setActive = set(lensProp("inactive"), false)
export const updateOriginIndex = (i) => set(lensProp("originIndex"), i)

export function maybeUpdateOriginIndex(selector, i) {
  return ifElse(has("originIndex"), updateOriginIndex(i), identity)(selector)
}

export const findSelectorInSelectorSetByName = (selectorSet, selector) =>
  selectorSet.find((defaultSelector) => selector.name === defaultSelector.name)

export const updateSelectionsIsRequired = (selectorsType, chartType) => (
  selectors
) =>
  selectors.map((selector) => {
    const matchingDefaultSelector = findSelectorInSelectorSetByName(
      CHARTS[chartType][selectorsType],
      selector
    )
    return matchingDefaultSelector && matchingDefaultSelector.required
      ? {
          ...selector,
          isRequired: matchingDefaultSelector.required
        }
      : { ...selector }
  })
