// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useRef, useState } from "react"
import { Slider } from "widgets/slider/Slider"
import { TextField } from "widgets/text-field/TextField"
import { debounce } from "lodash"

import "./styles.scss"

const DEFAULT_MAX = 100000
const DEFAULT_MIN = 0
const DEFAULT_STEP = 1
const DEBOUNCE_INTERVAL = 100

type Props = {
  /** A label for the numerical slider */
  label?: string

  /** Minimum value (default 0) */
  min?: number

  /** Maximum value (default 100) */
  max?: number

  /** "Step" for each slide increment (default 1) */
  step?: number

  /** "Step" for textField (number for specific number type and any for any number */
  textInputStep?: number | string

  /** Current value */
  value: number

  /** Fired when the value changes */
  onChange?: (v: number) => void

  testId?: string
}

const NumericalSlider: FC<Props> = ({
  label,
  max,
  min,
  step,
  textInputStep,
  value,
  onChange,
  testId = "numerical-slider"
}) => {
  const fire = useRef()

  // setCurrentValue updates when:
  //  1. User types *valid* input into text input
  //  2. User moves the slider
  const [currentValue, setCurrentValue] = useState(value)
  // currentTextInputValue gets updated when:
  //  1. User types in input (regardless of validity)
  //  2. User moves the slider
  const [currentTextInputValue, setCurrentTextInputValue] = useState(value)
  // inputValid becomes false if the user enters an incorrect value into the
  // input box
  const [inputValid, setInputValid] = useState(true)

  const setCurrentValueAndFire = (v: number) => {
    setInputValid(true)
    if (v !== currentValue) {
      setCurrentValue(v)
      setCurrentTextInputValue(v)
      fire.current(v)
    }
  }
  const setCurrentValueIfValid = (v: string) => {
    setCurrentTextInputValue(v)
    if (Number(v) >= min && Number(v) <= max) {
      if (textInputStep && textInputStep === "any") {
        setCurrentValueAndFire(Number(v))
      } else if (!textInputStep && v.match(/^\d+$/)) {
        setCurrentValueAndFire(Number(v))
      }
    } else {
      setInputValid(false)
    }
  }

  useEffect(() => {
    setCurrentValue(value)
    setCurrentTextInputValue(value)
  }, [value])

  useEffect(() => {
    fire.current = debounce(onChange, DEBOUNCE_INTERVAL)
  }, [onChange])

  // The `key` field on the Slider forces the Slider to get destroyed/recreated
  // any time min and/or max change. This is important because if both min and
  // max change such that the new max is less than the old min, it'll throw an
  // exception in @material/slider/foundation.js. This is because it'll try to
  // update the max before it updates the min, so it happens even if the new
  // min <= new max.
  return (
    <div className="numerical-slider" data-testid={testId}>
      {label && <header>{label}</header>}
      <Slider
        key={`slider-${min}-${max}`}
        max={max || DEFAULT_MAX}
        min={min || DEFAULT_MIN}
        step={step || DEFAULT_STEP}
        value={currentValue}
        aria-labelledby="continuous-slider"
        onInput={({ detail: { value: v } }) => setCurrentValueAndFire(v)}
      />
      <TextField
        max={max || DEFAULT_MAX}
        min={min || DEFAULT_MIN}
        pattern="[0-9]+([\.,][0-9]+)?"
        invalid={!inputValid}
        step={textInputStep || DEFAULT_STEP}
        value={currentTextInputValue}
        onChange={({ target: { value: v } }) => setCurrentValueIfValid(v)}
      />
    </div>
  )
}
export default NumericalSlider
