// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHARTS } from "constants/charts"
import { ifElse } from "ramda"
import { mapIdx } from "utils/ramda-helpers"
import { setIsRequired } from "reducers/charts/helpers/selector-object-helpers"
import { getSelectorIndexInSource } from "reducers/charts/helpers/multi-source-helpers"

export function isMissing(chartType) {
  return (dimension, index) => {
    const isRequired = index + 1 <= CHARTS[chartType].minDimensions
    return isRequired && (!dimension.value || dimension.loading)
  }
}

export function dimensionRequiredCheck(chartType) {
  return ifElse(isMissing(chartType), setIsRequired(true), setIsRequired(false))
}

const checkMultiSource = (chartType) => (dimensions) =>
  dimensions.map((dimension, index) => {
    const indexInSource = getSelectorIndexInSource(dimensions, index)
    const isRequired =
      indexInSource + 1 <= CHARTS[chartType].minDimensions &&
      (!dimension.value || dimension.loading)

    return {
      ...dimension,
      isRequired
    }
  })

export default (chartType) =>
  chartType === "line2"
    ? checkMultiSource("line2")
    : mapIdx(dimensionRequiredCheck(chartType))
