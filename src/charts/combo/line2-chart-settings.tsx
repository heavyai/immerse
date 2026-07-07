// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
import { connect } from "react-redux"
import Toggle from "react-toggle"

import { isPercentageViewVisible } from "charts/combo/line-chart2/utils"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import SegmentedControl from "components/segmented-control/segmented-control"
import {
  getColorDimension,
  getSelectorsForSource
} from "reducers/charts/helpers/multi-source-helpers"

import NumberFormatting from "components/chart-settings/number-formatting"
import DateFormatting from "components/chart-settings/date-formatting"

interface OwnProps {
  onValueChangeWithRangeChart2: Function
  onValueChangeWithChartStyle: Function
  rangeChartEnabled: boolean
  color: any
  savedColors: any
  id: string
  renderArea: boolean
  percentageViewEnabled: boolean
  isMultisource: boolean
  formattedDimensions: Dimension[]
  formattedMeasures: Measure[]
  multiSourceIndex: number
  multiSources: any
  onDimensionValueChangeWithFormat: (value: string, index: number) => void
  onMeasureValueChangeWithFormat: (value: string, index: number) => void
  onValueChangeWithPercentageView: () => void
  selectedMultiSourcePanel: number
  onUnlockTopN: () => void
}

interface MappedProps {
  colorDimensionActive: boolean
  measures: Measure[]
  lockedTopN: boolean
}

interface PercentageViewToggleProps {
  percentageViewEnabled: boolean
  onValueChangeWithPercentageView: () => void
}
export const PercentageViewToggle = ({
  percentageViewEnabled,
  onValueChangeWithPercentageView
}: PercentageViewToggleProps) => (
  <div className="chart-editor-section">
    <div className="chart-editor-label">Percentage View</div>
    <Toggle
      checked={percentageViewEnabled}
      id="range-toggle"
      onChange={onValueChangeWithPercentageView}
    />
  </div>
)

type Props = OwnProps & MappedProps

const multiSourceLabel = (source, selectedMultiSourcePanel) => (
  <div className="chart-editor-source">
    Source {selectedMultiSourcePanel + 1}
    {source && source.table ? ` - ${source.table}` : ""}
  </div>
)

const mapStateToProps = (
  _state,
  {
    formattedDimensions,
    formattedMeasures,
    color,
    savedColors,
    isMultisource,
    multiSourceIndex
  }: OwnProps
) => {
  const measures = getSelectorsForSource(
    formattedMeasures,
    isMultisource ? multiSourceIndex : undefined
  )

  const colorDimension = getColorDimension(
    formattedDimensions,
    isMultisource ? multiSourceIndex : undefined
  )

  const colorDimensionActive = Boolean(colorDimension && colorDimension.value)

  const lockedTopN =
    colorDimensionActive &&
    (isMultisource ? color[multiSourceIndex] : color).domainIsDirty

  return {
    colorDimensionActive,
    measures,
    savedColors: savedColors[isMultisource ? multiSourceIndex : 0] || {},
    lockedTopN
  }
}

export const Line2ChartSettingsComponent = ({
  renderArea,
  onValueChangeWithChartStyle,
  rangeChartEnabled,
  onValueChangeWithRangeChart2,
  id,
  colorDimensionActive,
  savedColors,
  lockedTopN,
  onUnlockTopN,
  measures,
  multiSourceIndex,
  multiSources,
  formattedDimensions,
  onDimensionValueChangeWithFormat,
  onMeasureValueChangeWithFormat,
  percentageViewEnabled,
  onValueChangeWithPercentageView,
  isMultisource,
  selectedMultiSourcePanel
}: Props) => (
  <div
    className="chart-editor-config-panel line2-settings"
    style={{ display: "flex", flexDirection: "column", height: "100%" }}
  >
    <div className="flex-grow">
      <div className="chart-editor-section">
        {isMultisource &&
          multiSourceLabel(
            multiSources[multiSourceIndex],
            selectedMultiSourcePanel
          )}
        <div className="chart-editor-label">{"Chart Style"}</div>
        <SegmentedControl
          hasIcons
          id="chart-style"
          name="chartStyle"
          options={[
            { label: "line", value: "line", default: !renderArea },
            { label: "area", value: "area", default: renderArea }
          ]}
          setValue={onValueChangeWithChartStyle}
        />
      </div>
      {isPercentageViewVisible(formattedDimensions, isMultisource) ? (
        <PercentageViewToggle
          percentageViewEnabled={percentageViewEnabled}
          onValueChangeWithPercentageView={onValueChangeWithPercentageView}
        />
      ) : null}
      <div className="chart-editor-section">
        <div className="chart-editor-label chart-editor-visual-data-mapping-label">
          Visual Data Mapping
        </div>
        <ColorPickerParent
          id={id}
          savedColors={savedColors}
          multiSourceIndex={multiSourceIndex}
          colorDimensionActive={colorDimensionActive}
          lockedTopN={lockedTopN}
          onUnlockTopN={onUnlockTopN}
        />
      </div>
      <div className="chart-editor-secton">
        <NumberFormatting
          measures={measures}
          onNumberFormat={onMeasureValueChangeWithFormat}
        />
      </div>
    </div>
    <div className=" global-chart-settings">
      <div className="chart-editor-section">
        <DateFormatting
          selectors={formattedDimensions}
          onDateFormat={onDimensionValueChangeWithFormat}
          multiSource
        />
      </div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">Show Range Chart</div>
        <Toggle
          checked={rangeChartEnabled}
          id="range-toggle"
          onChange={onValueChangeWithRangeChart2}
        />
      </div>
    </div>
  </div>
)

const Line2ChartSettings = connect(mapStateToProps)(Line2ChartSettingsComponent)
export default Line2ChartSettings
