// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const getComboChartData = (chart, data = {}) => {
  const layerKeys = Object.keys(data)
    .filter((k) => k.match(/^getPairsFromQuery/))
    .sort()

  return layerKeys.map((k) => {
    const layer = data[k]
    const idx = parseInt(k.replace(/\D+/g, ""), 10)

    const dim = chart.dimensions.find(
      (d) =>
        d.name === "X Axis" &&
        (d.multiSourceIndex === undefined || d.multiSourceIndex === idx)
    )
    const colorDim = chart.dimensions.find(
      (d) =>
        d.name === "Color" &&
        (d.multiSourceIndex === undefined || d.multiSourceIndex === idx)
    )
    const measure = chart.measures.find(
      (m) =>
        m.name === "series_1" &&
        (m.multiSourceIndex === undefined || m.multiSourceIndex === idx)
    )

    return layer.map((point) => ({
      ...point,
      dimLabel: dim.label,
      dimColumn: dim.column,
      color: colorDim.column,
      measureLabel: measure.label,
      measureAggregate: measure.aggType,
      measureColumn: measure.value
    }))
  })
}

export default getComboChartData
