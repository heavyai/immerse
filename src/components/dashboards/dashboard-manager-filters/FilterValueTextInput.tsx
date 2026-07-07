// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, FC } from "react"
import { TextField } from "widgets/text-field/TextField"

type Props = {
  setFilterValue: (filterValue: any) => void
  label: string
  initialValue?: string
}

const FilterValueTextInput: FC<Props> = ({
  setFilterValue,
  label,
  initialValue
}) => {
  const [value, setValue] = useState(initialValue || "")

  const onApplyValue = () => {
    setFilterValue({ value })
  }

  const onChange = (e) => {
    setValue(e.target.value)
  }

  const onKeyUp = (e) => {
    if (e.key === "Enter") {
      onApplyValue()
    }
  }

  return (
    <TextField
      value={value}
      onChange={onChange}
      onKeyUp={onKeyUp}
      label={label}
      onBlur={onApplyValue}
      // Sorry, this is immediately hit by a mysterious blur, auto-submitting
      // when we enter edit mode from the dropdown. :( Remove if you can solve
      // the mystery!
      inputRef={(input) => setTimeout(() => input && input.focus(), 0)}
      data-testid="dashboard-manager-filter-tag-text-input"
      className={"dashboard-manager-filter-tag-text-input"}
    />
  )
}

export default FilterValueTextInput
