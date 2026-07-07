// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ifElse, lensProp, set } from "ramda"
import { CHARTS } from "constants/charts"
import { mapIdx } from "utils/ramda-helpers"

export function maybeSetDimensionError(chartType) {
  return ifElse(
    (dimension) => dimension.type && (!dimension.inactive || dimension.loading),
    (dimension, index) => {
      const dimensionSpec = CHARTS[chartType].dimensions[index]
      if (
        typeof dimensionSpec === "object" &&
        typeof dimensionSpec.type === "object" &&
        typeof dimension.type === "string"
      ) {
        return set(
          lensProp("isError"),
          !(dimension.type in dimensionSpec.type)
        )(dimension)
      } else {
        return set(lensProp("isError"), false)(dimension)
      }
    },
    set(lensProp("isError"), false)
  )
}

/*
  Accepts a collection of dimensions and returns a new collection with
  the appropriate isError property
*/
export default (chartType) => mapIdx(maybeSetDimensionError(chartType))
