// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { SyntheticEvent } from "react"
import { ChartFieldAssignment } from "components/sql-notebook/types"
import { IChartSpecificSettings } from "../visualization-settings"
import NumericalSlider from "vega/components/NumericalSlider/NumericalSlider"
import {
  DEFAULT_POINT_SIZE,
  DEFAULT_SIZE_RANGE
} from "../../vega-map/constants"
import Switch from "widgets/switch/Switch"
import Slider from "@material-ui/core/Slider"
import { RenderLimitSlider } from "../render-limit-slider"
import {
  POINT_RENDER_LIMIT,
  POINT_RENDER_LIMIT_DEFAULT
} from "components/sql-notebook/constants"

import "./pointmap-settings.scss"

export const PointmapSettings: React.FC<IChartSpecificSettings> = ({
  assignedChartFields,
  chartSettings,
  updateSettings
}) => {
  return (
    <div className="sql-notebook__pointmap-settings">
      {assignedChartFields[ChartFieldAssignment.SIZE]?.active ? (
        <div className="sql-notebook-visualization-view__field-wrapper">
          <div className="size-range-slider">
            <span>Size Range</span>
            <Slider
              value={chartSettings.sizeRange || DEFAULT_SIZE_RANGE}
              max={30}
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
                label={"Point Size"}
                value={chartSettings?.pointSize ?? DEFAULT_POINT_SIZE}
                max={12}
                min={1}
                step={1}
                onChange={(val) => {
                  updateSettings({
                    pointSize: val
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
            <span>Dot Density: </span>
            <Switch
              aria-label="dotDensity"
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
        max={POINT_RENDER_LIMIT}
        value={chartSettings.renderLimit ?? POINT_RENDER_LIMIT_DEFAULT}
      />
    </div>
  )
}
