// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { namedMeasures } from "constants/charts"

export function addUniqueAggtypeMeasure(measure, chartType, i, dimensions) {
  return {
    expression: measure.value,
    agg_mode: "approx_count_distinct",
    name:
      dimensions[1] && chartType === "line"
        ? "val"
        : measure.name || namedMeasures(chartType)[i].name,
    isComposite: true,
    measureName: measure.label
  }
}

export function addMedianAggtypeMeasure(measure, chartType, i, dimensions) {
  return {
    expression: measure.value,
    agg_mode: "approx_median",
    name:
      dimensions[1] && chartType === "line"
        ? "val"
        : measure.name || namedMeasures(chartType)[i].name,
    isComposite: Boolean(measure.custom),
    measureName: measure.label
  }
}

export function addRegularMeasure(measure, chartType, i, dimensions) {
  return {
    expression: measure.value,
    agg_mode: measure.aggType,
    name:
      dimensions[1] && chartType === "line"
        ? "val"
        : measure.name || namedMeasures(chartType)[i].name,
    isComposite: Boolean(measure.custom),
    measureName: measure.label
  }
}

export function createMultiReduction(measures, chartType, chartSpec) {
  const multiReduction = []

  measures.forEach((measure, i) => {
    if (measure.aggType === "# Unique") {
      multiReduction.push(
        addUniqueAggtypeMeasure(measure, chartType, i, chartSpec.dimensions)
      )
    } else if (measure.aggType === "Median") {
      multiReduction.push(
        addMedianAggtypeMeasure(measure, chartType, i, chartSpec.dimensions)
      )
    } else {
      multiReduction.push(
        addRegularMeasure(measure, chartType, i, chartSpec.dimensions)
      )
    }
  })
  return multiReduction
}

export default function composeMeasures(
  dimension,
  measures,
  chartType,
  chartSpec
) {
  const multiReduction = createMultiReduction(measures, chartType, chartSpec)

  if (chartType === "number") {
    return dimension.groupAll().reduceMulti(multiReduction)
  }

  const group = dimension.group()

  if (multiReduction.length) {
    return group.reduce(multiReduction)
  }

  return group
}
