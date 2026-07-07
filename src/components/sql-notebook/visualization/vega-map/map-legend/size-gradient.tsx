// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from "classnames"
import React from "react"

interface ISizeGradient {
  height: number
  width: number
  minRadius: number
  maxRadius: number
  className?: string
}
export const SizeGradient = ({
  height,
  width,
  minRadius,
  maxRadius,
  className
}: ISizeGradient) => {
  const midY = height / 2
  const minX = minRadius
  const maxX = width - maxRadius

  // Path connecting the two circles
  const path = `M${minX},${midY - minRadius}L${maxX},${
    midY - maxRadius
  }L${maxX},${midY + maxRadius}L${minX},${midY + minRadius}Z`

  // Only render if we have all the things
  const shouldRender = height && width && minRadius && maxRadius

  return shouldRender ? (
    <svg
      className={classNames(className, "size-gradient")}
      width={width}
      height={height}
    >
      <path d={path} />
      <circle cx={minX} cy="50%" r={minRadius} />
      <circle cx={maxX} cy="50%" r={maxRadius} />
    </svg>
  ) : null
}
