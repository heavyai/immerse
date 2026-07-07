// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import CrossFilter from "./ImmerseCrossFilter"
import { isOrdinal, isQuantitative } from "constants/data-types"
import { NUM_DEFAULT_CATEGORIES } from "constants/magic-variables"
import { MINMAX_TOKEN } from "utils/ImmerseSQLPlusPlus/trackable-tokens"
import { getWindowFunctions } from "utils/windowfuncs"
import { importableProcess as process } from "utils/ImmerseSQLPlusPlus/parser-importable"

function getMinMax(
  column,
  { min, max } = {},
  { ignoreFilters = true, ignoreChartFilters = true, token = MINMAX_TOKEN } = {}
) {
  min = min || "minimum"
  max = max || "maximum"
  return this.groupAll()
    .reduce([
      { expression: column, agg_mode: "min", name: min },
      { expression: column, agg_mode: "max", name: max }
    ])
    .objValuesAsync({ ignoreFilters, ignoreChartFilters, token })
    .then((bounds) => [bounds[min], bounds[max]])
}

function getTopN(column) {
  const group = this.dimension(column).order("val").group().reduceCount(column)

  // get topN + 1 categories to determine if there is Other category or not in the result
  return group
    .topAsync(NUM_DEFAULT_CATEGORIES + 1, 0, null, true)
    .then((results) => results.map((result) => result.key0))
}

function getPointGeoDomain(selector, index) {
  return this.groupAll()
    .reduce([
      {
        expression: `ST_${index === 0 ? "X" : "Y"}Min(${selector.value})`,
        agg_mode: "min",
        name: "minimum"
      },
      {
        expression: `ST_${index === 0 ? "X" : "Y"}Min(${selector.value})`,
        agg_mode: "max",
        name: "maximum"
      }
    ])
    .valuesAsync(true, true)
    .then(({ minimum, maximum }) => [
      minimum === "-Infinity" ? 0 : minimum,
      maximum === "-Infinity" ? 1 : maximum
    ])
}

function getPolyGeoDomain(selector) {
  return this.groupAll()
    .reduce([
      {
        expression: `ST_XMin(${selector.value})`,
        agg_mode: "min",
        name: "xmin"
      },
      {
        expression: `ST_XMax(${selector.value})`,
        agg_mode: "max",
        name: "xmax"
      },
      {
        expression: `ST_YMin(${selector.value})`,
        agg_mode: "min",
        name: "ymin"
      },
      {
        expression: `ST_YMax(${selector.value})`,
        agg_mode: "max",
        name: "ymax"
      }
    ])
    .valuesAsync(true, true)
    .then(({ xmin, xmax, ymin, ymax }) => [
      xmin === "-Infinity" ? 0 : xmin,
      xmax === "-Infinity" ? 1 : xmax,
      ymin === "-Infinity" ? 0 : ymin,
      ymax === "-Infinity" ? 1 : ymax
    ])
}

function getDomain(selector) {
  if (isQuantitative(selector.type)) {
    if (
      getWindowFunctions(process(selector.value, { trackUsage: false }))
        .length > 0
    ) {
      return Promise.resolve([Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER])
    }
    return this.getMinMax(selector.value)
  } else if (isOrdinal(selector.type)) {
    return this.getTopN(selector.value)
  } else {
    return Promise.resolve()
  }
}

export function enhanceCrossfilter(crossfilter) {
  crossfilter.getMinMax = getMinMax.bind(crossfilter)
  crossfilter.getTopN = getTopN.bind(crossfilter)
  crossfilter.getPointGeoDomain = getPointGeoDomain.bind(crossfilter)
  crossfilter.getPolyGeoDomain = getPolyGeoDomain.bind(crossfilter)
  crossfilter.getDomain = getDomain.bind(crossfilter)
  return crossfilter
}

export function createCrossfilterService() {
  const state = {}

  const api = {
    setCrossfilter,
    getCrossfilter,
    getCrossfilterById,
    removeCrossfilter
  }

  function setCrossfilter(tableKey, cf) {
    state[tableKey] = enhanceCrossfilter(cf)
    return api
  }

  function getCrossfilter(tableKey, chartId, keyModifier) {
    if (state[tableKey]) {
      if (chartId) {
        const cfWithChart = state[tableKey].cloneWithChartId(
          chartId,
          keyModifier
        )
        return enhanceCrossfilter(cfWithChart)
      } else {
        return state[tableKey]
      }
    } else {
      return null
    }
  }

  function getCrossfilterById(id) {
    return Object.values(state).find((cf) => cf.getId() === id)
  }

  function removeCrossfilter(tableKey) {
    delete state[tableKey]
    return api
  }

  return api
}

export default CrossFilter
