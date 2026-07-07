// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import SegmentedControl from "components/segmented-control/segmented-control"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import ChartFormatting from "components/chart-settings/chart-formatting"
import Toggle from "react-toggle"
import {
  useOnValueChangeWithRangeChart,
  useOnValueChangeWithChartStyle
} from "charts/utils/shared-chart-settings-handlers"

const LineChartSettings = (props) => {
  const onValueChangeWithRangeChart = useOnValueChangeWithRangeChart(
    props.id,
    props.dispatch,
    props.chart.rangeChartEnabled
  )
  const onValueChangeWithChartStyle = useOnValueChangeWithChartStyle(
    props.id,
    props.updateChart,
    props.chart.renderArea
  )

  return (
    <div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Chart Style"}</div>
        <SegmentedControl
          hasIcons
          id="chart-style"
          name="chartStyle"
          options={[
            {
              label: "line",
              value: "line",
              default: !props.chart.renderArea
            },
            {
              label: "area",
              value: "area",
              default: props.chart.renderArea
            }
          ]}
          setValue={onValueChangeWithChartStyle}
        />
      </div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Show Range Chart"}</div>
        <Toggle
          checked={props.chart.rangeChartEnabled}
          id="range-toggle"
          onChange={onValueChangeWithRangeChart}
        />
      </div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Color Palette"}</div>
        <ColorPickerParent
          id={props.id}
          savedColors={props.chart.savedColors}
        />
      </div>
      <ChartFormatting
        dimensions={props.dimensions}
        measures={props.measures}
        onMeasureFormat={props.onMeasureValueChangeWithFormat}
        onDimensionFormat={props.onDimensionValueChangeWithFormat}
      />
    </div>
  )
}

export default LineChartSettings
