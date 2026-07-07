// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CHART_TYPES } from "constants/charts"
import {
  isD3ChartWithCustomDomainRange,
  createD3CategoricalColor,
  categoricalColorFromMeasure,
  isBaseDimCategoricalColoringChart
} from "reducers/charts/helpers/color-helpers"
import { ChartState } from "reducers/charts/charts-reducer-types"

// called from reducers in reducers/dashboard.js and charts-reducer.ts
export const clearPaletteMapping = ({
  chart,
  layerId,
  isMeasure
}: {
  chart: ChartState
  layerId: string
  isMeasure: boolean
}) => {
  if (
    [CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(chart.type) &&
    layerId
  ) {
    const layer = chart.dataSelections.find((ds) => ds.layerId === layerId)
    if (isMeasure && layer.measures.color) {
      layer.measures.color.paletteMappingId = null
      layer.measureTopNOptions.dynamicValues = []
    } else if (layer.dimensions.color?.paletteMappingId) {
      layer.dimensions.color.paletteMappingId = null
      layer.topNoptions.dynamicValues = []
    } else if (isBaseDimCategoricalColoringChart(chart.type)) {
      layer.paletteMappingId = null
      layer.topNoptions.dynamicValues = []
    }
  } else if (isD3ChartWithCustomDomainRange(chart)) {
    chart.color = createD3CategoricalColor(chart)
    chart.color.paletteMappingId = null
  } else {
    // if layerId is 0, it will be treated as a falsey value and block will
    // be bypassed, so explicitly check for a defined layerId
    if (chart.layers && (layerId !== undefined ? true : chart.currentLayer)) {
      const currentLayer = chart.layers[layerId ?? chart.currentLayer]
      currentLayer.color = categoricalColorFromMeasure(
        currentLayer.measures.find((m) => m.name === "color")
      )
      currentLayer.color.paletteMappingId = null
    }
    // if current layer is master, we can't ascertain which layer chart.color
    // is currently reflecting; in addition, it gets overwritten when you go
    // back into a chart. So only need to remove mapping if we are currently
    // editing a specific layer on the chart.
    if (chart.currentLayer !== "master") {
      chart.color = categoricalColorFromMeasure(
        chart.measures.find((m) => m.name === "color")
      )
      chart.color.paletteMappingId = null
    }
  }
}
