// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect } from "react"
import Slider from "@material-ui/core/Slider"
import { TextField } from "widgets/text-field/TextField"
import { KEYCODE } from "constants/keycode"
import { ChartConfig } from "../types"
import { MIN_LEGEND_WIDTH_VALUE, MAX_LEGEND_WIDTH_VALUE } from "../constants"

interface Props {
  chartSettings: ChartConfig
  setChartSettings: (chartSettings: ChartConfig) => void
}

const MaxLegendWidth: FC<Props> = ({ chartSettings, setChartSettings }) => {
  const [widthValue, setWidthValue] = useState<number | number[]>(
    chartSettings.maxLegendWidth
  )

  useEffect(() => {
    setWidthValue(chartSettings.maxLegendWidth)
  }, [chartSettings])

  const isValidWidthValue = (value: number | number[]): boolean =>
    !Array.isArray(value) &&
    Number(value) > 0 &&
    Number(value) >= MIN_LEGEND_WIDTH_VALUE &&
    Number(value) <= MAX_LEGEND_WIDTH_VALUE

  const setLegendWidth = (value: number | number[]) => {
    if (isValidWidthValue(value)) {
      setChartSettings({
        ...chartSettings,
        maxLegendWidth: Number(value)
      })
    }
  }

  return (
    <div className="ui-config__chart">
      <div>Max legend width</div>

      <div className="ui-config__chart__controls">
        <Slider
          color="primary"
          min={MIN_LEGEND_WIDTH_VALUE}
          max={MAX_LEGEND_WIDTH_VALUE}
          aria-labelledby="continuous-slider"
          value={widthValue}
          onChange={(e: React.ChangeEvent<{}>, value: number | number[]) =>
            setWidthValue(value)
          }
          onChangeCommitted={(e, value) => {
            // This will rerender the chart, so only fire when user has released slider
            setLegendWidth(value)
          }}
          track="normal"
        />
        <TextField
          value={widthValue}
          onChange={(e) => setWidthValue(e.currentTarget.value)}
          onBlur={(e) => {
            setLegendWidth(e.currentTarget.value)
          }}
          onKeyUp={(e) => {
            if (e.keyCode === KEYCODE.Enter) {
              setLegendWidth(e.currentTarget.value)
            }
          }}
        />
        <span>px</span>
      </div>

      {!isValidWidthValue(widthValue) && (
        <p className="ui-config__error">
          Enter a numeric value above {MIN_LEGEND_WIDTH_VALUE} and below{" "}
          {MAX_LEGEND_WIDTH_VALUE}
        </p>
      )}
    </div>
  )
}

export default MaxLegendWidth
