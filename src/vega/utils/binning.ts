// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import moment from "moment"

import {
  BinnedTimeUnit,
  ComputedMinMax,
  BinnedNumericDimensionScaleSettings,
  BinnedTimeDimensionScaleSettings,
  DateTruncTimeUnit,
  ExtractTimeDimensionScaleSettings,
  ExtractTimeUnit,
  BaseDimensionScaleSettings
} from "vega/charts/types"
import { TIME_SPANS } from "utils/time-helpers"

export const createExtractScaleSettings = (
  timeUnit: ExtractTimeUnit
): ExtractTimeDimensionScaleSettings => ({
  dimensionType: "extract_time",
  timeUnit
})

export const createNumericScaleSettings = (): BinnedNumericDimensionScaleSettings => ({
  dimensionType: "binned_numeric",
  manualMin: null,
  manualMax: null,
  numOfBins: 12,
  format: null
})

export const createTimeScaleSettings = (
  timeUnit?: BinnedTimeUnit
): BinnedTimeDimensionScaleSettings => ({
  dimensionType: "binned_time",
  manualMin: null,
  manualMax: null,
  timeUnit: typeof timeUnit === "undefined" ? "auto" : timeUnit,
  format: null
})

// Maximum number of bins for binned numeric scale (parity with old charts)
export const MAX_NUM_OF_BINS = 250

// Maximum number of bins for binned numeric scale (parity with old charts)
const MAX_NUM_OF_TIME_BINS = 1000
const MAX_NUM_OF_TIME_BINS_WITH_GROUPS = 10000

/**
 * When binning by time with top-n, it's possible to create a chart with a very
 * large number of data points with a large number of groups. This function
 * will compute a smaller max bins with a larger number of groups.
 * @param numGroups The number of top-n groups
 * @returns an appropriate max bins
 */
export const getMaxTimeBins = (numGroups: number): number =>
  Math.min(
    MAX_NUM_OF_TIME_BINS,
    Math.floor(
      MAX_NUM_OF_TIME_BINS_WITH_GROUPS / (numGroups >= 1 ? numGroups : 1)
    )
  )

// This is a functional clone of determineAutoBinInterval from old combo/line2
// min / max assumed to be epochs in ms
export const getAutoBinUnit = (
  { min, max }: ComputedMinMax,
  maxBins = MAX_NUM_OF_TIME_BINS
): BinnedTimeUnit => {
  if (min instanceof Date || max instanceof Date) {
    throw new Error("Unexpected date")
  }

  // Time range in milliseconds
  const timeRange =
    Number.isFinite(max) && Number.isFinite(min) ? max - min : Infinity

  if (timeRange === 0) {
    return "day"
  } else {
    const interval = TIME_SPANS.find(
      (t) => timeRange / (t.numSeconds * 1000) < maxBins
    )

    return interval ? (interval.value as BinnedTimeUnit) : "century"
  }
}

const ascSortedTimeSpans = [...TIME_SPANS].sort(
  (a, b) => a.numSeconds - b.numSeconds
)

export type TimeBinOption = {
  value: string
  label: string
  numSeconds?: number
}

// We wanted the vega combo time bin option values sorted in ascending order, so keeping it separate
const VEGA_BINNING_INTERVAL_OPTIONS: TimeBinOption[] = [
  { value: "auto", label: "Auto" },
  ...ascSortedTimeSpans
]

export const getTimeBinOptionsInRange = (
  minmax: ComputedMinMax | null,
  maxBins = MAX_NUM_OF_TIME_BINS
): TimeBinOption[] => {
  if (!minmax) {
    return [{ value: "auto", label: "Auto" }]
  }

  if (minmax.min instanceof Date || minmax.max instanceof Date) {
    throw new Error("Unexpected date")
  }

  const timeRange = minmax.max - minmax.min

  return VEGA_BINNING_INTERVAL_OPTIONS.filter(
    ({ numSeconds }) =>
      // numSeconds being undefined means it's the "Auto" option, which we always include
      typeof numSeconds === "undefined" ||
      timeRange / (numSeconds * 1000) < maxBins
  )
}

export const getAppropriateTimeFormat = (
  bin: DateTruncTimeUnit,
  min: number,
  max: number
): string => {
  const requiredParts = [
    "microsecond",
    "millisecond",
    "second",
    "minute",
    "hour",
    "day",
    "month",
    "year"
  ]
  if (bin === "nanosecond") {
    bin = "microsecond"
  } else if (bin === "quarterday") {
    bin = "hour"
  } else if (bin === "week") {
    bin = "day"
  } else if (bin === "quarter") {
    bin = "month"
  } else if (["decade", "century", "millennium"].includes(bin)) {
    bin = "year"
  }

  // find the minimum precision we need
  while (requiredParts.length > 1 && requiredParts[0] !== bin) {
    requiredParts.shift()
  }

  // find maximum precision we need
  const minMoment = moment.utc(min)
  const maxMoment = moment.utc(max)
  const diff = moment.duration(maxMoment.diff(minMoment))
  while (
    requiredParts.length > 1 &&
    diff.get(requiredParts[requiredParts.length - 1]) === 0
  ) {
    requiredParts.pop()
  }

  let format = ""
  if (requiredParts[0] === "microsecond") {
    format = `.%f${format}`
    requiredParts.shift()
    if (requiredParts[0] === "millisecond") {
      requiredParts.shift()
    }
  }
  if (requiredParts[0] === "millisecond") {
    format = `.%L${format}`
    requiredParts.shift()
  }
  if (requiredParts[0] === "second") {
    format = `:%S${format}`
    requiredParts.shift()
  }
  if (requiredParts[0] === "minute") {
    format = `%H:%M${format}`
    requiredParts.shift()
    if (requiredParts[0] === "hour") {
      requiredParts.shift()
    }
  }
  if (requiredParts[0] === "hour") {
    format = `%I%p${format}`
    requiredParts.shift()
  }

  if (format.length > 0 && requiredParts.length > 0) {
    format = ` ${format}`
  }

  if (requiredParts[0] === "day") {
    if (requiredParts.length === 3) {
      // must be day, month, and year at this point
      format = `%Y-%m-%d${format}`
    } else if (requiredParts.length === 2) {
      // day and month
      format = `%b %d${format}`
    } else {
      // just day
      format = `%a %d${format}`
    }
  } else if (requiredParts[0] === "month") {
    if (requiredParts.length === 2) {
      // month and year
      format = `%b %Y${format}`
    } else {
      // just month
      format = `%B${format}`
    }
  } else if (requiredParts[0] === "year") {
    format = `%Y${format}`
  }

  return format
}

export const validateBinSettings = (
  binSettings: BaseDimensionScaleSettings | null,
  minMax: ComputedMinMax | null,
  numTopNGroups: number
) => {
  if (binSettings?.dimensionType === "binned_time") {
    const validUnits = getTimeBinOptionsInRange(
      minMax,
      getMaxTimeBins(numTopNGroups)
    ).map(({ value }) => value)
    return validUnits.includes(binSettings.timeUnit)
  }
  return true
}
