// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const getPieChartData = (chart, data = {}) => {
  const wedges = data.topAsync
  return wedges.map((wedge) => {
    const newWedge = {
      ...wedge,
      valLabel: chart.measures[0].label
    }
    Object.keys(wedge)
      .filter((dim) => dim.match(/^key\d+/))
      .forEach((dim) => {
        const dimIdx = parseInt(dim.match(/(\d+)/)[0], 10)
        newWedge[`${dim}Label`] = chart.dimensions[dimIdx].label
      })
    return newWedge
  })
}

export default getPieChartData
