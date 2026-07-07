// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { isNil } from "ramda"
import {
  ADD_CUSTOM_COLOR_DOMAIN,
  CLEAR_SAVED_COLORS_BY_DIMENSION,
  UPDATE_HIDE_OTHER,
  UPDATE_CHART_COLORS,
  REMOVE_CUSTOM_DOMAIN_RANGE,
  UPDATE_D3_CHART_COLOR_PALETTE,
  CLEAR_D3_CHART_COLOR
} from "constants/action-types"
import { UPDATE_CHART } from "constants/chart-update-action-types"
import { isChartMultiSource } from "reducers/charts/helpers/multi-source-helpers"
import { setLastPaletteMappingId } from "components/shared-settings/palette-mapping-thunks"

export function updateHideOther(chartId, value, layerId) {
  return {
    type: UPDATE_HIDE_OTHER,
    chartId,
    value,
    layerId
  }
}

export function addCustomColorDomain(
  chartId,
  column,
  domain,
  defaultOtherDomain,
  multiSourceIndex
) {
  return {
    type: ADD_CUSTOM_COLOR_DOMAIN,
    chartId,
    column,
    domain,
    defaultOtherDomain,
    ...(!isNil(multiSourceIndex) && { multiSourceIndex })
  }
}

export function updateChartColors(chartId) {
  return {
    type: UPDATE_CHART_COLORS,
    chartId
  }
}

// This is a stopgap and should only be used for changing parameter values, temporarily.
// Ideally, we'd actually transfer these saved colors.
const clearSavedColorsByDimension = (chartId, dimension) => ({
  type: CLEAR_SAVED_COLORS_BY_DIMENSION,
  chartId,
  dimension
})

export function removeColorByDimension(chartId) {
  return (dispatch, getState) => {
    const chart = getState().charts[chartId]
    const { color, colorByDimension } = chart

    if (isChartMultiSource(chart) || !colorByDimension) {
      return
    }

    // For now, clear out saved colors since they won't work correctly with parameters as-is
    dispatch(clearSavedColorsByDimension(chartId, colorByDimension))

    dispatch({
      type: UPDATE_CHART,
      chartId,
      payload: {
        color: {
          ...color,
          isCustom: false,
          customDomain: []
        },
        colorByDimension: null
      }
    })

    // This sets the default colors and depends on having the correct
    // isCustom and colorByDimensions settings set above.
    dispatch(updateChartColors(chartId))
  }
}

export const removeCustomDomainRange = (chartId) => ({
  type: REMOVE_CUSTOM_DOMAIN_RANGE,
  chartId
})

export const updateD3ChartColorPalette = (chartId, color) => async (
  dispatch,
  getState
) => {
  const { charts, sharedSettings } = getState()
  const chart = charts[chartId]
  const chartColor = chart.color.paletteMappingId
    ? sharedSettings.mappings.find((m) => m.id === chart.color.paletteMappingId)
        ?.mapping ?? chart.color
    : chart.color
  dispatch({
    type: UPDATE_D3_CHART_COLOR_PALETTE,
    chartId,
    color,
    chartColor
  })
  if (chart.color.paletteMappingId) {
    dispatch(
      setLastPaletteMappingId(chartId, null, chart.color.paletteMappingId)
    )
  }
}

export const clearD3ChartColor = (chartId) => ({
  type: CLEAR_D3_CHART_COLOR,
  chartId
})
