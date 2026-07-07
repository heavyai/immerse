// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState } from "react"
import cx from "classnames"

import "./styles.scss"

const labelOverflowsBar = (
  barElement: HTMLDivElement,
  labelElement: HTMLSpanElement
) => {
  const computedBarStyle = getComputedStyle(barElement)
  const availableLabelWidth =
    barElement?.offsetWidth - parseFloat(computedBarStyle.paddingRight)

  return Boolean(availableLabelWidth <= labelElement?.offsetWidth)
}

const ProgressBar = ({
  limit,
  value,
  warning = false
}: {
  limit: number
  value: number
  warning?: boolean
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressBarLabelRef = useRef<HTMLSpanElement>(null)
  const [labelAnchorLeft, setLabelAnchorLeft] = useState(false)
  const [afterRender, setAfterRender] = useState(false)

  useEffect(() => {
    setAfterRender(true)
  }, [])

  useEffect(() => {
    if (!afterRender) {
      return
    }

    if (progressBarRef.current && progressBarLabelRef.current) {
      setLabelAnchorLeft(
        labelOverflowsBar(progressBarRef.current, progressBarLabelRef.current)
      )
    }

    setAfterRender(false)
  }, [afterRender])

  return (
    <div
      className={cx("progress-bar", {
        "progress-bar--warning": warning
      })}
    >
      <div className="progress-bar__track">
        <div
          className={cx("progress-bar__progress", {
            "progress-bar__progress--anchor-left": labelAnchorLeft
          })}
          style={{ width: `${(value / limit) * 100}%` }}
          ref={progressBarRef}
        >
          <span
            className="progress-bar__current-value-label"
            ref={progressBarLabelRef}
          >
            {value}
          </span>
        </div>
      </div>
      <div className="progress-bar__min-max-labels">
        <span>0</span>
        <span>{limit}</span>
      </div>
    </div>
  )
}

export default ProgressBar
