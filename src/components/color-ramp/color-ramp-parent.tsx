// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect } from "react"
import { useDispatch } from "react-redux"
import { initializeColorRamps } from "actions/charts-action-creators"
import ColorRampInput from "./color-ramp-input"

interface IColorRampParentProps {
  chartId: string
  colors: string[]
}

const ColorRampParent: FC<IColorRampParentProps> = ({ chartId, colors }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const boundsArray = new Array(colors.length)
    colors.forEach((val, i) => {
      boundsArray[i] = i === 0 ? ["min", ""] : ["", ""]
    })
    dispatch(initializeColorRamps(chartId, boundsArray))
  }, [chartId, colors, dispatch])

  return (
    <>
      {colors.map((val, i) => (
        <ColorRampInput chartId={chartId} color={val} order={i} key={i} />
      ))}
    </>
  )
}

export default ColorRampParent
