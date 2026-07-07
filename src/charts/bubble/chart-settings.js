// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from "react"

import CustomSlider from "components/custom-slider/custom-slider"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import ChartFormatting from "components/chart-settings/chart-formatting"
import NullToggle from "charts/components/null-toggle"
import { PaletteMappingSelector } from "components/shared-settings/palette-mapping/palette-mapping-selector"

import {
  resetD3ChartDomainRange,
  chartHasCategoricalColoring
} from "reducers/charts/helpers/color-helpers"
import { useSharedSettingsEnabled } from "hooks/useSharedSettingsEnabled"
import { useSharedSettings } from "hooks/useSharedSettings"

import {
  hasSizeMeasure,
  MIN_BUBBLE_RADIUS,
  MAX_BUBBLE_RADIUS,
  DEFAULT_BUBBLE_RADIUS,
  DEFAULT_LARGEST_BUBBLE_RELATIVE_SIZE,
  DEFAULT_SMALLEST_BUBBLE_RELATIVE_SIZE,
  BUBBLE_RELATIVE_SIZE_MINIMUM,
  BUBBLE_RELATIVE_SIZE_MAXIMUM
} from "./scatter-chart"

const ScatterChartSettings = (props) => {
  const sizeMeasureSet = hasSizeMeasure(props.chart)
  const sizedBubbleRelativeSizeRange =
    props.chart.sizedBubbleRelativeSizeRange || []
  const [
    smallestBubbleRelativeSize = undefined,
    largestBubbleRelativeSize = undefined
  ] = sizedBubbleRelativeSizeRange

  // This method gets called when there is no size measure specified on a
  // bubble chart. It updates the bubble size to a fixed radius (all of which
  // will be the same size)
  const { id, updateChart } = props
  const onBubbleSizeChange = useCallback(
    (unsizedBubbleRadius) => {
      updateChart(id, {
        unsizedBubbleRadius
      })
    },
    [id, updateChart]
  )

  // This method gets called when there is a size measure specified on a
  // bubble chart. It updates the range of bubble sizes.
  const onBubbleRelativeSizeChange = useCallback(
    (newSizedBubbleRelativeSizeRange) => {
      updateChart(id, {
        sizedBubbleRelativeSizeRange: newSizedBubbleRelativeSizeRange
      })
    },
    [id, updateChart]
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
        <div className="chart-editor-label">{"# of Groups"}</div>
        <CustomSlider
          {...props}
          defaultValue={props.chart.cap}
          testid={"number-groups"}
          min={1}
          max={500}
          onValueChange={onValueChangeWithNumberOfGroups}
        />
      </div>
      <NullToggle
        checked={props.chart.showNullDimensions}
        onChange={props.onValueChangeWithShowNulls}
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
      <div className="chart-editor-section">
        <div className="chart-editor-label">{"Bubble Size"}</div>
        {sizeMeasureSet ? (
          <CustomSlider
            testid={"bubble-size-with-size-measure"}
            range
            defaultValue={[
              smallestBubbleRelativeSize ||
                DEFAULT_SMALLEST_BUBBLE_RELATIVE_SIZE,
              largestBubbleRelativeSize || DEFAULT_LARGEST_BUBBLE_RELATIVE_SIZE
            ]}
            step={0.001}
            min={BUBBLE_RELATIVE_SIZE_MINIMUM}
            max={BUBBLE_RELATIVE_SIZE_MAXIMUM}
            onValueChange={onBubbleRelativeSizeChange}
            fuzzyValues
          />
        ) : (
          <CustomSlider
            testid={"bubble-size-without-size-measure"}
            defaultValue={
              props.chart.unsizedBubbleRadius || DEFAULT_BUBBLE_RADIUS
            }
            min={MIN_BUBBLE_RADIUS}
            max={MAX_BUBBLE_RADIUS}
            onValueChange={onBubbleSizeChange}
            fuzzyValues
          />
        )}
      </div>
    </div>
  )
}

export default ScatterChartSettings
