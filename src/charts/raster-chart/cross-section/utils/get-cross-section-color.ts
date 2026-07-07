// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function getCrossSectionColor(color, colorMeasure) {
  return {
    field: colorMeasure,
    type: "quantitative",
    scale: {
      range: color.reverse ? [...color.val].reverse() : color.val
    }
  }
}
