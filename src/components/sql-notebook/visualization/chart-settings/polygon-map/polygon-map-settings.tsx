// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { SyntheticEvent } from "react"
import { IChartSpecificSettings } from "../visualization-settings"
import Switch from "widgets/switch/Switch"

import "./polygon-map-settings.scss"
import { RenderLimitSlider } from "../render-limit-slider"
import {
  POLYGON_RENDER_LIMIT,
  POLYGON_RENDER_LIMIT_DEFAULT
} from "components/sql-notebook/constants"

export const PolygonMapSettings: React.FC<IChartSpecificSettings> = ({
  chartSettings,
  updateSettings
}) => {
  return (
    <div className="sql-notebook__polygon-map-settings">
      <div className="sql-notebook-visualization-view__field-wrapper">
        <div className="border-toggle">
          <span>Border:</span>
          <Switch
            checked={chartSettings.border}
            onChange={(e: SyntheticEvent) =>
              updateSettings({
                border: e.target?.checked
              })
            }
          />
        </div>
      </div>
      <RenderLimitSlider
        value={chartSettings.renderLimit ?? POLYGON_RENDER_LIMIT_DEFAULT}
        max={POLYGON_RENDER_LIMIT}
        updateSettings={updateSettings}
      />
    </div>
  )
}
