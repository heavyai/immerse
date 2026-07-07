// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"

import { GraphicalSettings } from "components/chart-settings/box-plot/components/graphical-settings"
import { DataFormattingSettings } from "components/chart-settings/box-plot/components/data-formatting-settings"
import { FeaturedSettings } from "components/chart-settings/box-plot/components/featured-settings"

import "../vega-combo/index.scss"

type BoxPlotChartSettingsProps = { chartId: string }

export const BoxPlotChartSettings: FC<BoxPlotChartSettingsProps> = ({
  chartId
}) => {
  // Tab / panel setup
  const [currentPanel, setCurrentPanel] = useState<"graphical" | "data">(
    "graphical"
  )

  return (
    <div
      className="vega-combo-chart-settings"
      data-testid="vega-combo-chart-settings"
    >
      <div className="chart-settings-title">Legend and Settings</div>
      <div className="featured-settings-section">
        <FeaturedSettings chartId={chartId} />
      </div>
      <div className="tab-section">
        <div className="tabs-header">
          <div className="tabs-border-wrapper">
            <div
              className={`tabs-header-item ${
                currentPanel === "graphical" ? "selected" : ""
              }`}
              onClick={() => setCurrentPanel("graphical")}
            >
              Graphical settings
            </div>
            <div
              className={`tabs-header-item ${
                currentPanel === "data" ? "selected" : ""
              }`}
              onClick={() => setCurrentPanel("data")}
            >
              Data and formatting
            </div>
          </div>
        </div>
        <div className="tabs-body">
          {currentPanel === "graphical" && (
            <GraphicalSettings chartId={chartId} />
          )}
          {currentPanel === "data" && (
            <DataFormattingSettings chartId={chartId} />
          )}
        </div>
      </div>
    </div>
  )
}
