// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  APPLY_SAVED_PALETTE_MAPPING,
  CLEAR_PALETTE_MAPPING,
  CLEAR_PALETTE_MAPPING_INACTIVE_TAB
} from "constants/action-types"
import { ThunkDispatch } from "redux-thunk"
import {
  ADD_PALETTE_MAPPING,
  CLEAR_LAST_PALETTE_MAPPING_ID,
  SET_LAST_PALETTE_MAPPING_ID,
  UPDATE_PALETTE_MAPPING,
  DELETE_PALETTE_MAPPING,
  SET_PALETTE_MAPPING_NAME
} from "./palette-mapping-actions"
import { CHART_TYPES } from "constants/charts"
import { PaletteMapping } from "components/shared-settings/types"
import {
  isD3ChartWithCustomDomainRange,
  setD3MappingDomainRange,
  resetD3ChartMappingDomainRange
} from "reducers/charts/helpers/color-helpers"
import {
  ChartState,
  ColorDefinition
} from "reducers/charts/charts-reducer-types"

export const addPaletteMapping = ({
  mapping,
  dataSource,
  name,
  column,
  mappingId
}: {
  mapping: PaletteMapping
  dataSource?: string
  name: string
  column?: string
  mappingId?: string
}) => {
  return {
    type: ADD_PALETTE_MAPPING,
    mapping,
    name,
    dataSource,
    column,
    mappingId
  }
}

export const setLastPaletteMappingId = (
  chartId: string,
  layerId: string,
  paletteMappingId: string,
  isMeasure = false
) => {
  return {
    type: SET_LAST_PALETTE_MAPPING_ID,
    chartId,
    layerId,
    paletteMappingId,
    isMeasure
  }
}

export const clearLastPaletteMappingId = (
  chartId: string,
  layerId?: string,
  isMeasure = false
) => {
  return {
    type: CLEAR_LAST_PALETTE_MAPPING_ID,
    chartId,
    layerId,
    isMeasure
  }
}

const clearPaletteMappingForLayer = ({
  chartId,
  layer,
  layerId,
  tabId = null,
  pmId
}) => (dispatch) => {
  const actionType = tabId
    ? CLEAR_PALETTE_MAPPING_INACTIVE_TAB
    : CLEAR_PALETTE_MAPPING
  const isMeasure = layer.measures?.color?.paletteMappingId === pmId
  const isDimension = layer.dimensions?.color?.paletteMappingId === pmId
  const isBaseDimension = layer.paletteMappingId === pmId

  if (isMeasure || isDimension || isBaseDimension) {
    dispatch({
      type: actionType,
      chartId,
      layerId,
      tabId,
      isMeasure: isMeasure || false,
      pmId
    })
  }
}

const clearChartMappings = (charts, pmId, tabId = null) => (dispatch) => {
  const actionType = tabId
    ? CLEAR_PALETTE_MAPPING_INACTIVE_TAB
    : CLEAR_PALETTE_MAPPING

  Object.entries(charts).forEach(([chartId, chart]) => {
    if ([CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(chart.type)) {
      chart.dataSelections.forEach((layer) => {
        dispatch(
          clearPaletteMappingForLayer({
            chartId,
            layer,
            layerId: layer.layerId,
            tabId
          })
        )
      })
    } else if (chart?.layers) {
      chart.layers.forEach((layer, layerIndex) => {
        if (layer?.color?.paletteMappingId === pmId) {
          dispatch({
            type: actionType,
            chartId,
            layerId: layerIndex,
            tabId,
            isMeasure: false
          })
        }
      })
    } else if (chart?.color?.paletteMappingId === pmId) {
      if (isD3ChartWithCustomDomainRange(chart)) {
        resetD3ChartMappingDomainRange(chart)
      }
      dispatch({
        type: actionType,
        chartId,
        layerId: null,
        tabId,
        isMeasure: false
      })
    }
  })
}

const deletePaletteMappingOtherTabs = ({ pmId }) => async (
  dispatch,
  getState
) => {
  const { dashboard } = getState()
  const currentTabId = dashboard.selectedTabId
  const otherTabs = Object.fromEntries(
    Object.entries(dashboard.tabs).filter(([key]) => key !== currentTabId)
  )

  if (Object.keys(otherTabs).length === 0) {
    return
  }

  Object.entries(otherTabs).forEach(([tabId, tab]) => {
    if (tab?.charts) {
      dispatch(clearChartMappings(tab.charts, pmId, tabId))
    }
  })
}

export const deletePaletteMapping = ({ pmId }) => async (
  dispatch,
  getState
) => {
  const { charts } = getState()
  dispatch(clearChartMappings(charts, pmId))

  await dispatch(deletePaletteMappingOtherTabs({ pmId }))

  dispatch({
    type: DELETE_PALETTE_MAPPING,
    pmId
  })
}

export const saveAndSetPaletteMapping = ({
  chartId,
  layerId,
  mapping,
  dataSource,
  column,
  name,
  isMeasure
}: {
  chartId: string
  layerId: string
  mapping: PaletteMapping
  dataSource: string
  column: string
  name: string
  isMeasure: boolean
}) => {
  return async (dispatch, getState) => {
    await dispatch(addPaletteMapping({ mapping, name, dataSource, column }))

    const chart = getState().charts[chartId]
    const mappings = getState().sharedSettings.mappings
    const lastMapping = mappings[mappings.length - 1]

    if (isD3ChartWithCustomDomainRange(chart)) {
      setD3MappingDomainRange({ chart, mapping: lastMapping.mapping })
    }

    dispatch({
      type: APPLY_SAVED_PALETTE_MAPPING,
      chartId,
      layerId,
      paletteMapping: lastMapping,
      isMeasure
    })
    dispatch(
      setLastPaletteMappingId(chartId, layerId, lastMapping?.id, isMeasure)
    )
  }
}

export const clearPaletteMapping = ({
  chartId,
  layerId,
  isMeasure,
  pmId
}: {
  chartId: string
  layerId: string
  isMeasure: boolean
  pmId: string
}) => {
  return async (dispatch: ThunkDispatch, getState) => {
    const chart = getState().charts[chartId]
    if (isD3ChartWithCustomDomainRange(chart)) {
      resetD3ChartMappingDomainRange(chart)
    }
    dispatch({
      type: CLEAR_PALETTE_MAPPING,
      chartId,
      layerId,
      isMeasure,
      pmId
    })
  }
}

// update customRange of any d3 charts with same mapping
const updateD3ChartsWithMapping = ({
  charts,
  mapping
}: {
  charts: ChartState[]
  mapping: PaletteMapping
}): void => {
  const d3ChartsWtihMapping = Object.entries(charts)
    .filter(([_, value]) => value.color?.paletteMappingId === mapping.id)
    .filter(([_, value]) => isD3ChartWithCustomDomainRange(value))
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
  Object.entries(d3ChartsWtihMapping).map(([_, value]) =>
    setD3MappingDomainRange({
      chart: value,
      mapping: mapping.mapping
    })
  )
}

export const updatePaletteMapping = ({
  chartId,
  layerId,
  pmId,
  color,
  isMeasure
}: {
  chartId: string
  layerId: string
  pmId: string
  color: ColorDefinition
  isMeasure: boolean
}) => {
  return async (dispatch, getState) => {
    const chart = getState().charts[chartId]
    dispatch({
      type: UPDATE_PALETTE_MAPPING,
      id: pmId,
      mapping: color,
      chart
    })

    const mappings = getState().sharedSettings.mappings
    const paletteMapping = mappings.find((pm: PaletteMapping) => pm.id === pmId)

    // update current chart if it's a D3 chart
    if (isD3ChartWithCustomDomainRange(chart)) {
      setD3MappingDomainRange({ chart, mapping: paletteMapping.mapping })
    }

    updateD3ChartsWithMapping({
      charts: getState().charts,
      mapping: paletteMapping
    })

    dispatch({
      type: APPLY_SAVED_PALETTE_MAPPING,
      chartId,
      layerId,
      paletteMapping,
      isMeasure
    })
  }
}

export const setPaletteMappingName = (id: string, name: string) => {
  return {
    type: SET_PALETTE_MAPPING_NAME,
    id,
    name
  }
}
