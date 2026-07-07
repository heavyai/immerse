// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import ColorPickerParent from "components/color-picker/color-picker-parent"
import ChartFormatting from "components/chart-settings/chart-formatting"

const NumberChartSettings = (props) => {
  return (
    <div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Color Palette"}</div>
        <ColorPickerParent
          id={props.id}
          savedColors={props.chart.savedColors}
        />
      </div>
      <ChartFormatting
        measures={props.measures}
        onMeasureFormat={props.onMeasureValueChangeWithFormat}
        onDimensionFormat={props.onDimensionValueChangeWithFormat}
      />
    </div>
  )
}

export default NumberChartSettings
