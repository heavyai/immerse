// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from "react"
import cx from "classnames"
import Slider from "@material-ui/core/Slider"
import { TextField } from "widgets/text-field/TextField"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import { CommonInputProps } from "./parameter-widget-types"
import getNumberPrecision from "../../utils/get-number-precision"
import { NUMBER_STEP_PRECISIONS } from "../parameters/constants"

const validatedValue = (
  value: string,
  min: string | null,
  max: string | null
) => {
  const numericValue = parseFloat(value)

  if (isNaN(numericValue)) {
    return null
  }

  // If user attempts to submit a value out of range, force to min or max.
  if (min !== null && numericValue < parseFloat(min)) {
    return min
  } else if (max !== null && numericValue > parseFloat(max)) {
    return max
  }

  // Return this instead of the original value since parseFloat trims alpha chars
  return numericValue.toString()
}

const getAutoStepPrecision = (min, max, resetValue) => {
  const sliderConfigValues = { min, max, resetValue }
  const precisions = Object.keys(sliderConfigValues).map((k) =>
    getNumberPrecision(parseFloat(sliderConfigValues[k]))
  )
  const highestPrecision = Math.max(...precisions)
  if (highestPrecision <= 0) {
    return 1
  }
  return highestPrecision <= 0
    ? 1
    : parseFloat(`0.${"0".repeat(highestPrecision - 1)}1`)
}

type Props = CommonInputProps & {
  min?: string | null
  max?: string | null
  stepPrecision?: number | "auto"
  disabled: boolean
}

const ParameterWidgetInputNumeric = ({
  value,
  setValue,
  min = null,
  max = null,
  resetToDefaultValue,
  showReset,
  disabled = false,
  stepPrecision = NUMBER_STEP_PRECISIONS.AUTO,
  resetValue
}: Props) => {
  const [localValue, setLocalValue] = useState<string>(value)
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const submitLocalValue = useCallback(() => {
    const newValue = validatedValue(localValue, min, max)
    if (newValue === null) {
      resetToDefaultValue()
    } else {
      setValue(newValue)
    }
    setLocalValue(value)
  }, [localValue, max, min, setValue, value, resetToDefaultValue])

  return (
    <div className="parameter-widget__numeric-input">
      {min && max && (
        <div className="parameter-widget__numeric-input__slider">
          <Slider
            color="primary"
            value={parseFloat(localValue)}
            min={parseFloat(min)}
            max={parseFloat(max)}
            onChange={(_e, sliderValue) => {
              setLocalValue(sliderValue.toString())
            }}
            onChangeCommitted={(_e, sliderValue) => {
              setValue(sliderValue.toString())
            }}
            step={
              stepPrecision === NUMBER_STEP_PRECISIONS.AUTO
                ? getAutoStepPrecision(min, max, resetValue)
                : stepPrecision
            }
            aria-labelledby="continuous-slider"
            marks={[
              { value: parseFloat(min), label: min },
              { value: parseFloat(max), label: max }
            ]}
            disabled={disabled}
          />
        </div>
      )}
      <TextField
        value={localValue}
        onBlur={submitLocalValue}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur()
          }
        }}
        onClick={(e) => {
          e.currentTarget.select()
        }}
        onChange={(e) => {
          setLocalValue(e.currentTarget.value)
        }}
        trailingIcon={
          showReset && (
            <Tooltip content="Reset to default" enterDelay={500}>
              <Icon icon="replay" onClick={resetToDefaultValue} />
            </Tooltip>
          )
        }
        className={cx("parameter-widget__numeric-input__text-field", {
          "parameter-widget__numeric-input__text-field--reset-visible": showReset
        })}
        disabled={disabled}
      />
    </div>
  )
}

export default ParameterWidgetInputNumeric
