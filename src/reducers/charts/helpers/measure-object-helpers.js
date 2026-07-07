// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { lensProp, set } from "ramda"
import { TEXT_AND_BOOL_TYPES, TIME_UNITS } from "constants/data-types"
import { namedMeasures } from "constants/charts"
import { CHART_TYPES } from "constants/chart-types"

const setName = set(lensProp("name"))
export const setAggType = set(lensProp("aggType"))
export const setValue = set(lensProp("value"))
export const setCustom = set(lensProp("custom"))

export const createNewMeasure = (measure, chartType) =>
  setCustomTrueOrFalse(setDefaultAggType(measure, chartType))

export function setCustomTrueOrFalse(measure) {
  return setCustom(measure.aggType === "Custom", measure)
}

export function setDefaultAggType(measure, chartType) {
  let aggType = ""

  if (chartType === CHART_TYPES.CONTOUR) {
    aggType = "Avg"
  } else if (measure.custom) {
    aggType = "Custom"
  } else if (TEXT_AND_BOOL_TYPES[measure.type]) {
    aggType = "# Unique"
  } else if (TIME_UNITS[measure.type]) {
    aggType = "Max"
  } else {
    aggType = measure.value === "*" ? "Count" : "Avg"
  }

  return setAggType(aggType, measure)
}

export function updateMeasureNames(type) {
  return type === "table" ? addColumnToName : renameMeasure(type)
}

function addColumnToName(measure, index) {
  return setName(`col${index}`, measure)
}

export function renameMeasure(type) {
  return (measure, index) => {
    const names = namedMeasures(type).map((m) => m.name)
    return setName(names[index], measure)
  }
}
