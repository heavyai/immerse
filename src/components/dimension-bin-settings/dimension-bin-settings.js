// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import DimensionBinRangeSettings from "./dimension-bin-range-settings"
import { dimensionShape } from "constants/prop-types"
import { COLUMN_CARDINALITY_THRESHOLD } from "constants/magic-variables"
import Toggle from "react-toggle"

DimensionBinSettings.propTypes = {
  dimension: dimensionShape.isRequired,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  updateBinRangeSlider: PropTypes.func.isRequired,
  updateBinSlider: PropTypes.func.isRequired,
  updateIsBinned: PropTypes.func.isRequired,
  chartType: PropTypes.string.isRequired
}
const disableUnbinning = (dimension, chartType) =>
  dimension.cardinality > COLUMN_CARDINALITY_THRESHOLD &&
  (chartType === "histogram" ||
    chartType === "line" ||
    chartType === "line2" ||
    chartType === "heat")
export default function DimensionBinSettings({
  dimension,
  updateIsBinned,
  updateBinSlider,
  updateBinRangeSlider,
  onFocus,
  onBlur,
  chartType
}) {
  return (
    <div className="bin-settings">
      <label className="bin-settings-toggle">
        <Toggle
          disabled={disableUnbinning(dimension, chartType)}
          checked={dimension.isBinned}
          onChange={updateIsBinned}
        />
        <span className="bin-settings-toggle-label">
          {dimension.isBinned ? "Binning ON" : "Binning OFF"}
        </span>
      </label>
      {dimension.isBinned && (
        <DimensionBinRangeSettings
          dimension={dimension}
          onBlur={onBlur}
          onFocus={onFocus}
          updateBinRangeSlider={updateBinRangeSlider}
          updateBinSlider={updateBinSlider}
        />
      )}
    </div>
  )
}
