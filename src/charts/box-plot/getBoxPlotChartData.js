// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const getBoxPlotChartData = (chart, data = {}) => {
  const layerKeys = Object.keys(data)
    .filter((k) => k.match(/^combo/))
    .sort()

  return layerKeys.map((k) => {
    const layer = data[k]
    const idx = k.replace(/\D+/g, "")
    return layer.map((point) => ({
      ...point,
      dimLabel: chart.dataSelections[idx].dimensions.xAxis[0].column.label,
      dimColumn: chart.dataSelections[idx].dimensions.xAxis[0].column.column,
      measure: chart.dataSelections[idx].measures.size[0].type,
      measureAggregate: chart.dataSelections[idx].measures.size[0].aggregate,
      measureColumn: chart.dataSelections[idx].measures.size[0].column?.value
    }))
  })
}

export default getBoxPlotChartData
