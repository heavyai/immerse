// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from "react"
import { useDispatch } from "react-redux"

import * as GeoHeatActions from "charts/raster-chart/geoheat-actions"
import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"

import {
  DEFAULT_GEOHEAT_MARK,
  DEFAULT_GEOHEAT_PIXEL_SIZE,
  layerDefaultOpacity,
  MAX_PIXEL_BIN_SIZE
} from "constants/magic-variables"

import CustomSlider from "components/custom-slider/custom-slider"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import ChartSettingsBasemapDropdownParent from "components/chart-settings-basemap-dropdown/chart-settings-basemap-dropdown-parent"
import CustomSelector from "components/custom-selector/custom-selector"
import { useCurrentEditingChart } from "charts/utils/hooks"

const GeoheatChartSettings = () => {
  const dispatch = useDispatch()
  const { chart, chartId } = useCurrentEditingChart()
  const onValueChangeWithGapSize = useCallback(
    (value) => {
      dispatch(GeoHeatActions.setPixelSize(chartId, value))
    },
    [dispatch, chartId]
  )

  const onValueChangeWithMarkType = useCallback(
    (value) => {
      dispatch(GeoHeatActions.setMarkType(chartId, value))
    },
    [dispatch, chartId]
  )

  const onValueChangeWithOpacity = useCallback(
    (value) => {
      dispatch(
        RasterChartActions.updateRasterChart(chartId, {
          opacity: (value / 100).toFixed(2)
        })
      )
    },
    [dispatch, chartId]
  )

  return (
    <div>
      <div className="chart-editor-section map-themes">
        <div className="chart-editor-label">{"Map Theme"}</div>
        <ChartSettingsBasemapDropdownParent chartId={chartId} />
      </div>
      <div>
        <div className="chart-editor-section">
          <div className="chart-editor-label">{"Bin Shape"}</div>
          <div className="chart-settings-row">
            <CustomSelector
              className="sort-by-dropdown"
              currentValue={chart?.mark || DEFAULT_GEOHEAT_MARK}
              onChange={onValueChangeWithMarkType}
              options={[
                { label: "Square", value: "square" },
                { label: "Hexagon", value: "hex" }
              ]}
            />
          </div>
        </div>
        <div className="chart-editor-section size-range">
          <div className="chart-editor-label">{"Bin Pixel Size"}</div>
          <CustomSlider
            testid={"bin-pixel-size"}
            defaultValue={chart?.pixelSize || DEFAULT_GEOHEAT_PIXEL_SIZE}
            max={MAX_PIXEL_BIN_SIZE}
            min={1}
            onValueChange={onValueChangeWithGapSize}
            step={1}
          />
        </div>
        <div className="chart-editor-section opacity-slider">
          <div className="chart-editor-label">{"Layer Opacity"}</div>
          <CustomSlider
            defaultValue={
              (typeof chart?.opacity === "undefined"
                ? layerDefaultOpacity(chart?.type)
                : chart?.opacity) * 100
            }
            testid={"layer-opacity"}
            max={100}
            min={0}
            onValueChange={onValueChangeWithOpacity}
            step={1}
          />
        </div>
        <div className="chart-editor-section">
          <div className="chart-editor-label">{"Color Palette"}</div>
          <ColorPickerParent id={chartId} savedColors={chart?.savedColors} />
        </div>
      </div>
    </div>
  )
}

export default GeoheatChartSettings
