// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { SyntheticEvent } from "react"
import { ChartFieldAssignment } from "components/sql-notebook/types"
import { IChartSpecificSettings } from "../visualization-settings"
import NumericalSlider from "vega/components/NumericalSlider/NumericalSlider"
import {
  DEFAULT_LINE_RANGE,
  DEFAULT_LINE_WIDTH
} from "../../vega-map/constants"
import Slider from "@material-ui/core/Slider"
import Switch from "widgets/switch/Switch"
import { RenderLimitSlider } from "../render-limit-slider"
import {
  LINE_RENDER_LIMIT_DEFAULT,
  LINE_RENDER_LIMIT
} from "components/sql-notebook/constants"

export const LineMapSettings: React.FC<IChartSpecificSettings> = ({
  assignedChartFields,
  chartSettings,
  updateSettings
}) => {
  return (
    <div className="sql-notebook__pointmap-settings">
      {assignedChartFields[ChartFieldAssignment.SIZE]?.active ? (
        <div className="sql-notebook-visualization-view__field-wrapper">
          <div className="size-range-slider">
            <span>Stroke Range</span>
            <Slider
              value={chartSettings.sizeRange || DEFAULT_LINE_RANGE}
              max={20}
              min={1}
              onChange={(_, v: number | number[]) =>
                updateSettings({
                  sizeRange: v as number[]
                })
              }
              valueLabelDisplay="auto"
            />
          </div>
        </div>
      ) : (
        <div className="sql-notebook-visualization-view__field-wrapper">
          <div className="sql-notebook-visualization-view__field-container">
            <div className="sql-notebook-visualization-view__chart-field">
              <NumericalSlider
                label={"Stroke Width"}
                value={chartSettings?.strokeWidth ?? DEFAULT_LINE_WIDTH}
                max={12}
                min={1}
                step={1}
                onChange={(val) => {
                  updateSettings({
                    strokeWidth: val
                  })
                }}
              />
            </div>
          </div>
        </div>
      )}
      {!assignedChartFields[ChartFieldAssignment.COLOR]?.active && (
        <div className="sql-notebook-visualization-view__field-wrapper">
          <div className="dot-density">
            <span>Color by density: </span>
            <Switch
              checked={chartSettings.dotDensity}
              onChange={(e: SyntheticEvent) =>
                updateSettings({
                  dotDensity: e.target?.checked
                })
              }
            />
          </div>
        </div>
      )}
      <RenderLimitSlider
        updateSettings={updateSettings}
        value={chartSettings.renderLimit ?? LINE_RENDER_LIMIT_DEFAULT}
        max={LINE_RENDER_LIMIT}
      />
    </div>
  )
}
