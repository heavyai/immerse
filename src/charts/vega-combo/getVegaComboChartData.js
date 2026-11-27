// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const getVegaComboChartData = (chart, data = {}) => {
  const layerKeys = Object.keys(data)
    .filter((k) => k.match(/^combo/))
    .sort()

  return layerKeys.map((k) => {
    const layer = data[k]
    const idx = k.replace(/\D+/g, "")
    const dataSelection = chart.dataSelections?.[idx]
    return layer.map((point) => ({
      ...point,
      dimLabel: dataSelection?.dimensions?.xAxis?.[0]?.column?.label,
      dimColumn: dataSelection?.dimensions?.xAxis?.[0]?.column?.column,
      measure: dataSelection?.measures?.size?.[0]?.type,
      measureAggregate: dataSelection?.measures?.size?.[0]?.aggregate,
      measureColumn: dataSelection?.measures?.size?.[0]?.column?.value
    }))
  })
}

export default getVegaComboChartData
