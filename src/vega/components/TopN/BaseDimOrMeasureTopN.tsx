// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { createSelector } from "reselect"

import { openCategorySelectionModal } from "actions/category-selection-modal-action-creators"

import * as topnActions from "vega/actions/top-n-action-creators"
import {
  buildDefaultCustomizableTopNOptions,
  getColorKey,
  transformBaseDimOrMeasureCustomTopNData
} from "vega/charts/top-n-utils"
import { AppState, VegaComboChart } from "vega/charts/types"
import { getLayerIndex, getLayerById } from "vega/utils/data-selection"

import TopNComponent, { Props as TopNProps } from "./TopN"
import { getLatestBeatData } from "vega/utils/data"
import { getOrdinalOrSolidPalette } from "vega/charts/color-utils"

const selectedPaletteMappingSelector = (
  { charts, sharedSettings }: AppState,
  { chartId, layerId }: TopNProps
) => {
  const chart = charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)
  return sharedSettings.mappings.find(
    (m) =>
      m.id ===
      (dataSelection?.measures?.color?.paletteMappingId ??
        dataSelection?.paletteMappingId)
  )
}
const dataSelector = (
  { charts }: AppState,
  { chartId, layerId }: TopNProps
) => {
  const chart = charts[chartId] as VegaComboChart
  const layerIndex = getLayerIndex(chart.dataSelections, layerId)

  // Take groupby results from focus chart as source of truth
  const beatData = getLatestBeatData(chart.data?.focus[layerIndex])

  // TODO[C]: Will need to modify this when we do violin coloring
  return beatData?.table
}

const selectorSelector = (
  { charts }: AppState,
  { chartId, layerId }: TopNProps
) => {
  const chart = charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)

  return dataSelection?.measures.color ?? dataSelection?.dimensions?.xAxis[0]
}

const optionsSelector = (
  { charts }: AppState,
  { chartId, layerId, propertyName }: TopNProps
) => {
  const chart = charts[chartId]
  const layerIndex = getLayerIndex(chart.dataSelections, layerId)
  const dataSelection = chart.dataSelections[layerIndex]

  return (
    dataSelection?.measureTopNOptions ||
    dataSelection?.[propertyName] ||
    buildDefaultCustomizableTopNOptions(dataSelection?.table, layerIndex)
  )
}

// pass the available columns for topN measure dropdown
const columnsSelector = (
  { charts }: AppState,
  { chartId, layerId }: TopNProps
) => {
  const chart = charts[chartId]
  const dataSelectionIndex = getLayerIndex(chart.dataSelections, layerId)
  return chart?.dataSelections?.[dataSelectionIndex]?.table?.columns || []
}

const customRangeSelector = (
  { charts }: AppState,
  { chartId, layerId, propertyName }: TopNProps
) => {
  const chart = charts[chartId]
  const dataSelectionIndex = getLayerIndex(chart.dataSelections, layerId)
  const dataSelection = chart?.dataSelections?.[dataSelectionIndex]

  const dynamicValues =
    dataSelection?.measureTopNOptions?.dynamicValues ??
    dataSelection?.[propertyName]?.dynamicValues

  return dynamicValues?.map((dv) => dv.color) ?? []
}

const isBaseDimensionSelector = (
  { charts }: AppState,
  { chartId, layerId }: TopNProps
) => {
  const chart = charts[chartId]
  const dataSelectionIndex = getLayerIndex(chart.dataSelections, layerId)
  const dataSelection = chart?.dataSelections?.[dataSelectionIndex]

  return !dataSelection?.measures?.color
}

const mapStateToProps = () => {
  return (state: AppState, props: TopNProps) => {
    const transformedDataSelector = createSelector(
      dataSelector,
      optionsSelector,
      selectedPaletteMappingSelector,
      isBaseDimensionSelector,
      transformBaseDimOrMeasureCustomTopNData
    )
    const options = optionsSelector(state, props)
    const data = transformedDataSelector(state, props)
    const selector = selectorSelector(state, props)
    const columns = columnsSelector(state, props)
    const selectedPaletteMapping = selectedPaletteMappingSelector(state, props)
    const customRange =
      selectedPaletteMapping?.mapping?.customRange ??
      customRangeSelector(state, {
        ...props,
        propertyName: props.propertyName
      })
    const paletteType =
      selectedPaletteMapping?.mapping?.palette?.type ?? options?.palette?.type

    const colorKey = getColorKey(options, selectedPaletteMapping)
    const colors = getOrdinalOrSolidPalette(colorKey, paletteType)

    return {
      data,
      options,
      selector,
      columns,
      colors,
      propertyName: props.propertyName,
      canLock: false,
      hasSettings: false,
      customRange
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      setOptions: topnActions.topnSetOptions,
      toggle: topnActions.topnToggle,
      toggleAllOthers: topnActions.topnToggleAllOthers,
      changeColor: (chartId, layerId, propertyName, key, color) => {
        // Wraps topnSetColor, so it knows this is for a measure but
        // topN component can still be used out of the box
        return () => {
          dispatch(
            topnActions.topnSetColor(
              chartId,
              layerId,
              propertyName,
              key,
              color,
              false,
              true
            )
          )
        }
      },
      openCategorySelectionModal
    },
    dispatch
  )
})

export const BaseDimOrMeasureTopN = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopNComponent)
