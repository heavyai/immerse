// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHART_TYPES } from "constants/chart-types"
import { ChartState } from "reducers/charts/charts-reducer-types"
import { getLayerById } from "vega/utils/data-selection"

export const useLastPaletteMappingId = (
  chart: ChartState,
  layerId: string,
  isMeasure = false
) => {
  const isComboOrBoxPlotChart = [
    CHART_TYPES.VEGA_COMBO,
    CHART_TYPES.BOX_PLOT
  ].includes(chart.type)
  const getSelectedPaletteMappingId = () => {
    const layer = getLayerById(chart.dataSelections, layerId)
    if (isMeasure) {
      return layer?.measures?.color?.lastPaletteMappingId
    } else if (layer?.dimensions?.color) {
      return layer?.dimensions?.color?.lastPaletteMappingId
    } else {
      return layer?.lastPaletteMappingId
    }
  }
  return isComboOrBoxPlotChart
    ? getSelectedPaletteMappingId()
    : chart.color.lastPaletteMappingId
}
