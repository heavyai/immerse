// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from "react"
import { TextField } from "widgets/text-field/TextField"
import { Tooltip } from "@rmwc/tooltip"

import CustomSelector from "components/custom-selector/custom-selector"
import IconRemove from "components/svg-icons/icon-remove"
import IconReplayClock from "components/svg-icons/icon-replay-clock"

const timeSelectorOptions = [
  {
    label: "1 second",
    value: 1
  },
  {
    label: "3 seconds",
    value: 3
  },
  {
    label: "5 seconds",
    value: 5
  },
  {
    label: "10 seconds",
    value: 10
  },
  {
    label: "Custom",
    value: "custom"
  }
]

export const TimeSelector = ({ duration, callback }) => {
  const [custom, setCustom] = useState(false)
  const [customDuration, setCustomDuration] = useState("")
  // properly set the custom value if we're loading it up.
  useEffect(() => {
    const selectableDuration = timeSelectorOptions.some(
      (v) => v.value === duration
    )
    if (!selectableDuration && !custom) {
      setCustom(true)
      setCustomDuration(duration)
    }
  }, [duration, custom, setCustom])
  return (
    <>
      <IconReplayClock width="25px" height="25px" />
      <Tooltip content="duration" enterDelay={500}>
        {custom ? (
          <>
            <TextField
              type="number"
              autoComplete="off"
              value={customDuration}
              onChange={(e) => {
                const newCustomDuration = e.target.value
                setCustomDuration(newCustomDuration)
                callback(newCustomDuration)
              }}
            />
            <IconRemove
              style={{ cursor: "pointer" }}
              onClick={() => {
                setCustom(false)
                setCustomDuration(1)
                callback(1)
              }}
            />
          </>
        ) : (
          <CustomSelector
            currentValue={duration}
            onChange={(v) => {
              if (v === "custom") {
                setCustom(true)
                setCustomDuration(duration)
              } else {
                callback(v) // eslint-disable-line
              }
            }}
            options={timeSelectorOptions}
          />
        )}
      </Tooltip>
    </>
  )
}
