// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapBinnedDimensions } from "./map-binned-dimensions"

describe("map binned dimensions", () => {
  const dimensions = [
    {
      isBinned: true,
      currentLowValue: 0,
      currentHighValue: 100,
      numOfBins: 12,
      type: "TIMESTAMP",
      extract: false
    }
  ]
  it("should parse bin params in a format that is readable to crossfilter", () => {
    const result = mapBinnedDimensions(dimensions)
    expect(result).toEqual([
      {
        timeBin: "auto",
        binBounds: [0, 100],
        numBins: 12,
        extract: false
      }
    ])
  })

  it("should return null on second dimension", () => {
    dimensions.push({})
    const result = mapBinnedDimensions(dimensions)
    expect(result).toEqual([
      {
        timeBin: "auto",
        binBounds: [0, 100],
        numBins: 12,
        extract: false
      },
      null
    ])
  })
})
