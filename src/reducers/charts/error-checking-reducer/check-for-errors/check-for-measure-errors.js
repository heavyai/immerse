// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHARTS, GEO_MEASURE_CHARTS } from "constants/charts"
import {
  compose,
  cond,
  equals,
  filter,
  identity,
  ifElse,
  length,
  lensPath,
  lensProp,
  map,
  prop,
  set,
  T,
  view
} from "ramda"
import { ALL_TYPES } from "constants/data-types"

function isUsable({ value, inactive }) {
  return value && !inactive
}
function isBlocked() {
  return false
} // use to block certain measures
const numUsable = compose(length, filter(isUsable))
const isAllRow = compose(equals("*"), prop("value"))
function isNotEmpty(dimensions) {
  return numUsable(dimensions) > 0
}

export const customMeasureCheck = () =>
  ifElse(
    ({ custom, value, inactive }) => custom && !inactive && !value,
    set(lensProp("isError"), true),
    identity
  )

export const countAllMeasureCheck = (chartType) =>
  ifElse(
    ({ name, value }) =>
      GEO_MEASURE_CHARTS[chartType] &&
      value === "*" &&
      (name === "x" || name === "y"), // error if # records used as lon/lat measure
    set(lensProp("isError"), true),
    identity
  )

export function setErrorIfBlocked(measure) {
  return set(lensProp("isError"), isBlocked(measure), measure)
}

export function unlessSetErrorFalse(condition, callback) {
  return ifElse(condition, callback, set(lensProp("isError"), false))
}

export const maybeSetErrorIfBlocked = unlessSetErrorFalse(
  isUsable,
  setErrorIfBlocked
)

export function tableMeasureCheck(dimensions) {
  return unlessSetErrorFalse(
    () => isNotEmpty(dimensions),
    maybeSetErrorIfBlocked
  )
}

function allRowsCheck(dimensions, chartType) {
  return ifElse(
    (measure) =>
      isAllRow(measure) &&
      (chartType === "table" ||
        chartType === "pointmap" ||
        chartType === "backendScatter") &&
      !isNotEmpty(dimensions),
    set(lensProp("isError"), true),
    identity
  )
}

export function measureTypeAllowed(chartType) {
  const MEASURES = CHARTS[chartType].measures
  return (measure) => {
    const expectedMeasureTypes =
      view(
        lensPath(["0", "type"]),
        MEASURES.filter((MEASURE) => MEASURE.name === measure.name)
      ) || ALL_TYPES

    const isAllowed = () => {
      if (measure.type === "STR" && (measure.is_array || !measure.is_dict)) {
        return false
      } else {
        return expectedMeasureTypes[measure.type]
      }
    }

    return typeof measure.type === "undefined" || isAllowed()
      ? measure
      : set(lensProp("isError"), true, measure)
  }
}

export function maybeSetMeasureError(chartType, dimensions) {
  return compose(
    allRowsCheck(dimensions, chartType),
    customMeasureCheck(chartType),
    countAllMeasureCheck(chartType),
    cond([
      [({ custom }) => custom, identity],
      [() => chartType === "table", tableMeasureCheck(dimensions)],
      [T, compose(measureTypeAllowed(chartType), maybeSetErrorIfBlocked)]
    ])
  )
}

/*
  Accepts a collection of measures and returns a new collection with
  the appropriate isError property
*/
export default (chartType, dimensions = []) =>
  map(maybeSetMeasureError(chartType, dimensions))
