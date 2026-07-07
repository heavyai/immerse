// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getCurrentXAxisDomainForChart } from "reducers/charts/helpers/multi-source-helpers"

export function getLabel(d) {
  return d.axisLabel || d.label || d.value || ""
}

// helper fns for reducing multi-measure domains by axis
export function getLockedDomain(_measures) {
  const hasSetDomain = _measures.filter((d) => d.minMax).length
  const minMax = _measures.reduce(
    (accum, d) => {
      if (d.minMax) {
        return [
          Math.min(d.minMax[0], accum[0]),
          Math.max(d.minMax[1], accum[1])
        ]
      } else {
        return accum
      }
    },
    [Infinity, -Infinity]
  )
  return minMax && hasSetDomain ? minMax : "auto"
}

// Generate the series ID - used by the chart to correlate a data series and
// its mark configurations such as color, line style, etc.
export const getSeriesID = (sourceIndex, groupIndex) =>
  `source${sourceIndex}_series${groupIndex}`

// Helper for determining of the line2-settings should how the percentage toggle and also if
// the percentage transform should occur
export const isPercentageViewVisible = (dimensions, isMultiSource) =>
  !isMultiSource &&
  (dimensions.find((dimension) => dimension.name === "Color") || {}).value

export const getXDomain = (dimensions, extract = false) => {
  // by default, let's assume we're gonna return "auto"
  let retValue = "auto"

  // BUT...we might instead return a specific range, under some conditions.
  // first of all, we can't be using extract bins. We also need a dimensions.
  // then we fall through to our helper function to get the min and max.
  // if we have both (and they EXIST, not merely are truthy), then we're gonna
  // return that min/max range instead.

  if (!extract && dimensions) {
    const [min, max] = getCurrentXAxisDomainForChart(dimensions)

    if (min !== undefined && max !== undefined) {
      retValue = [min, max]
    }
  }

  return retValue
}
