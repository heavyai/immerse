// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { toTransformAgg } from "../../utils/selector-helpers"

export function getPointmapOrientation(orientaionMeasure, isAgg = false) {
  if (orientaionMeasure && orientaionMeasure.value) {
    return {
      type: "quantitative",
      field: orientaionMeasure.value,
      label: orientaionMeasure.label,
      ...(isAgg
        ? { aggregate: toTransformAgg(orientaionMeasure.aggType) }
        : {}),
      domain: [0, 360], // assuming angle measure is degrees
      range: [0, 360]
    }
  } else {
    return undefined
  }
}
