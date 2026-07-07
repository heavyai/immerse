// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect } from "react"
import Slider from "@material-ui/core/Slider"
import { TextField } from "widgets/text-field/TextField"
import { KEYCODE } from "constants/keycode"
import { ChartConfig } from "../types"
import { MAX_DASHBOARD_GRID_MARGIN } from "../constants"

interface Props {
  chartSettings: ChartConfig
  setChartSettings: (chartSettings: ChartConfig) => void
}

const ChartMargin: FC<Props> = ({ chartSettings, setChartSettings }) => {
  const [dashboardGridMargin, setTemporaryDashboardGridMargin] = useState<
    number | number[]
  >(chartSettings.dashboardGridMargin)

  useEffect(() => {
    setTemporaryDashboardGridMargin(chartSettings.dashboardGridMargin)
  }, [chartSettings])

  const isValidDashboardGridMargin = (value: number | number[]): boolean =>
    !Array.isArray(value) &&
    Number(value) >= 0 &&
    Number(value) <= MAX_DASHBOARD_GRID_MARGIN

  const setDashboardGridMargin = (value: number | number[]) => {
    if (isValidDashboardGridMargin(value)) {
      setChartSettings({
        ...chartSettings,
        dashboardGridMargin: Number(value)
      })
    }
  }

  return (
    <div className="ui-config__chart">
      <div>Chart margin</div>

      <div className="ui-config__chart__controls">
        <Slider
          color="primary"
          min={0}
          max={MAX_DASHBOARD_GRID_MARGIN}
          aria-labelledby="continuous-slider"
          value={dashboardGridMargin}
          onChange={(_e, value: number | number[]) =>
            setTemporaryDashboardGridMargin(value)
          }
          onChangeCommitted={(_e, value) => {
            // This will rerender the chart, so only fire when user has released slider
            setDashboardGridMargin(value)
          }}
          track="normal"
        />
        <TextField
          value={dashboardGridMargin}
          onChange={(e) =>
            setTemporaryDashboardGridMargin(e.currentTarget.value)
          }
          onBlur={(e) => {
            setDashboardGridMargin(e.currentTarget.value)
          }}
          onKeyUp={(e) => {
            if (e.keyCode === KEYCODE.Enter) {
              setDashboardGridMargin(e.currentTarget.value)
            }
          }}
        />
        <span>px</span>
      </div>

      {!isValidDashboardGridMargin(dashboardGridMargin) && (
        <p className="ui-config__error">
          Enter a numeric value above 0 and below {MAX_DASHBOARD_GRID_MARGIN}
        </p>
      )}
    </div>
  )
}

export default ChartMargin
