// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const getBarChartData = (chart, data = {}) => {
  const bars = data.topAsync
  return bars.map((bar) => {
    const newBar = {
      ...bar,
      valLabel: chart.measures[0].label
    }
    Object.keys(bar)
      .filter((dim) => dim.match(/^key\d+/))
      .forEach((dim) => {
        const dimIdx = parseInt(dim.match(/(\d+)/)[0], 10)
        newBar[`${dim}Label`] = chart.dimensions[dimIdx].label
      })
    return newBar
  })
}

export default getBarChartData
