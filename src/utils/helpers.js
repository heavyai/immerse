// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { concat, equals, keys, merge, uniq } from "ramda"
import { getBinIntervalLabel } from "components/selector-pill/selector-pill-parent-helpers"
import d3 from "../services/d3"
import {
  formatNumber,
  xAxisTickFormat
} from "../charts/utils/coordinate-helpers"
import { snakeCase } from "lodash/string"

export function diff(chart, nextChart) {
  return uniq(concat(keys(chart), keys(nextChart))).reduce((changes, key) => {
    if (!equals(chart[key], nextChart[key])) {
      changes[key] = nextChart[key]
    }
    return changes
  }, {})
}

export function createProjectMeasures(measures, invertAliases = false) {
  const result = []

  measures.forEach((m, index) => {
    if (m.value) {
      result.push(
        m.value === "*"
          ? m.value
          : invertAliases
          ? `col${index} AS ${m.custom ? snakeCase(m.label) : m.value}`
          : `${m.value} AS col${index}`
      )
    }
  })

  return result
}

export function addColNames(measures) {
  return measures.map((measure, i) => {
    measure.name = `col${i}`
    return measure
  })
}

export function removeColNames(measures) {
  return measures.map((measure) => {
    delete measure.name
    return measure
  })
}

export function noop() {}

export function debounce(callback, ms) {
  let timeoutId = null
  return (...args) => {
    if (typeof timeoutId === "number") {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => callback(...args), ms)
  }
}

export function getColAliases(dimensions, measures) {
  return concat(dimensions, measures).map((d) =>
    formatAlias(d, dimensions.length)
  )
}

export function formatAlias(d, numDims) {
  if (d.isBinned) {
    return `${d.extract ? "EXT" : "BIN"} ${d.label} ${
      d.timeBin ? `(${getBinIntervalLabel(d.timeBin, d.extract)})` : ""
    }`
  } else if (numDims && d.aggType && d.aggType !== "Count" && !d.custom) {
    return `${d.aggType.toUpperCase().replace("UNIQUE", "of")} ${d.label}`
  } else {
    return d.label
  }
}

export const isSortColumnPresent = (
  sortColumnLabel,
  dimensions = [],
  measures = []
) => [...dimensions, ...measures].some(({ label }) => label === sortColumnLabel)

export const createSetter = (prop) => (val) => (selector) =>
  merge(selector, { [prop]: val })

export const numberWithCommas = (n = 0) =>
  typeof n === "number"
    ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : "0"

export const comparableValue = (v) => {
  if (Object.prototype.toString.call(v) === "[object Date]") {
    return v.getTime()
  } else {
    return v
  }
}

export function setScales(chart, type, withRadius, initXDomain, initYDomain) {
  chart.on(type, () => {
    if (chart.elasticX()) {
      chart.x(
        d3.scale.linear().domain(d3.extent(chart.data(), chart.keyAccessor()))
      )
      chart.xAxis().scale(chart.x()).tickFormat(xAxisTickFormat({}))
    } else if (initXDomain) {
      chart.x(d3.scale.linear().domain(initXDomain))
      chart.xAxis().scale(chart.x()).tickFormat(xAxisTickFormat({}))
    }

    if (chart.elasticY()) {
      chart.yAxis().scale(chart.y()).tickFormat(formatNumber)
      chart.y(
        d3.scale.linear().domain(d3.extent(chart.data(), chart.valueAccessor()))
      )
    } else if (initYDomain) {
      chart.y(d3.scale.linear().domain(initYDomain))
    }
    if (withRadius) {
      chart.r(
        d3.scale
          .linear()
          .domain(d3.extent(chart.data(), chart.radiusValueAccessor()))
      )
    }
  })
}

export const outOfBounds = (val, min, max) => val < min || val > max

// used in tests. If you have a thunk that dispatches multiple actions, this'll give you an array of them.
export const getThunkActions = (thunk) => {
  const actions = []
  const dispatch = (action) => actions.push(action)

  thunk(dispatch)

  return actions
}
