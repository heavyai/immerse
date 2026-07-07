// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CONTOUR_VALUE_MEASURE_NAME } from "./constants"

// TODO: What happens if major interval is a float? eg. 0.01 for air temp in noaa dataset
// I think we need to find the precision of this float...
// then do: 0.2 mod (2/10), majorInterval mod (minorSubdivisions/precision)
export const calculateValidMinorSubdivisions = (majorInterval) => {
  if (!majorInterval) {
    return []
  }
  const subdivisions = [...Array(11).keys()]

  return subdivisions
    .filter((i) => majorInterval % (i + 1) === 0)
    .map((i) => ({ label: i.toString(), value: i }))
}

export const getValueMeasure = (measures) => {
  return measures.find((m) => m.name === CONTOUR_VALUE_MEASURE_NAME)
}

export const calculateDomainForColorRange = (colorScale, min, max) => {
  if (min === max || colorScale.length <= 2) {
    return [min, max]
  }
  const diff = max - min
  // min and max always included, so need length - 2 intervals between
  const interval = diff / (colorScale.length - 1)
  const newDomain = []
  let val = min
  while (newDomain.length < colorScale.length - 1 && val <= max) {
    newDomain.push(val)
    val += interval
  }
  newDomain.push(max)
  return newDomain
}
