// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { BoxPlotTooltipData } from "./ChartTooltip"

import "./BoxPlotTooltip.scss"

export interface BoxPlotTooltip {
  data: BoxPlotTooltipData["data"]
}

const formatKey = (key: string) => {
  switch (key) {
    case "topOutliers":
      return "Top Outliers"
    case "bottomOutliers":
      return "Bottom Outliers"
    default:
      return key.charAt(0).toUpperCase() + key.slice(1)
  }
}

export const BoxPlotTooltip: FC<BoxPlotTooltip> = ({ data }) => (
  <>
    <div className="chart-tooltip__dimension">
      <i
        className="chart-tooltip__dimension__swatch"
        style={{ backgroundColor: data.color }}
      />
      <div className="chart-tooltip__dimension__value">{data.dimension}</div>
    </div>
    <div className="chart-tooltip__stats">
      {Object.entries(data.stats).map(([key, value]) => (
        <div key={key} className="chart-tooltip__stats__item">
          <div className="chart-tooltip__stats__item__title">
            {formatKey(key)}:
          </div>
          <div className="chart-tooltip__stats__item__value">
            {value !== null ? value : "N/A"}
          </div>
        </div>
      ))}
    </div>
  </>
)
