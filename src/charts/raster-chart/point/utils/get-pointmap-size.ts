// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { toTransformAgg } from "../../../../utils/selector-helpers"
import {
  SIZE_DOMAIN_DEFAULTS,
  SIZE_RANGE_DEFAULTS
} from "../../../../constants/magic-variables"

export function getPointmapSize(
  sizeMeasure,
  sizeRange,
  autoSize,
  sizeDomain,
  isAgg = false
) {
  if (autoSize) {
    return "auto"
  } else if (sizeMeasure?.value) {
    return {
      type: "quantitative",
      field: sizeMeasure.value,
      label: sizeMeasure.label,
      ...(isAgg ? { aggregate: toTransformAgg(sizeMeasure.aggType) } : {}),
      domain: sizeDomain
        ? sizeDomain
        : sizeMeasure.minMax || SIZE_DOMAIN_DEFAULTS,
      range: sizeRange || SIZE_RANGE_DEFAULTS
    }
  } else {
    return sizeRange ? sizeRange[0] : SIZE_RANGE_DEFAULTS[0]
  }
}
