// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useRef, useState } from "react"
import Slider from "@material-ui/core/Slider"
import { TextField } from "widgets/text-field/TextField"
import { debounce } from "lodash"
import { makeStyles } from "@material-ui/core/styles"
import { useSelector } from "react-redux"
import "./styles.scss"

const DEFAULT_MAX = 100000
const DEFAULT_MIN = 0
const DEFAULT_STEP = 1
const DEBOUNCE_INTERVAL = 500

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
  value: [number, number]

  /** Fired when the value changes */
  onChange?: (v: [number, number]) => void

  testId?: string
}

const primaryColor = "#0089D1"

const useStyles = makeStyles({
  root: {
    width: 280,
    color: ({ color }: { color?: string }) => (color ? color : primaryColor)
  },
  valueLabel: {
    top: 27,
    left: "calc(-50% - -2.3px)",
    "& > span": {
      width: 19,
      height: 19,
      color: primaryColor,
      borderRadius: "90% 0 90% 90%"
    },
    "& > span > span": {
      padding: "3px 7px 4px",
      fontSize: 10,
      borderRadius: 2,
      backgroundColor: primaryColor
    }
  }
})

const RangeSlider: FC<Props> = ({
  label,
  max,
  min,
  step,
  textInputStep,
  value,
  onChange,
  testId = "range-slider"
}) => {
  const fire = useRef()
  const buttonPrimaryColor = useSelector(
    ({ connection }: any) => connection.user.customStyles?.buttonPrimaryColor
  )
  const classes = useStyles({
    color: buttonPrimaryColor
  })
  const [currentRange, setCurrentRange] = useState<number[]>(value)
  const [currentMinTextVal, setCurrentMinTextVal] = useState<string>(
    String(value[0])
  )
  const [currentMaxTextVal, setCurrentMaxTextVal] = useState<string>(
    String(value[1])
  )

  const setCurrentValueAndFire = (event: any, v: number[]) => {
    if (v !== currentRange) {
      setCurrentRange(v as number[])
      fire.current(v)
    }
  }

  const isValidManualMin = (manualMin: number | string) => {
    manualMin = Number(manualMin)
    return manualMin >= min && manualMin < currentRange[1]
  }

  const isValidManualMax = (manualMax: number | string) => {
    manualMax = Number(manualMax)
    return manualMax <= max && manualMax > currentRange[0]
  }

  const validMinValue = isValidManualMin(currentMinTextVal)
  const validMaxValue = isValidManualMax(currentMaxTextVal)

  const setCurrentLowValueIfValid = (v: string) => {
    setCurrentMinTextVal(v)
    if (isValidManualMin(v)) {
      const updatedRange: number[] = [...currentRange]
      updatedRange[0] = Number(v)
      setCurrentValueAndFire(null, updatedRange)
    } else {
      return
    }
  }
  const setCurrentValueHighIfValid = (v: string) => {
    setCurrentMaxTextVal(v)
    if (isValidManualMax(v)) {
      const updatedRange: number[] = [...currentRange]
      updatedRange[1] = Number(v)
      setCurrentValueAndFire(null, updatedRange)
    } else {
      return
    }
  }

  const sliderOnChange = (event: any, v: string[]) => {
    if (v[0] !== currentMinTextVal) {
      setCurrentMinTextVal(v[0])
    }
    if (v[1] !== currentMaxTextVal) {
      setCurrentMaxTextVal(v[1])
    }
    setCurrentValueAndFire(null, [Number(v[0]), Number(v[1])])
  }

  useEffect(() => {
    setCurrentRange(value)
  }, [value])

  useEffect(() => {
    fire.current = debounce(onChange, DEBOUNCE_INTERVAL)
  }, [onChange])

  return (
    <div className="numerical-slider" data-testid={testId}>
      <div className="range-slider-input-wrapper">
        <TextField
          invalid={!validMinValue}
          max={max || DEFAULT_MAX}
          min={min || DEFAULT_MIN}
          className="range-slider-input"
          pattern="[-+]?[0-9]+([\.][0-9]+)?"
          step={textInputStep || DEFAULT_STEP}
          value={currentMinTextVal}
          onChange={({ target: { value: v } }) => setCurrentLowValueIfValid(v)}
        />
        {label && <header>{label}</header>}
        <TextField
          invalid={!validMaxValue}
          max={max || DEFAULT_MAX}
          min={min || DEFAULT_MIN}
          className="range-slider-input"
          pattern="[-+]?[0-9]+([\.][0-9]+)?"
          step={textInputStep || DEFAULT_STEP}
          value={currentMaxTextVal}
          onChange={({ target: { value: v } }) => setCurrentValueHighIfValid(v)}
        />
      </div>
      <Slider
        classes={{ valueLabel: classes.valueLabel, root: classes.root }}
        value={currentRange}
        min={min || DEFAULT_MIN}
        step={step}
        max={max || DEFAULT_MAX}
        onChange={sliderOnChange}
        valueLabelDisplay="auto"
        aria-labelledby="range-slider"
      />
    </div>
  )
}
export default RangeSlider
