// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect } from "react"
import Slider from "@material-ui/core/Slider"
import { TextField } from "widgets/text-field/TextField"
import { KEYCODE } from "constants/keycode"
import { LabelConfig } from "../types"
import { MAX_AXIS_TRUNCATION_VALUE } from "../constants"

interface Props {
  labelSettings: LabelConfig
  setLabelSettings: (labelSettings: LabelConfig) => void
}

const AxisLabelWidth: FC<Props> = ({ labelSettings, setLabelSettings }) => {
  const [truncationValue, setTruncationValue] = useState<number | number[]>(
    labelSettings.axisTruncationLength
  )

  useEffect(() => {
    setTruncationValue(labelSettings.axisTruncationLength)
  }, [labelSettings])

  const isValidTruncationValue = (value: number | number[]): boolean =>
    !Array.isArray(value) &&
    Number(value) > 0 &&
    Number(value) <= MAX_AXIS_TRUNCATION_VALUE

  const setLabelTruncationSettings = (value: number | number[]) => {
    if (isValidTruncationValue(value)) {
      setLabelSettings({
        ...labelSettings,
        axisTruncationLength: Number(value)
      })
    }
  }

  return (
    <div className="ui-config__chart">
      <div>Axis truncation length</div>

      <div className="ui-config__chart__controls">
        <Slider
          color="primary"
          min={1}
          max={MAX_AXIS_TRUNCATION_VALUE}
          aria-labelledby="continuous-slider"
          value={truncationValue}
          onChange={(e: React.ChangeEvent<{}>, value: number | number[]) =>
            setTruncationValue(value)
          }
          onChangeCommitted={(e, value) => {
            // This will rerender the chart, so only fire when user has released slider
            setLabelTruncationSettings(value)
          }}
          track="normal"
        />
        <TextField
          value={truncationValue}
          onChange={(e) => setTruncationValue(e.currentTarget.value)}
          onBlur={(e) => {
            setLabelTruncationSettings(e.currentTarget.value)
          }}
          onKeyUp={(e) => {
            if (e.keyCode === KEYCODE.Enter) {
              setLabelTruncationSettings(e.currentTarget.value)
            }
          }}
        />
        <span>px</span>
      </div>

      {!isValidTruncationValue(truncationValue) && (
        <p className="ui-config__error">
          Enter a numeric value above 0 and below {MAX_AXIS_TRUNCATION_VALUE}
        </p>
      )}
    </div>
  )
}

export default AxisLabelWidth
