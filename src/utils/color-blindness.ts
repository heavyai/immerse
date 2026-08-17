// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Deficiency, simulate } from "@bjornlu/colorblind"
import tinycolor from "tinycolor2"

export function simulateColorBlindness(
  color: string,
  deficiency: Deficiency
): string {
  const parsedColor = tinycolor(color)
  if (!parsedColor.isValid()) {
    return color
  }

  return tinycolor(simulate(parsedColor.toRgb(), deficiency)).toHexString()
}
