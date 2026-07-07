// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { SkewTChart as HeavySkewTChart } from "heavy-skewt-chart"

import { useChartData, useChartDimensions } from "charts/utils/hooks"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

import "./chart.scss"

const SkewTChart = ({ id }) => {
  const data = useChartData(id, { forceAggregate: true }) || []

  // there's gotta be a way to automatically alias this in the def, right?
  const mappedSkewData = data
    .map((d) => ({
      press: d.key0 ?? 0,
      hght: d.key1 ?? 0,
      temp: d.key2?.toFixed(2) ?? 0,
      dwpt: d.key3?.toFixed(2) ?? 0,
      wdir: d.key4 ?? 0,
      wspd: d.key5 ?? 0
    }))
    .sort((a, b) => b.press - a.press)

  const dimensions = useChartDimensions(id)

  const pressLabel = process(dimensions?.[0]?.value, {
    token: "press-axis-label"
  })

  const tempLabel = process(dimensions?.[2]?.value, {
    token: "temp-axis-label"
  })

  if (!mappedSkewData.length) {
    return null
  }

  return (
    <HeavySkewTChart
      data={mappedSkewData}
      xAxisLabel={tempLabel}
      yAxisLabel={pressLabel}
      chartId={id}
    />
  )
}

export default SkewTChart
