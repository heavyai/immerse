// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { lensIndex, find } from "ramda"

import ChartSettingsSortByDropDownParent from "components/chart-settings-sort-by-dropdown/chart-settings-sort-by-dropdown-parent"
import CustomSlider from "components/custom-slider/custom-slider"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import ChartFormatting from "components/chart-settings/chart-formatting"
import { isPercentageViewVisible } from "charts/combo/line-chart2/utils"
import { PercentageViewToggle } from "charts/combo/line2-chart-settings"
import NullToggle from "charts/components/null-toggle"

import { useOnValueChangeWithPercentageView } from "charts/utils/shared-chart-settings-handlers"

const first = find(lensIndex(0))

function getFirst(list) {
  const newList = first(list)
  return newList ? [newList] : []
}

const BarChartSettings = (props) => {
  const { chart: { percentageViewEnabled = false } = {} } = props

  const onValueChangeWithPercentageView = useOnValueChangeWithPercentageView(
    props.id,
    props.dispatch,
    props.chart.percentageViewEnabled
  )

  return (
    <div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Sort By"}</div>
        <ChartSettingsSortByDropDownParent
          chartId={props.id}
          dimensions={getFirst(props.chart.dimensions)}
          measures={getFirst(props.chart.measures)}
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
          onValueChange={props.onValueChangeWithCap}
        />
      </div>
      {isPercentageViewVisible(props.chart.dimensions, false) ? (
        <PercentageViewToggle
          {...{
            percentageViewEnabled,
            onValueChangeWithPercentageView
          }}
        />
      ) : null}
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

export default BarChartSettings
