// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  ComputedMinMax,
  VegaComboLayerData,
  VegaComboLayerBeatData,
  MinMaxData,
  BaseDimensionScaleSettings
} from "vega/charts/types"
import {
  ComboDataSelection,
  isGroupableNumeric,
  isGroupableTime
} from "../constants/data-selection-types"
import { isMultiSourceFilter } from "../constants/filter-types"
import { FilterMetadata } from "vega/constants/filter-metadata-types"

import {
  FILTER_TYPE_AND,
  FILTER_TYPE_BETWEEN
} from "vega/constants/filter-type-constants"
import { DataByVisualization } from "vega/charts/box-plot-chart/types"
import { SCALE_TYPES } from "constants/scale-types"
import { calculateLogScaleMin } from "charts/utils/coordinate-helpers"

export type ChartLayerId = string
export type BeatId = string

// Get the latest retrieved data for the layer, given the object of all of its
// beats
export const getLatestBeatData = (
  layerBeats: VegaComboLayerData
): VegaComboLayerBeatData | undefined => {
  if (layerBeats) {
    // Sort in reverse, to get most recent populated beat data
    for (const [, beatData] of Object.entries(layerBeats).sort(
      ([keyA], [keyB]) => Number(keyB) - Number(keyA)
    )) {
      if (beatData && !beatData.incomplete) {
        return beatData
      }
    }
  }

  return undefined
}

// Get the latest retrieved data for the layer, given the object of all of its
// beats
export const getLatestBeatDataIncludingIncomplete = (
  layerBeats: VegaComboLayerData
): VegaComboLayerBeatData | undefined => {
  if (layerBeats) {
    // Sort in reverse, to get most recent populated beat data
    for (const [, beatData] of Object.entries(layerBeats).sort(
      ([keyA], [keyB]) => Number(keyB) - Number(keyA)
    )) {
      if (beatData) {
        return beatData
      }
    }
  }

  return undefined
}

export const toEpochIfDate = (value: number | string | Date): number => {
  if (value instanceof Date) {
    return value.getTime()
  } else if (typeof value === "string") {
    return new Date(value).getTime()
  } else {
    return value
  }
}

export const getDataMinMax = (
  data: (MinMaxData | null)[]
): ComputedMinMax | null => {
  const minmax: ComputedMinMax = { min: Infinity, max: -Infinity }

  for (const minmaxData of data) {
    if (!minmaxData) {
      return null
    }

    const [{ dimensionMin, dimensionMax }] = minmaxData

    minmax.min = Math.min(minmax.min, toEpochIfDate(dimensionMin))
    minmax.max = Math.max(minmax.max, toEpochIfDate(dimensionMax))
  }

  return minmax
}

export const getRangeFilterMinMax = (rangeFilter: FilterMetadata) => {
  let minMax = {
    min: null,
    max: null
  }

  if (!rangeFilter.enabled || !isMultiSourceFilter(rangeFilter.filter)) {
    return minMax
  }

  // Dig through the range chart filter to (eventually) get its range.  If
  // we've gotten this far, a range chart filter *should* always match this
  // shape...but make sure some unexpected filter didn't sneak in.
  const mainFilter = Object.values(rangeFilter.filter.filtersByDataSource).find(
    (f) =>
      f.filterType === FILTER_TYPE_AND &&
      f.filters.every((filter) => filter.filterType === FILTER_TYPE_BETWEEN)
  )

  if (mainFilter?.filters?.length) {
    // Start/end values should be the same across each of these filters, so
    // just grab one.
    minMax = {
      min: mainFilter.filters[0].start,
      max: mainFilter.filters[0].end
    }
  }

  return minMax
}

/**
 * For focus charts, in order of priority, we set the min/max to:
 * 1. Manual/locked values, if any
 * 2. The bounds of a filter set on the corresponding range chart, if any
 * 3. The min/max of the data
 *
 * For range charts, #1 and #2 are ignored and min/max are always set to the
 * extents of the data.
 */
export const getComputedMinMax = (
  data: (MinMaxData | null)[],
  binSettings: BaseDimensionScaleSettings | null,
  ignoreManualMinMax?: boolean,
  rangeFilter?: FilterMetadata
): ComputedMinMax | null => {
  let { manualMin = null, manualMax = null } =
    (binSettings?.dimensionType === "binned_numeric" ||
      binSettings?.dimensionType === "binned_time") &&
    !ignoreManualMinMax
      ? binSettings
      : {}

  if (rangeFilter && !ignoreManualMinMax) {
    const rangeMinMax = getRangeFilterMinMax(rangeFilter)
    if (!manualMin) {
      manualMin = rangeMinMax.min
    }

    if (!manualMax) {
      manualMax = rangeMinMax.max
    }
  }

  if (manualMin !== null && manualMax !== null) {
    return {
      min: toEpochIfDate(manualMin),
      max: toEpochIfDate(manualMax)
    }
  } else {
    const combinedMinMax: ComputedMinMax | null = getDataMinMax(data)

    if (!combinedMinMax) {
      return null
    }

    if (manualMin !== null) {
      combinedMinMax.min = toEpochIfDate(manualMin)
    }
    if (manualMax !== null) {
      combinedMinMax.max = toEpochIfDate(manualMax)
    }

    return combinedMinMax
  }
}

export const isSupportsTimeScale = (
  dataSelections: ComboDataSelection[]
): boolean =>
  dataSelections.length > 0 &&
  dataSelections.every(
    ({ dimensions: { xAxis } }) =>
      xAxis.length === 1 && isGroupableTime(xAxis[0].column)
  )

export const isSupportsNumericalScale = (
  dataSelections: ComboDataSelection[]
): boolean =>
  dataSelections.length > 0 &&
  dataSelections.every(
    ({ dimensions: { xAxis } }) =>
      xAxis.length === 1 && isGroupableNumeric(xAxis[0].column)
  )

/**
 * Calculate the extents for a single axis
 * @param data Data for the axis
 * @returns the extents ([min, max])
 */
export const extentByAxis = (
  data: DataByVisualization,
  {
    minProperty = "measureMin",
    maxProperty = "measureMax",
    scaleType = SCALE_TYPES.LINEAR
  }: {
    minProperty: string
    maxProperty: string
    scaleType: SCALE_TYPES
  }
): [number, number] | undefined => {
  const extent: [number, number] = [
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY
  ]
  let nonZeroMin = 0

  for (const markData of Object.values(data)) {
    if (markData) {
      for (const datum of markData) {
        if (!datum.gap) {
          extent[0] = Math.min(extent[0], datum[minProperty])
          extent[1] = Math.max(extent[1], datum[maxProperty])
          nonZeroMin = Math.min(extent[0], datum[maxProperty])
        }
      }
    }
  }

  if (!Number.isFinite(extent[0]) || !Number.isFinite(extent[1])) {
    return undefined
  }

  // if we have bars or areas, include zero in the extents
  if (scaleType === SCALE_TYPES.LOG) {
    extent[0] = calculateLogScaleMin(nonZeroMin, extent[1])
  } else if (data.bar || data.area) {
    extent[0] = Math.min(extent[0], 0)
    extent[1] = Math.max(extent[1], 0)
  }

  return extent
}
