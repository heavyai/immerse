// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TIME_UNITS } from "constants/data-types"

export function mapBinnedDimensions(dimensions) {
  return dimensions.map((dim) => {
    if (dim.isBinned && !dim.inactive) {
      const numBins = dim.numOfBins
      const binBounds = [dim.currentLowValue, dim.currentHighValue]

      const timeBin = dim.type in TIME_UNITS ? dim.timeBin || "auto" : null
      return { numBins, binBounds, timeBin, extract: dim.extract }
    }

    return null
  })
}
