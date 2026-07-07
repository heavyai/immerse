// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import CustomSlider from "components/custom-slider/custom-slider"
import { MS_IN_SECONDS } from "constants/magic-variables"

const MICRO_STEP = 0.01
const STEP = 1

export interface DimensionBinRangeSettingsProps {
  dimension: any
  onBlur: React.EventHandler<React.SyntheticEvent>
  onFocus: React.EventHandler<React.SyntheticEvent>
  updateBinRangeSlider: (value: number | [number, number]) => void
  updateBinSlider: (value: number) => void
}
function shouldDateToNumber(value) {
  return value instanceof Date ? value.getTime() / MS_IN_SECONDS : value
}

export function calculateBinSize(dimension) {
  const high = dimension.currentHighValue
  const low = dimension.currentLowValue
  const size =
    (shouldDateToNumber(high) - shouldDateToNumber(low)) / dimension.numOfBins
  return parseFloat(size).toFixed(2)
}

export default DimensionBinRangeSettings
function DimensionBinRangeSettings({
  dimension,
  updateBinSlider,
  updateBinRangeSlider,
  onFocus,
  onBlur
}: DimensionBinRangeSettingsProps) {
  const sliderRange = [
    shouldDateToNumber(dimension.currentLowValue),
    shouldDateToNumber(dimension.currentHighValue)
  ]

  return (
    <div className="bin-settings-container">
      <div className="bin-settings-section">
        <div className="chart-editor-label">
          {`# of Bins (Size: ${calculateBinSize(dimension)})`}
        </div>
        <CustomSlider
          defaultValue={dimension.numOfBins}
          testid={"bin-size"}
          max={dimension.maxBinSize}
          min={2}
          onBlur={onBlur}
          onFocus={onFocus}
          onValueChange={updateBinSlider}
        />
      </div>
      <div className="bin-settings-section">
        <div className="chart-editor-label center">{"Min / Max"}</div>
        <CustomSlider
          allowCross
          defaultValue={sliderRange}
          testid={"bin-range"}
          max={shouldDateToNumber(dimension.max_val)}
          min={shouldDateToNumber(dimension.min_val)}
          onBlur={onBlur}
          onFocus={onFocus}
          onValueChange={updateBinRangeSlider}
          range
          step={calculateBinSize(dimension) < STEP ? MICRO_STEP : STEP}
        />
      </div>
    </div>
  )
}
