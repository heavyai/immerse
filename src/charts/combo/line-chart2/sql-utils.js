// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createParser } from "@heavyai/data-layer"
import {
  getXAxisDimension,
  getColorDimension
} from "reducers/charts/helpers/multi-source-helpers"
import {
  TIME_INTERVALS,
  TIME_LABEL_TO_SECS,
  TIME_SPANS,
  ONE_SECOND_IN_MS
} from "utils/time-helpers"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { START_OF_WEEK } = available_feature_flags

const parser = createParser()

const SEC_FACTOR = 0.001

const DEFAULT_NUM_OF_TIME_BINS = 1000

const DEFAULT_NULL_TIME_RANGE = "day"

const formatTime = (value) =>
  value
    // ISO string format: 'YYYY-MM-DDTHH:MM:SS.fffZ'
    .toISOString()
    // Slice off the Z at the end
    .slice(0, -1)
    // Replace the T in the middle
    .replace("T", " ")

export function filterTimeBinOption(
  binExtent,
  numBins = DEFAULT_NUM_OF_TIME_BINS
) {
  const rangeInSeconds = Math.abs(
    (binExtent[0].getTime() - binExtent[1].getTime()) / ONE_SECOND_IN_MS
  )

  return TIME_INTERVALS.filter(
    (interval) =>
      !(
        (TIME_LABEL_TO_SECS[interval] &&
          rangeInSeconds / TIME_LABEL_TO_SECS[interval] > numBins) ||
        (TIME_LABEL_TO_SECS[interval] &&
          rangeInSeconds / TIME_LABEL_TO_SECS[interval] < 2)
      )
  )
}

export function determineAutoBinInterval(
  currentLowValue,
  currentHighValue,
  maxNumBins = DEFAULT_NUM_OF_TIME_BINS
) {
  const timeRange = currentHighValue * SEC_FACTOR - currentLowValue * SEC_FACTOR
  if (timeRange === 0) {
    return DEFAULT_NULL_TIME_RANGE
  }
  const timeSpans = TIME_SPANS
  const interval = timeSpans.find((t) => timeRange / t.numSeconds < maxNumBins)

  return interval ? interval.value : "century"
}

function toAggExpression(type, field) {
  switch (type) {
    case "Custom":
      return field
    case "# Unique":
      return {
        type: "count",
        approx: true,
        distinct: true,
        field
      }
    case "Avg":
      return {
        type: "average",
        field
      }
    case "Median":
    case "Stddev":
      return {
        type: type.toLowerCase(),
        x: field
      }
    default:
      return {
        type: type.toLowerCase(),
        field
      }
  }
}

function getDimensionGroupBy(
  { type, value, isBinned, timeBin, extract, numOfBins },
  extent
) {
  if (type === "TIMESTAMP" || type === "DATE") {
    if (extract) {
      return {
        type: "project",
        expr: {
          type: "extract",
          unit:
            timeBin === "auto"
              ? "isodow"
              : timeBin === "week"
              ? getFeatureFlag(START_OF_WEEK)
              : timeBin,
          field: value
        },
        as: "key0"
      }
    } else {
      let unit = timeBin
      if (unit === "auto") {
        unit = determineAutoBinInterval(...extent, numOfBins)
      }
      if (unit === "week") {
        unit = getFeatureFlag(START_OF_WEEK)
      }
      return {
        type: "project",
        expr: {
          type: "date_trunc",
          unit,
          field: value
        },
        as: "key0"
      }
    }
  } else if (isBinned) {
    return {
      type: "bin",
      field: value,
      extent,
      maxbins: numOfBins,
      as: "key0"
    }
  } else {
    return {
      type: "project",
      expr: value,
      as: "key0"
    }
  }
}

export const DEFAULT_LIMIT = 5

export function genTopKSQL({
  dimensions,
  measures,
  dataSource,
  filterString,
  globalFilterString,
  limit = DEFAULT_LIMIT
}) {
  const transforms = []

  if (typeof filterString === "string" && filterString.length) {
    transforms.push({
      type: "filter",
      expr: filterString
    })
  }

  if (typeof globalFilterString === "string" && globalFilterString.length) {
    transforms.push({
      type: "filter",
      expr: globalFilterString
    })
  }

  return parser.writeSQL({
    type: "root",
    source: dataSource,
    transform: [
      ...transforms,
      {
        type: "aggregate",
        fields: measures
          .filter((m) => m.value)
          .map(() =>
            parser.parseExpression({
              type: "count",
              field: "*"
            })
          ),
        ops: measures.filter((m) => m.value).map(() => null),
        as: measures.filter((m) => m.value).map((m, i) => `val${i ? i : ""}`),
        groupby: {
          type: "project",
          expr: dimensions[1].value,
          as: "key0"
        }
      },
      {
        type: "sort",
        order: ["descending"],
        field: ["val"]
      },
      {
        type: "limit",
        row: limit
      }
    ]
  })
}

export function genMinMaxSQL({
  dimension,
  dataSource,
  filterString,
  globalFilterString
}) {
  const transforms = []

  if (filterString) {
    transforms.push({
      type: "filter",
      expr: filterString
    })
  }

  if (globalFilterString) {
    transforms.push({
      type: "filter",
      expr: globalFilterString
    })
  }

  return parser.writeSQL({
    type: "root",
    source: dataSource,
    transform: [
      ...transforms,
      {
        type: "project",
        expr: {
          type: "min",
          field: dimension.value
        },
        as: "min_val"
      },
      {
        type: "project",
        expr: {
          type: "max",
          field: dimension.value
        },
        as: "max_val"
      }
    ]
  })
}

export default function genSQL({
  dimensions,
  measures,
  dataSource,
  groups,
  filterString,
  globalFilterString,
  rangeFilter,
  showOther
}) {
  const transforms = []

  const xAxisDimension = getXAxisDimension(dimensions)
  const colorDimension = getColorDimension(dimensions)

  let extent = []
  if (Array.isArray(rangeFilter) && rangeFilter.length) {
    extent = rangeFilter[0]
  } else {
    const lowVal =
      xAxisDimension.currentLowValue === null
        ? xAxisDimension.min_val
        : xAxisDimension.currentLowValue
    const highVal =
      xAxisDimension.currentHighValue === null
        ? xAxisDimension.max_val
        : xAxisDimension.currentHighValue

    extent = [lowVal, highVal]
  }
  let groupby = null

  if (typeof filterString === "string" && filterString.length) {
    transforms.push({
      type: "filter",
      expr: filterString
    })
  }

  if (typeof globalFilterString === "string" && globalFilterString.length) {
    transforms.push({
      type: "filter",
      expr: globalFilterString
    })
  }

  if (
    (xAxisDimension.type === "DATE" || xAxisDimension.type === "TIMESTAMP") &&
    !xAxisDimension.extract &&
    extent[0] instanceof Date
  ) {
    transforms.push({
      type: "filter",
      expr: {
        type: "between",
        field: `CAST(${xAxisDimension.value} AS TIMESTAMP(3))`,
        left: `TIMESTAMP(3) '${formatTime(extent[0])}'`,
        right: `TIMESTAMP(3) '${formatTime(extent[1])}'`
      }
    })
  }

  if (colorDimension && colorDimension.value && groups && groups.length) {
    const multiCase = {
      type: "project",
      expr: {
        type: "case",
        cond: [
          [
            {
              type: "in",
              expr: colorDimension.value,
              set: groups
            },
            colorDimension.value
          ]
        ],
        ...(showOther ? { else: "other" } : {})
      },
      as: "key1"
    }
    groupby = [getDimensionGroupBy(xAxisDimension, extent), multiCase]
  }

  return parser.writeSQL({
    type: "root",
    source: dataSource,
    transform: [
      ...transforms,
      {
        type: "aggregate",
        fields: measures
          .filter((m) => m.value)
          .map((measure) =>
            parser.parseExpression(
              toAggExpression(measure.aggType, measure.value)
            )
          ),
        ops: measures.filter((m) => m.value).map(() => null),
        as: measures.filter((m) => m.value).map((m, i) => `val${i ? i : ""}`),
        groupby: groupby || getDimensionGroupBy(xAxisDimension, extent)
      },
      {
        type: "sort",
        field: ["key0"]
      }
    ]
  })
}
