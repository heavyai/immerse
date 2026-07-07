// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"
import {
  canChooseAggType,
  dimensionsRequired,
  CHART_TYPES
} from "constants/charts"

function activeWithValue(selector) {
  return selector.value && !selector.inactive
}

function includeIfValue(accum, selector) {
  return accum.concat(activeWithValue(selector) ? [selector.value] : [])
}

export function isEmpty(selectors) {
  return selectors.reduce(
    (truthiness, selector) => truthiness && !activeWithValue(selector),
    true
  )
}

export function mapToValues(selectors) {
  return selectors.reduce(includeIfValue, [])
}

export const isSelectorUsable = (selector) =>
  selector &&
  selector.value &&
  !selector.isError &&
  !selector.inactive &&
  !selector.loading

export function toSQLAgg(measure) {
  switch (measure.aggType) {
    case "# Unique":
      return `APPROX_COUNT_DISTINCT(${measure.value})`
    case "Median":
      return `APPROX_MEDIAN(${measure.value})`
    case "Custom":
      return measure.value
    default:
      return `${measure.aggType.toUpperCase()}(${measure.value})`
  }
}

export function toTransformAgg(agg) {
  switch (agg) {
    case "Avg":
      return "average"
    case "# Unique":
      return "APPROX_COUNT_DISTINCT"
    case "Median":
      return "APPROX_MEDIAN"
    case "Custom":
      return null
    default:
      return agg.toLowerCase()
  }
}

export function toAggMode(agg) {
  switch (agg) {
    case "# Unique":
      return "approx_count_distinct"
    case "Median":
      return "approx_median"
    default:
      return agg
  }
}

export function toPostFilterAgg(agg) {
  return toAggMode(agg).toUpperCase()
}

export const shouldShowAggType = (
  chartType,
  selector,
  numDimensions,
  label,
  aggType,
  isNonGeoJoinedChoroplethColorMeasure
) => {
  if (
    selector.name === "geo" ||
    isNonGeoJoinedChoroplethColorMeasure ||
    isCrossSectionType(chartType) ||
    chartType === CHART_TYPES.CONTOUR
  ) {
    return false
  }
  const isAutoAggregated =
    [CHART_TYPES.BACKEND_CHOROPLETH, CHART_TYPES.LINEMAP].includes(chartType) &&
    selector.is_join
  return (
    ((numDimensions > 0 ||
      (!dimensionsRequired(chartType) && canChooseAggType(chartType)) ||
      isAutoAggregated) &&
      Boolean(label) &&
      Boolean(aggType)) ||
    selector.custom
  )
}
