// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { lensPath, lensProp, set, view } from "ramda"
import { CHARTS } from "constants/charts"

export const setIsBinned = set(lensProp("isBinned"))
export const setNumOfBins = set(lensProp("numOfBins"))
const setName = set(lensProp("name"))

export function updateDimensionNames(chartType) {
  if (view(lensPath([chartType, "minDimensions"]), CHARTS)) {
    return renameDimension(chartType)
  } else {
    return setName(null)
  }
}

function renameDimension(chartType) {
  return (dimension, index) => {
    const name = view(
      lensPath([chartType, "dimensions", index, "name"]),
      CHARTS
    )
    return setName(name, dimension)
  }
}
