// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Switching from table chart to pointmap caused an exception
// due to table chart not setting the measures' minMax property. If that property isn't set,
// we find it now using `getSelectorMetaData()` for the measure, and pass that to
// `createPointLayer()`. Note that getSelectorMetaData() also sets its results in the Redux
// state for the measure as a side effect.
import { getSelectorMetaData } from "./get-selector-meta-data"
import cloneDeep from "lodash/cloneDeep"

export function* getMeasureMinMax(measures, chartId) {
  const updatedMeasures = cloneDeep(measures)

  for (let i = 0; i < updatedMeasures.length; i += 1) {
    if (
      (["x", "y", "z"].includes(updatedMeasures[i].name) &&
        typeof updatedMeasures[i].minMax === "undefined") ||
      updatedMeasures[i].minMax === null
    ) {
      const newMeasureData = yield* getSelectorMetaData({
        chartId,
        index: i,
        selector: updatedMeasures[i]
      })
      updatedMeasures[i].minMax = newMeasureData.domain
    }
  }

  return updatedMeasures
}
