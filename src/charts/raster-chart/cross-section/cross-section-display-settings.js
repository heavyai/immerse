// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch } from "react-redux"
import { CHART_TYPES } from "constants/chart-types"
import { useCurrentEditingChart } from "charts/utils/hooks"
import { updateRasterChart } from "charts/raster-chart/raster-chart-actions"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import CustomSlider from "components/custom-slider/custom-slider"

export function CrossSectionDisplaySettings() {
  const { chartId, chart } = useCurrentEditingChart()
  const dispatch = useDispatch()

  const { type, rasterLayerId, savedColors, smoothing, searchDistance } = chart

  const updateSmoothing = (value) => {
    dispatch(
      updateRasterChart(chartId, {
        smoothing: value
      })
    )
  }

  const updateSearchDistance = (value) => {
    dispatch(
      updateRasterChart(chartId, {
        searchDistance: value
      })
    )
  }

  return (
    <div key={rasterLayerId} data-testid="cross-section-display-settings">
      <div className="chart-editor-section color-palette">
        <div className="chart-editor-label">{"Color Palette"}</div>
        <ColorPickerParent id={chartId} savedColors={savedColors} />
      </div>

      <div className="chart-editor-section smoothing">
        <div className="chart-editor-label">Smoothing</div>
        <div className="interval-settings-container">
          <CustomSlider
            testid="cross-section-smoothing"
            defaultValue={smoothing}
            max={100}
            min={2}
            onValueChange={updateSmoothing}
            step={1}
          />
        </div>
      </div>

      {type === CHART_TYPES.CROSS_SECTION && (
        <>
          <div className="chart-editor-section search-distance">
            <div className="chart-editor-label">Search Distance</div>
            <div className="interval-settings-container">
              <CustomSlider
                defaultValue={searchDistance}
                testid="cross-section-search-distance"
                max={10}
                min={0.01}
                onValueChange={updateSearchDistance}
                step={0.1}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CrossSectionDisplaySettings
