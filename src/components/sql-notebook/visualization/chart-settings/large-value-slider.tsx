// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Slider } from "@material-ui/core"
import { formatNumber } from "charts/utils/coordinate-helpers"
import React from "react"

/**
 * Non linear slider for large value ranges. This will use larger intervals for
 * higher values and smaller intervals as the value gets smaller
 */
export const LargeValueSlider = ({
  value,
  max,
  min,
  step,
  onChange
}: {
  value: number
  max: number
  min: number
  step: number
  onChange: (v: number) => void
}) => {
  function displayValue(v: number) {
    return v ** 2
  }
  function sliderValue(v: number) {
    return Math.round(Math.sqrt(v))
  }
  return (
    <Slider
      value={sliderValue(value)}
      max={sliderValue(max)}
      min={sliderValue(min)}
      step={sliderValue(step)}
      scale={displayValue}
      onChange={(_, v: number | number[]) =>
        onChange(displayValue(v as number))
      }
      valueLabelDisplay="auto"
      valueLabelFormat={formatNumber}
    />
  )
}
