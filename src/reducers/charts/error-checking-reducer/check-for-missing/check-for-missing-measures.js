// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHARTS } from "constants/charts"
import { ifElse } from "ramda"
import { setIsRequired } from "reducers/charts/helpers/selector-object-helpers"

// Multi-source aware `isMissing`. Checks the measures *per data source* to mark them as required
// or not based on the configured `minMeasures` values in the `CHARTS` constant.
const isMissingMultiSource = (measures, chartType) => {
  // Walks the measures array, keeping track of the count of measures per data source. If the
  // measure is <= the minMeasures w.r.t. the data source, it's marked as required.
  const newMeasures = measures.reduce(
    (acc, val) => {
      const multiSourceIndex =
        typeof val.multiSourceIndex === "undefined" ? -1 : val.multiSourceIndex

      // Grab the current number of measures for the data source (default: 0)
      const count =
        typeof acc.counts[multiSourceIndex] === "number"
          ? acc.counts[multiSourceIndex]
          : 0

      const updatedMeasure =
        count < CHARTS[chartType].minMeasures
          ? setIsRequired(true)(val)
          : setIsRequired(false)(val)

      const newValues = acc.values.concat(updatedMeasure)
      // Increment the measure count for the data source
      const newCounts = { [multiSourceIndex]: count + 1, ...acc.counts }

      return { counts: newCounts, values: newValues }
    },
    { values: [], counts: {} }
  )

  return newMeasures.values
}

export function isMissing(chartType) {
  return (measure, index) => {
    const isRequired = index + 1 <= CHARTS[chartType].minMeasures

    return isRequired && (!measure.value || measure.loading)
  }
}

export function measureRequiredCheck(chartType) {
  return ifElse(isMissing(chartType), setIsRequired(true), setIsRequired(false))
}

export default (chartType, multiSource) => (measures) =>
  multiSource
    ? isMissingMultiSource(measures, chartType)
    : measures.map(measureRequiredCheck(chartType))
