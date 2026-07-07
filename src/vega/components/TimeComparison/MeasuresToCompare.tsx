// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import {
  ComboSizeMeasureExpression,
  CUSTOM_SQL_SELECTOR_TYPE,
  TIME_LAG_EXPRESSION_TYPE,
  TimeLagMode
} from "vega/constants/data-selection-types"
import { Switch } from "widgets/switch/Switch"
import ButtonGroup from "components/chart-settings/vega-combo/components/widgets/button-group"
import "./styles.scss"

type OwnProps = {
  sizeMeasures: ComboSizeMeasureExpression[]
  onMeasureToggle: (measureIndex: number) => void
  onMeasureModeChange: (timeLagMeasureId: string, mode: TimeLagMode) => void
}

const measureLabel = (measure: ComboSizeMeasureExpression): string => {
  if (measure.sharedCustom || measure.globalCustom) {
    return measure.sql
  }
  switch (measure.type) {
    case "count":
      return "# Records"
    case "column_aggregate":
      return measure.column.value
    case CUSTOM_SQL_SELECTOR_TYPE:
      return measure.name
    default:
      throw new Error("Unsupported measure expression type")
  }
}

const measureLabelSubtitle = (measure: ComboSizeMeasureExpression): string => {
  if (measure.sharedCustom || measure.globalCustom) {
    return "Custom"
  }

  switch (measure.type) {
    case "count":
      return "Count"
    case "column_aggregate":
      return measure.aggregate
    case CUSTOM_SQL_SELECTOR_TYPE:
      return "Custom"
    default:
      throw new Error("Unsupported measure expression type")
  }
}

const MeasuresToCompare: FC<OwnProps> = ({
  sizeMeasures,
  onMeasureToggle,
  onMeasureModeChange
}) => {
  return (
    <div className="measures-to-compare">
      <div className="measures-to-compare-header-container">
        <h3 className="measures-to-compare-header">Measures To Compare</h3>
        <p className="measures-to-compare-header-time-format">Lag Mode</p>
      </div>
      {sizeMeasures.map((sizeMeasure, index) => {
        if (sizeMeasure.type === TIME_LAG_EXPRESSION_TYPE) {
          return null
        }
        const linkedTimeLagMeasure = sizeMeasure.linkedTimeLagId
          ? sizeMeasures.find(({ id }) => sizeMeasure.linkedTimeLagId === id)
          : null
        return (
          <div className="measures-to-compare-item" key={index}>
            <Switch
              checked={Boolean(sizeMeasure.linkedTimeLagId)}
              onChange={() => onMeasureToggle(index)}
            />
            <div className="measures-to-compare-item-label-container">
              <p className="measures-to-compare-item-label">
                {measureLabel(sizeMeasure)}
              </p>
              <p className="measures-to-compare-item-label-subtext">
                {measureLabelSubtitle(sizeMeasure)}
              </p>
            </div>
            <ButtonGroup
              className="mark-types-input"
              disabled={!sizeMeasure.linkedTimeLagId}
              onButtonClick={(mode: TimeLagMode) => {
                onMeasureModeChange(sizeMeasure.linkedTimeLagId, mode)
              }}
              buttons={[
                {
                  label: "Δ",
                  value: "delta",
                  selected: linkedTimeLagMeasure
                    ? linkedTimeLagMeasure.mode === "delta"
                    : false
                },
                {
                  label: "X",
                  value: "actual",
                  selected: linkedTimeLagMeasure
                    ? linkedTimeLagMeasure.mode === "actual"
                    : false
                }
              ]}
            />
          </div>
        )
      })}
    </div>
  )
}

export default MeasuresToCompare
