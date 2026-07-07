// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useCallback } from "react"
import { useDispatch } from "react-redux"

import DeckGLBaseSettings from "./deckgl-base-settings"
import CustomSlider from "components/custom-slider/custom-slider"
import { Switch } from "widgets/switch/Switch"
import HoverSelector from "components/hover-selector/hover-selector"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import { isSelectorUsable } from "utils/selector-helpers"
import { updateChart } from "actions/update-chart-action-creator"
import { CHARTS } from "constants/charts"
import {
  STROKE_RANGE_MAX,
  STROKE_WIDTH_RANGE_DEFAULTS,
  layerDefaultOpacity
} from "constants/magic-variables"
import { useCurrentEditingChart } from "charts/utils/hooks"

const DeckGLLinemapSettings: FC = () => {
  const dispatch = useDispatch()
  const { chart, chartId } = useCurrentEditingChart()

  const updateCap = useCallback(
    (cap) => dispatch(updateChart(chartId, { cap })),
    [dispatch, chartId]
  )

  const updateOpacity = useCallback(
    (opacity) =>
      dispatch(updateChart(chartId, { opacity: (opacity / 100).toFixed(2) })),
    [dispatch, chartId]
  )

  // I'm not sure why this is always an array, but the raster charts do this?
  const updateSizeRange = useCallback(
    (range) =>
      dispatch(
        updateChart(chartId, {
          sizeRange: [range, STROKE_WIDTH_RANGE_DEFAULTS[1]]
        })
      ),
    [dispatch, chartId]
  )

  const updatePopupEnabled = useCallback(
    (evt) =>
      dispatch(updateChart(chartId, { popupEnabled: evt.target.checked })),
    [dispatch, chartId]
  )

  const isGrouped = chart.dimensions.filter(isSelectorUsable).length > 0
  return (
    <div>
      <DeckGLBaseSettings chartId={chartId} />
      <div className="chart-editor-section num-groups pointmap-num-points">
        <div className="chart-editor-label"># of Lines</div>
        <CustomSlider
          defaultValue={chart.cap}
          testid={"point-number"}
          max={CHARTS.deckgl.capMax}
          min={CHARTS.deckgl.capMin}
          onValueChange={updateCap}
          step={1}
        />
      </div>
      <div className="chart-editor-section opacity-slider">
        <div className="chart-editor-label">Layer Opacity</div>
        <CustomSlider
          defaultValue={
            (typeof chart.opacity === "undefined"
              ? layerDefaultOpacity(chart.type)
              : chart.opacity) * 100
          }
          testid="layer-opacity"
          max={100}
          min={0}
          step={1}
          onValueChange={updateOpacity}
        />
      </div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">Stroke Width</div>
        <CustomSlider
          defaultValue={
            (chart.sizeRange && chart.sizeRange[0]) ||
            STROKE_WIDTH_RANGE_DEFAULTS[0]
          }
          max={STROKE_RANGE_MAX}
          min={1}
          onValueChange={updateSizeRange}
          step={1}
        />
      </div>
      <div className="chart-editor-section popupBox">
        <div className="popup-switch-wrapper">
          <div className="chart-editor-label">Popup Box</div>
          <Switch
            disabled={false}
            checked={chart.popupEnabled}
            onChange={updatePopupEnabled}
            className="compact"
          />
        </div>
        <HoverSelector
          chartId={chartId}
          type={chart.type}
          isGrouped={isGrouped}
        />
      </div>
      <div className="chart-editor-section color-palette">
        <div className="chart-editor-label">Color Palette</div>
        <ColorPickerParent id={chartId} savedColors={chart.savedColors} />
      </div>
    </div>
  )
}

export default DeckGLLinemapSettings
