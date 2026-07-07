// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

const Gauge = ({
  percent = 0,
  radius = 100,
  gradientId = "gradient-normal"
}) => {
  const strokeWidth = radius * 0.25
  const innerRadius = radius - strokeWidth
  const circumference = innerRadius * 2 * Math.PI
  const arc = circumference * (225 / 360)
  const dashArray = `${arc} ${circumference}`

  const percentNormalized = Math.min(Math.max(percent, 0), 100)
  const offset = arc - (percentNormalized / 100) * arc
  return (
    <svg
      height={radius * 2 + 20}
      width={radius * 2 + 20}
      style={{ transform: "rotate(90deg)" }}
    >
      <defs>
        <linearGradient id="gradient-normal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14C826" stopOpacity="1" />
          <stop offset="100%" stopColor="#23D76B" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C88014" stopOpacity="1" />
          <stop offset="100%" stopColor="#F4C82A" stopOpacity="1" />
        </linearGradient>
      </defs>
      <circle
        className="gauge_base"
        cx="50%"
        cy="50%"
        fill="transparent"
        r={innerRadius}
        stroke="#323232"
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
      />
      <circle
        className="gauge_percent"
        cx="50%"
        cy="50%"
        fill="transparent"
        r={innerRadius}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

export default Gauge
