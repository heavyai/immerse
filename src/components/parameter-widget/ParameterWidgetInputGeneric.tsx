// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"
import { Tooltip } from "@rmwc/tooltip"
import { Icon } from "@rmwc/icon"
import { TextField } from "widgets/text-field/TextField"
import { CommonInputProps } from "./parameter-widget-types"

const ParameterWidgetInputGeneric = ({
  value,
  showReset,
  setValue,
  resetToDefaultValue,
  disabled = false
}: CommonInputProps) => {
  const [inputValue, setInputValue] = useState(value)
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const blurOnEnter = (e) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
  }

  const submitValue = () => {
    if (inputValue) {
      setValue(inputValue)
    } else {
      resetToDefaultValue()
      // Reset won't necessarily change the value prop, so manually re-sync
      // the input with redux.
      setInputValue(value)
    }
  }

  return (
    <TextField
      trailingIcon={
        showReset && (
          <Tooltip content="Reset to default" enterDelay={500}>
            <Icon icon="replay" onClick={resetToDefaultValue} />
          </Tooltip>
        )
      }
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={submitValue}
      onKeyDown={blurOnEnter}
      disabled={disabled}
    />
  )
}

export default ParameterWidgetInputGeneric
