// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import ChartSettingsSortByDropDownParent from "components/chart-settings-sort-by-dropdown/chart-settings-sort-by-dropdown-parent"
import CustomSlider from "components/custom-slider/custom-slider"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import ChartFormatting from "components/chart-settings/chart-formatting"
import NullToggle from "charts/components/null-toggle"

const RowChartSettings = (props) => {
  return (
    <div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Sort By"}</div>
        <ChartSettingsSortByDropDownParent
          chartId={props.id}
          dimensions={props.chart.dimensions}
          measures={props.chart.measures}
          sortColumn={props.chart.sortColumn}
        />
      </div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"# of Groups"}</div>
        <CustomSlider
          {...props}
          defaultValue={props.chart.cap}
          testid={"number-groups"}
          min={1}
          max={500}
          onValueChange={props.onValueChangeWithCap}
        />
      </div>
      <NullToggle
        checked={props.chart.showNullDimensions}
        onChange={props.onValueChangeWithShowNulls}
      />
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
export default RowChartSettings
