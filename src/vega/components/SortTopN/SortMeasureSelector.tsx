// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import cx from "classnames"

import VegaSelector from "vega/components/VegaSelector/VegaSelector"

import {
  COUNT_OPTION,
  MeasureOption,
  MeasureExpression,
  Aggregate
} from "vega/constants/data-selection-types"
import AggregateSubComponent from "vega/components/SelectorSubComponent/AggregateSubComponent"

interface Props {
  setMeasure: (measureOption: MeasureOption) => void
  setMeasureAggregate: (aggregate: Aggregate) => void
  selectedMeasure: MeasureExpression
  options: MeasureOption[]
  disabled: boolean
}

const SortMeasureSelector: FC<Props> = ({
  setMeasure,
  setMeasureAggregate,
  selectedMeasure,
  disabled,
  options
}) => {
  // This translates the selectedMeasure, which is a MeasureExpression, into a
  // an object that the VegaSelector can display as the selected option
  const selectedOption = selectedMeasure
    ? selectedMeasure.type === "count"
      ? COUNT_OPTION
      : selectedMeasure.column
    : undefined

  return (
    <div
      className={cx("selector-wrapper", {
        "dual-selector": selectedMeasure?.type === "column_aggregate"
      })}
    >
      <VegaSelector
        disabled={disabled}
        selectedOption={selectedOption}
        options={options}
        updateValue={setMeasure}
        placeholder={"Sort measure"}
      />
      {selectedMeasure?.type === "column_aggregate" && (
        <AggregateSubComponent
          expression={selectedMeasure}
          onAggregateChange={setMeasureAggregate}
        />
      )}
    </div>
  )
}

export default SortMeasureSelector
