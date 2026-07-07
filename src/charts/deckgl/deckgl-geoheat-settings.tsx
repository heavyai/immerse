// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useCallback } from "react"
import { useDispatch } from "react-redux"

import DeckGLBaseSettings from "./deckgl-base-settings"
import CustomSlider from "components/custom-slider/custom-slider"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import { updateChart } from "actions/update-chart-action-creator"
import { useCurrentEditingChart } from "charts/utils/hooks"
import { CHARTS } from "constants/charts"
import { layerDefaultOpacity } from "constants/magic-variables"

const DeckGLGeoheatSettings: FC = () => {
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

  return (
    <div>
      <DeckGLBaseSettings chartId={chartId} />
      <div className="chart-editor-section num-groups pointmap-num-points">
        <div className="chart-editor-label">{"# of Points"}</div>
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
      <div className="chart-editor-section color-palette">
        <div className="chart-editor-label">Color Palette</div>
        <ColorPickerParent id={chartId} savedColors={chart.savedColors} />
      </div>
    </div>
  )
}

export default DeckGLGeoheatSettings
