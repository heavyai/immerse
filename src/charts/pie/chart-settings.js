// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from "react"

import ToggleSwitchComponent from "components/toggle-switch-component/ToggleSwitchComponent"
import SegmentedControl from "components/segmented-control/segmented-control"
import ChartSettingsSortByDropDownParent from "components/chart-settings-sort-by-dropdown/chart-settings-sort-by-dropdown-parent"
import CustomSlider from "components/custom-slider/custom-slider"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import ChartFormatting from "components/chart-settings/chart-formatting"
import { PaletteMappingSelector } from "components/shared-settings/palette-mapping/palette-mapping-selector"

import { useOnValueChangeWithShowAbsoluteValues } from "charts/utils/shared-chart-settings-handlers"
import {
  resetD3ChartDomainRange,
  chartHasCategoricalColoring
} from "reducers/charts/helpers/color-helpers"
import { useSharedSettingsEnabled } from "hooks/useSharedSettingsEnabled"
import { useSharedSettings } from "hooks/useSharedSettings"

import {
  allOthersEnabledForPieMeasure,
  percentageEnabledForPieMeasure
} from "./pie-chart"

const PieChartSettings = (props) => {
  const allOthersEnabled =
    props.chart.measures[0] &&
    allOthersEnabledForPieMeasure(props.chart.measures[0])
  const percentageEnabled =
    props.chart.measures[0] &&
    percentageEnabledForPieMeasure(props.chart.measures[0])

  const onValueChangeWithPieStyle = (value) => {
    props.updateChart(props.id, { pieStyle: value })
  }

  const { id, updateChart } = props
  const { showPercentValues, showAllOthers } = props.chart
  const onValueChangeWithShowPercentValues = useCallback(() => {
    updateChart(id, { showPercentValues: !showPercentValues })
  }, [id, updateChart, showPercentValues])

  const onValueChangeWithShowAllOthers = useCallback(() => {
    const currentValue = showAllOthers
    updateChart(id, { showAllOthers: !currentValue })
  }, [id, updateChart, showAllOthers])

  const onValueChangeWithShowAbsoluteValues = useOnValueChangeWithShowAbsoluteValues(
    id,
    updateChart,
    props.chart.showAbsoluteValues
  )

  const onValueChangeWithNumberOfGroups = useCallback(
    (groups) => {
      if (
        props.chart?.dcFlag &&
        props.chart.cap !== groups &&
        !props.chart.color?.paletteMappingId
      ) {
        resetD3ChartDomainRange(props.chart)
      }
      props.onValueChangeWithCap(groups)
    },
    [props]
  )

  const sharedSettings = useSharedSettings()
  const appliedMapping = sharedSettings.mappings?.find(
    (m) => m.id === props.chart.color?.paletteMappingId
  )
  const showPaletteMappings =
    useSharedSettingsEnabled() &&
    chartHasCategoricalColoring({
      chartType: props.chart.type,
      colorType: appliedMapping?.mapping?.type ?? props.chart?.color?.type,
      chart: props.chart
    })

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
              label: "donut",
              value: "donut",
              default: props.chart.pieStyle === "donut" || !props.chart.pieStyle
            },
            {
              label: "pie",
              value: "pie",
              default: props.chart.pieStyle === "pie"
            }
          ]}
          setValue={onValueChangeWithPieStyle}
        />
      </div>
      <ToggleSwitchComponent
        configurationEnabled={props.chart.showAbsoluteValues}
        onToggleConfigurationEnabled={onValueChangeWithShowAbsoluteValues}
        label="Display Absolute Values"
        data-testid="display-absolute-values"
      />
      <ToggleSwitchComponent
        configurationEnabled={props.chart.showPercentValues}
        disabled={!percentageEnabled}
        disabledReason={
          percentageEnabled
            ? undefined
            : "This option is supported for the following aggregation types: # Records, Sum"
        }
        onToggleConfigurationEnabled={onValueChangeWithShowPercentValues}
        label="Display Percent Values"
        data-testid="display-percent-values"
      />

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
          onValueChange={onValueChangeWithNumberOfGroups}
        />
      </div>
      <ToggleSwitchComponent
        configurationEnabled={props.chart.showAllOthers}
        disabled={!allOthersEnabled}
        disabledReason={
          allOthersEnabled
            ? undefined
            : "This option is supported for the following aggregation types: # Records, Sum"
        }
        onToggleConfigurationEnabled={onValueChangeWithShowAllOthers}
        label="Show All Others"
        data-testid="show-all-others"
      />
      <ToggleSwitchComponent
        configurationEnabled={props.chart.showNullDimensions}
        onToggleConfigurationEnabled={props.onValueChangeWithShowNulls}
        label="Null Dimension"
        data-testid="null-dimension"
      />
      <div className="chart-editor-section">
        {showPaletteMappings && (
          <PaletteMappingSelector chartId={props.id} chart={props.chart} />
        )}
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

export default PieChartSettings
