// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import SegmentedControl from "components/segmented-control/segmented-control"

import { isEmpty } from "utils/selector-helpers"
import ChartFormatting from "components/chart-settings/chart-formatting"
import NullToggle from "charts/components/null-toggle"

import { NULLS_FIRST, NULLS_LAST } from "constants/magic-variables"

import {
  useOnValueChangeWithShowNullMeasures,
  useOnValueChangeWithNullOrder
} from "charts/utils/shared-chart-settings-handlers"

const DefaultChartSettings = (props: any) => {
  const onValueChangeWithShowNullMeasures = useOnValueChangeWithShowNullMeasures(
    props.id,
    props.updateChart,
    props.chart.showNullMeasures
  )
  const onValueChangeWithNullOrder = useOnValueChangeWithNullOrder(
    props.id,
    props.updateChart
  )

  const shouldShowNullsOrder = isEmpty(props.chart.dimensions)
  const isNullsOrderActive = Boolean(props.chart.sortColumn)
  return (
    <div>
      {!shouldShowNullsOrder && (
        <div className="chart-editor-nulls-options">
          <NullToggle
            checked={props.chart.showNullDimensions}
            onChange={props.onValueChangeWithShowNulls}
          />
          <NullToggle
            onChange={onValueChangeWithShowNullMeasures}
            checked={props.chart.showNullMeasures}
            label="Rows with nulls"
            id="null-rows"
          />
        </div>
      )}
      {shouldShowNullsOrder && (
        <div
          className={`chart-editor-section ${
            isNullsOrderActive ? "" : "disabled"
          }`}
        >
          <div className="chart-editor-label">{"NULLS order"}</div>
          <SegmentedControl
            id="chart-style"
            name="chartStyle"
            options={[
              {
                label: "first",
                value: NULLS_FIRST,
                default: props.chart.nullsOrder === NULLS_FIRST
              },
              {
                label: "last",
                value: NULLS_LAST,
                default: props.chart.nullsOrder !== NULLS_FIRST
              }
            ]}
            setValue={onValueChangeWithNullOrder}
          />
        </div>
      )}
      <ChartFormatting
        dimensions={props.dimensions}
        measures={props.measures}
        onMeasureFormat={props.onMeasureValueChangeWithFormat}
        onDimensionFormat={props.onDimensionValueChangeWithFormat}
      />
    </div>
  )
}

export default DefaultChartSettings
