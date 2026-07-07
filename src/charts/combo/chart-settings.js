// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from "react"

import {
  toggleRangeChart,
  unlockColors
} from "charts/combo/line-chart2/line2-action-creators"
import {
  useOnValueChangeWithPercentageView,
  useOnValueChangeWithChartStyle
} from "charts/utils/shared-chart-settings-handlers"

import Line2ChartSettings from "./line2-chart-settings"

const ComboChartSettings = (props) => {
  const onValueChangeWithPercentageView = useOnValueChangeWithPercentageView(
    props.id,
    props.dispatch,
    props.chart.percentageViewEnabled
  )

  const onValueChangeWithChartStyle = useOnValueChangeWithChartStyle(
    props.id,
    props.updateChart,
    props.chart.renderArea
  )

  const { id, dispatch, multiSourceIndex } = props
  const { rangeChartEnabled } = props.chart
  const onValueChangeWithRangeChart2 = useCallback(() => {
    const shouldBeOn = !rangeChartEnabled
    dispatch(toggleRangeChart(shouldBeOn, id))
  }, [id, dispatch, rangeChartEnabled])

  const onUnlockTopN = useCallback(() => {
    dispatch(unlockColors(id, multiSourceIndex))
  }, [id, dispatch, multiSourceIndex])

  return (
    <Line2ChartSettings
      onValueChangeWithRangeChart2={onValueChangeWithRangeChart2}
      renderArea={props.chart.renderArea}
      rangeChartEnabled={props.chart.rangeChartEnabled}
      id={props.id}
      color={props.chart.color}
      savedColors={props.chart.savedColors}
      formattedDimensions={props.dimensions}
      formattedMeasures={props.measures}
      multiSourceIndex={props.multiSourceIndex}
      multiSources={props.chart.multiSources}
      isMultisource={props.chart.dataSource === null}
      onDimensionValueChangeWithFormat={props.onDimensionValueChangeWithFormat}
      onMeasureValueChangeWithFormat={props.onMeasureValueChangeWithFormat}
      onValueChangeWithChartStyle={onValueChangeWithChartStyle}
      percentageViewEnabled={props.chart.percentageViewEnabled}
      onValueChangeWithPercentageView={onValueChangeWithPercentageView}
      selectedMultiSourcePanel={props.selectedMultiSourcePanel}
      onUnlockTopN={onUnlockTopN}
    />
  )
}

export default ComboChartSettings
