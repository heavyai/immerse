// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { VegaComboPresentationSettings } from "vega/constants/presentation-settings-types"
import { VegaComboChart } from "vega/charts/types"
import { SCALE_TYPES } from "constants/scale-types"

export const createVegaComboPresentationSettings = (): VegaComboPresentationSettings => ({
  orientation: "column",
  gridEnabled: true,
  barValuesEnabled: true,
  baseDimensionAxis: {
    groupingMode: "grouped",
    lineAreaEnabled: false
  },
  sizeMeasurePrimaryAxis: {
    cumulativeDistributionEnabled: false,
    percentageDistributionEnabled: false,
    format: "custom-basic",
    scaleType: SCALE_TYPES.LINEAR
  },
  sizeMeasureSecondaryAxis: {
    cumulativeDistributionEnabled: false,
    percentageDistributionEnabled: false,
    format: "custom-basic"
  }
})

/**
 * @param chart A vega combo chart
 * @returns true if the legend should be enabled, false otherwise
 */
export const isLegendEnabled = (chart: VegaComboChart): boolean => {
  // If legendEnabled is set, return that. Otherwise, the legend should be
  // enabled if there are multiple layers, or if there are multiple measures,
  // or if there's a group-by dimension or color measure
  return (
    chart.legendEnabled ??
    (chart.dataSelections.length > 1 ||
      chart.dataSelections[0].measures.size.length > 1 ||
      Boolean(chart.dataSelections[0].dimensions.color) ||
      Boolean(chart.dataSelections[0].measures.color))
  )
}

export const isGridEnabled = (chart: VegaComboChart): boolean => {
  return chart.gridEnabled || chart.gridEnabled === undefined
}
