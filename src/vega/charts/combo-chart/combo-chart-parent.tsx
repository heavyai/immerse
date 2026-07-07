// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useCallback, useState } from "react"
import { defaultMemoize } from "reselect"
import { shallowEqualObjects } from "shallow-equal"

import { VegaComboChart } from "vega/charts/types"
import ComboChart from "./combo-chart"
import "./styles.scss"

type Props = {
  chart: VegaComboChart & { height: number }
}

export const ComboChartWithRangeChart: FC<Props> = (props) => {
  const [zoomToFocus, setZoomToFocus] = useState(null)
  const [zoomToRange, setZoomToRange] = useState(null)
  const focusHeight = Math.round(props.chart.height * 0.667)
  const rangeHeight = props.chart.height - focusHeight
  const legendHeight = props.chart.height

  const communicateToFocus = useCallback(
    defaultMemoize(setZoomToFocus, shallowEqualObjects),
    [setZoomToFocus]
  )
  const communicateToRange = useCallback(
    defaultMemoize(setZoomToRange, shallowEqualObjects),
    [setZoomToRange]
  )

  return (
    <div className="vega-combo-with-range">
      <div className="vega-combo-focus-chart">
        <ComboChart
          {...props}
          height={focusHeight}
          legendHeight={legendHeight}
          communicateZoom={communicateToRange}
          zoomTo={zoomToFocus}
        />
      </div>
      <div className="vega-combo-range-chart">
        <ComboChart
          {...props}
          isRangeChart
          height={rangeHeight}
          communicateZoom={communicateToFocus}
          zoomTo={zoomToRange}
        />
      </div>
    </div>
  )
}

const ComboChartParent: FC<Props> = (props) =>
  props.chart.rangeChartEnabled ? (
    <ComboChartWithRangeChart {...props} />
  ) : (
    <ComboChart {...props} />
  )

export default ComboChartParent
