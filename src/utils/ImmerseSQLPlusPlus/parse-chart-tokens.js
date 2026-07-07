// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { chartConfigRegexPattern } from "./parser-tokens"
import { getStore } from "services/ImmerseCrossFilter/utils"
import { getMaxTimeBins, getAutoBinUnit } from "vega/utils/binning"
import { countTopNGroups } from "vega/charts/top-n-utils"
import {
  getLatestBeatDataIncludingIncomplete,
  getComputedMinMax
} from "vega/utils/data"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { START_OF_WEEK } = available_feature_flags

const CHART_CONFIG_REGEX = new RegExp(chartConfigRegexPattern, "gs")

const SUPPORTED_PROPERTIES = {
  timebin: getTimeBin
}

/**
 * Parse ${chart.tokens}
 * @param sql The sql
 * @param chartId The id of the chart
 * @param valueCache A cache of chart.param values
 * @param process A recursive process function to call
 * @returns the sql with ${chart.tokens} replaced
 */
export function parseChartTokens(sql, chartId, valueCache, process) {
  return sql.replace(CHART_CONFIG_REGEX, (m, firstChar, property, fallback) => {
    // Safari doesn't support zero-width-negative-lookbehind-assertions.  So
    // we capture the first character and it's it has a backslash, we bail
    // out.
    if (firstChar === "\\") {
      return m
    }
    property = property.toLowerCase()

    if (valueCache[property]) {
      return firstChar + valueCache[property]
    }

    const chart = chartId && getStore().getState().charts[chartId]
    const value =
      property in SUPPORTED_PROPERTIES &&
      SUPPORTED_PROPERTIES[property](chart, fallback)
    return firstChar + (value ? process(property, value) : fallback || "NULL")
  })
}

export default parseChartTokens

function getVegaMinMax(chart) {
  // Take minmax results from focus chart as source of truth
  const minmaxData = chart.data
    ? chart.data.focus
        .map(getLatestBeatDataIncludingIncomplete)
        .map((beatData) => (beatData ? beatData.minmax : null))
    : []
  return (
    getComputedMinMax(minmaxData, chart.binSettings) || {
      min: Infinity,
      max: Infinity
    }
  )
}

function getTimeBin(chart, fallback) {
  // century is a more sensible default than null for time bin if a fallback
  // hasn't been explicitly provided
  let timeUnit = fallback || "century"

  if (chart) {
    if (chart.type === "vega-combo") {
      if (chart.binSettings) {
        const { dimensionType } = chart.binSettings
        if (
          dimensionType === "binned_time" ||
          dimensionType === "extract_time"
        ) {
          timeUnit = chart.binSettings.timeUnit
          if (timeUnit === "auto") {
            const numTopNGroups = chart.dataSelections.reduce(
              (acc, { topNoptions }) =>
                Math.max(acc, topNoptions ? countTopNGroups(topNoptions) : 0),
              1
            )
            const minmax = getVegaMinMax(chart)
            timeUnit = getAutoBinUnit(minmax, getMaxTimeBins(numTopNGroups))
          }
        }
      }
    }
  }

  if (timeUnit === "week") {
    timeUnit = getFeatureFlag(START_OF_WEEK)
  }

  return timeUnit
}
