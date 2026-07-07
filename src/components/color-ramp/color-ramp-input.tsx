// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateColorRamps } from "actions/charts-action-creators"
import TextField from "widgets/text-field/TextField"

import "./color-ramp-input.scss"

interface IColorRampInputProps {
  chartId: string
  color: string
  order: number
}

const ColorRampInput: FC<IColorRampInputProps> = ({
  chartId,
  color,
  order
}) => {
  const boundsArray = useSelector(
    ({ charts }: any) => charts[chartId]?.colorRamps || []
  )
  const dispatch = useDispatch()
  const [upperBounds, setUpperBounds] = useState(boundsArray?.[order]?.[1])

  // needed to update boundsArray once it's initialized from the dispatch in parent
  useEffect(() => {
    setUpperBounds(boundsArray?.[order]?.[1])
  }, [boundsArray, order])

  const submitBound = (e: React.FormEvent) => {
    e.preventDefault()
    const lowerBounds = boundsArray[order - 1]
      ? boundsArray[order - 1][1]
      : "min"
    dispatch(updateColorRamps(chartId, order, [lowerBounds, upperBounds]))
  }

  // need to set last upper bound to text "max"
  return (
    <div className="color-ramp-input">
      <div className="color-item" style={{ backgroundColor: color }} />
      <div className="lower-bounds-display">
        <div>{boundsArray[order - 1] ? boundsArray[order - 1][1] : "min"}</div>
        <div>-</div>
      </div>
      <form onSubmit={submitBound}>
        {boundsArray[order + 1] ? (
          <TextField
            value={upperBounds}
            onChange={(e) => setUpperBounds(e.target.value)}
          />
        ) : (
          <div>max</div>
        )}
      </form>
    </div>
  )
}

export default ColorRampInput
