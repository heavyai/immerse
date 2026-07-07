// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { MultiSelect } from "widgets/multi-select/Multi-select"

import AggregateComponent from "vega/components/AggregateComponent/AggregateComponent"
import {
  Aggregate,
  ColumnAggregateExpression,
  isGroupableNumeric
} from "vega/constants/data-selection-types"
import { isIntegerType, isDictString } from "constants/data-types"
import { isHardwareDistributed } from "utils/store-utils"

import "./styles.scss"

type Props = {
  expression: ColumnAggregateExpression
  onAggregateChange: (v: Aggregate) => void
}

export type AggOptionProp = {
  value: Aggregate
  label: string
}

export const AGGREGATE_OPTIONS: AggOptionProp[] = [
  { value: "Avg", label: "Average" },
  { value: "Min", label: "Minimum" },
  { value: "Max", label: "Maximum" },
  { value: "Sum", label: "Sum" },
  { value: "# Unique", label: "# Unique" },
  { value: "Stddev", label: "Standard deviation" },
  { value: "Sample", label: "Sample" },
  { value: "Median", label: "Median" },
  { value: "Mode", label: "Mode" }
]

const AggregateSubComponent: FC<Props> = ({
  expression,
  onAggregateChange
}) => {
  let options = AGGREGATE_OPTIONS
  if (isHardwareDistributed()) {
    options = options.filter((op) => !["Median", "Mode"].includes(op.label))
  }

  if (expression && !isGroupableNumeric(expression.column)) {
    options = options.filter((op) => ["# Unique", "Mode"].includes(op.label))
  }

  if (
    expression &&
    !isDictString(expression.column) &&
    !isIntegerType(expression.column.type)
  ) {
    options = options.filter((op) => !["Mode"].includes(op.label))
  }

  let selectedValue: any = { value: null, label: null }
  if (expression && expression.column && expression.aggregate) {
    selectedValue = options.find((ao) => ao.value === expression.aggregate)
  }

  const Menu = () => (
    <AggregateComponent
      listSizeClass="compact"
      options={options}
      measure={expression}
      updateAggregate={(v) => onAggregateChange(v.value)}
    />
  )

  const enabled = options.length > 1

  return (
    <div className="selector-sub-section">
      <div className="multi-select-container">
        <div className="multiselect-wrapper" />
        <MultiSelect
          isDisabled={!enabled}
          isSearchable={false}
          noLabel={false}
          value={selectedValue}
          placeholder="Aggregation"
          components={{
            Menu,
            // We don't want to show the dropdown arrow if we're disabled and showing
            // # Unique for non-numeric. Stubbing these components with null is a way
            // to do this for MultiSelect (react-select)
            ...(!enabled && {
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null
            })
          }}
        />
      </div>
    </div>
  )
}

export default AggregateSubComponent
