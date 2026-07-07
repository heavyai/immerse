// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { calculateLogScaleMin } from "charts/utils/coordinate-helpers"
import { SCALE_TYPES, ScaleType } from "constants/scale-types"
import { MeasureDomain, BoxPlotData } from "vega/charts/box-plot-chart/types"
import { Scales } from "vega/charts/types"

export const createVegaComboScalesSettings = (): Scales => ({
  colorMeasure: {
    palette: {
      type: "quantitative",
      name: "mapDScale"
    },
    domain: null,
    paletteReversed: false
  }
})

/**
 * Build a MeasureDomain
 * @param manualMin A manually set minimum, or null
 * @param manualMax A manually set maximum, or null
 * @param computed Computed extents, or undefined
 * @returns An object with min, max, minLocked, and maxLocked
 */
export function buildMeasureDomain(
  manualMin: number | null | undefined,
  manualMax: number | null | undefined,
  computed?: [number, number],
  scaleType: ScaleType = SCALE_TYPES.LINEAR
): MeasureDomain | null {
  const minLocked = manualMin !== null && manualMin !== undefined
  const maxLocked = manualMax !== null && manualMax !== undefined

  let min =
    scaleType === SCALE_TYPES.LOG && manualMin <= 0
      ? calculateLogScaleMin(manualMin, manualMax ?? computed[1])
      : manualMin
  let max = manualMax

  if (computed) {
    if (!minLocked) {
      min = computed[0]
    }
    if (!maxLocked) {
      max = computed[1]
    }
  } else if (!minLocked || !maxLocked) {
    return null
  }

  if (typeof min === "number" && typeof max === "number") {
    return {
      min,
      max,
      minLocked,
      maxLocked,
      computedMin: computed?.[0],
      computedMax: computed?.[1]
    }
  } else {
    throw new Error("Unexpectedly undefined min or max")
  }
}

export const getBoxPlotAutoScaling = (
  data: BoxPlotData[]
): [number, number] | undefined => {
  if (!data || data.length === 0) {
    return undefined
  }

  let whiskerMin = undefined
  let whiskerMax = undefined
  let dataMin = undefined
  let dataMax = undefined

  for (const d of data) {
    const { measure0_q1, measure0_q3, measure0_min, measure0_max } = d

    // skip rows with null values
    if (
      measure0_q1 !== null &&
      measure0_q3 !== null &&
      measure0_min !== null &&
      measure0_max !== null
    ) {
      const iqr = measure0_q3 - measure0_q1
      // if calculated whisker end is lower/higher than data min/max, use data min/max instead
      const lowerWhisker = Math.max(measure0_q1 - 1.5 * iqr, measure0_min)
      const upperWhisker = Math.min(measure0_q3 + 1.5 * iqr, measure0_max)

      if (whiskerMin === undefined) {
        whiskerMin = lowerWhisker
        whiskerMax = upperWhisker
        dataMin = measure0_min
        dataMax = measure0_max
      } else {
        whiskerMin = Math.min(whiskerMin, lowerWhisker)
        whiskerMax = Math.max(whiskerMax, upperWhisker)
        dataMin = Math.min(dataMin, measure0_min)
        dataMax = Math.max(dataMax, measure0_max)
      }
    }
  }

  // shouldn't need this if we have data, but just in case
  if (
    whiskerMin === undefined ||
    whiskerMax === undefined ||
    dataMin === undefined ||
    dataMax === undefined
  ) {
    return undefined
  }

  const whiskerRange = whiskerMax - whiskerMin
  const MIN_BUFFER = 1
  const BUFFER = Math.max(whiskerRange * 0.05, MIN_BUFFER)

  return [
    dataMin === 0 && dataMax > 0 ? 0 : whiskerMin - BUFFER,
    dataMax === 0 && dataMin < 0 ? 0 : whiskerMax + BUFFER
  ]
}
