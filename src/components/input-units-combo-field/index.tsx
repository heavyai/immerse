// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import CustomSelector from "components/custom-selector/custom-selector"
import { TextField } from "widgets/text-field/TextField"
import { Tooltip } from "@rmwc/tooltip"

import "./input-units-combo.scss"

type Props = {
  inputProps: { type: string; min?: number; max?: number }
  onInputChange: (val: string) => void
  dropdownValue: number | string | object
  dropdownOptions: [
    {
      label: string
      value: string | number | object
      inactive?: boolean
      disabled?: boolean
    }
  ]
  onDropdownChange: (val: number, field: string) => void
  disabled?: boolean
  disabledTooltipText?: string
}

const InputUnitsComboField: FC<Props> = ({
  inputProps,
  onInputChange,
  dropdownValue,
  dropdownOptions,
  onDropdownChange,
  disabled = false,
  disabledTooltipText
}) => {
  const getInput = () => {
    return (
      <TextField
        {...inputProps}
        onChange={(e: any) => onInputChange(e.currentTarget.value)}
        disabled={disabled}
      />
    )
  }
  return (
    <div className="combo-field-container">
      {disabled && disabledTooltipText ? (
        <Tooltip content={disabledTooltipText}>
          <div>{getInput()}</div>
        </Tooltip>
      ) : (
        getInput()
      )}
      <CustomSelector
        currentValue={dropdownValue}
        onChange={(val) => onDropdownChange(val, "units")}
        options={dropdownOptions}
        className="combo-field-dropdown"
      />
    </div>
  )
}

export default InputUnitsComboField
