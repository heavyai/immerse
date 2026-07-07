// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from "react"

import SegmentedControl from "components/segmented-control/segmented-control"

import { isEmpty } from "utils/selector-helpers"
import ChartFormatting from "components/chart-settings/chart-formatting"
import NullToggle from "charts/components/null-toggle"
import {
  useOnValueChangeWithShowNullMeasures,
  useOnValueChangeWithNullOrder
} from "charts/utils/shared-chart-settings-handlers"

import { NULLS_FIRST, NULLS_LAST } from "constants/magic-variables"

import { SimpleSelect } from "react-selectize"
import Toggle from "react-toggle"

import "./chart-settings.css"

const borderOptions = [
  {
    label: "None",
    value: "none"
  },
  {
    label: "Each Cell",
    value: "each"
  },
  {
    label: "Between Columns",
    value: "between-columns"
  },
  {
    label: "Between Rows",
    value: "between-rows"
  }
]

const TableChartSettings = (props: any) => {
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

  const { id, updateChart } = props
  const onValueChangeWithTableCellBorders = useCallback(
    (renderTableBorders) => {
      updateChart(id, { renderTableBorders })
    },
    [id, updateChart]
  )

  const toggleZebraStriping = () => {
    const currentValue = props.chart.zebraStriping
    props.updateChart(props.id, { zebraStriping: !currentValue })
  }

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
      <div className="chart-editor-section">
        <div className="chart-editor-label">Zebra Striping</div>
        <Toggle
          id="zebra-striping-toggle"
          checked={props.chart.zebraStriping}
          onChange={() => toggleZebraStriping()}
        />
        <div className="chart-editor-label">{"Border options"}</div>
        <div className="format-selector-wrapper">
          <SimpleSelect
            theme="format-selector"
            value={
              borderOptions.find(
                (opt) => opt.value === props.chart.renderTableBorders
              ) || borderOptions[0]
            }
            onValueChange={(opt) =>
              onValueChangeWithTableCellBorders(opt?.value || "none")
            }
            options={borderOptions}
            renderOption={(option) => (
              <div className="simple-option">
                <span className="option-label">{option.label}</span>
              </div>
            )}
          />
        </div>
      </div>
      <ChartFormatting
        dimensions={props.dimensions}
        measures={props.measures}
        onMeasureFormat={props.onMeasureValueChangeWithFormat}
        onDimensionFormat={props.onDimensionValueChangeWithFormat}
        allowMeasureDateFormatting
      />
    </div>
  )
}

export default TableChartSettings
