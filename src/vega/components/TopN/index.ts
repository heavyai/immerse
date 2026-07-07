// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { createSelector } from "reselect"

import { openCategorySelectionModal } from "actions/category-selection-modal-action-creators"

import * as topnActions from "vega/actions/top-n-action-creators"
import {
  transformCustomTopNData,
  shouldInvertTopNLegendOrder,
  getColorKey
} from "vega/charts/top-n-utils"
import { AppState, VegaComboChart } from "vega/charts/types"
import { getLayerIndex, getLayerById } from "vega/utils/data-selection"

import TopNComponent, { Props as TopNProps } from "./TopN"
import { getLatestBeatData } from "vega/utils/data"
import { getOrdinalOrSolidPalette } from "vega/charts/color-utils"

const dataSelector = ({ charts }, { chartId, layerId }) => {
  const chart = charts[chartId] as VegaComboChart
  const layerIndex = getLayerIndex(chart.dataSelections, layerId)

  // Take groupby results from focus chart as source of truth
  const beatData = getLatestBeatData(chart.data?.focus[layerIndex])

  return beatData?.groupByDimension
}

const dimensionSelector = ({ charts }, { chartId, layerId }) => {
  const chart = charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)

  return dataSelection?.dimensions.color
}

const optionsSelector = ({ charts }, { chartId, layerId, propertyName }) => {
  const chart = charts[chartId]
  const dataSelectionIndex = getLayerIndex(chart.dataSelections, layerId)

  return chart.dataSelections[dataSelectionIndex][propertyName]
}

// pass the available columns for topN measure dropdown
const columnsSelector = ({ charts }, { chartId, layerId }) => {
  const chart = charts[chartId]
  const dataSelectionIndex = getLayerIndex(chart.dataSelections, layerId)

  return chart.dataSelections[dataSelectionIndex].table.columns || []
}

const selectedPaletteMappingSelector = (
  { charts, sharedSettings }: AppState,
  { chartId, layerId }
) => {
  const chart = charts[chartId]
  const dataSelection = getLayerById(chart.dataSelections, layerId)
  return sharedSettings.mappings.find(
    (m) => m.id === dataSelection?.dimensions?.color?.paletteMappingId
  )
}
// color measure selection hides topN item colors
const colorMeasureChecker = ({ charts }, { chartId, layerId }) => {
  const chart = charts[chartId]
  const dataSelectionIndex = getLayerIndex(chart.dataSelections, layerId)

  return Boolean(chart.dataSelections[dataSelectionIndex].measures.color)
}

const shouldInvertOrder = ({ charts }, { chartId }) => {
  const {
    presentation: {
      orientation,
      baseDimensionAxis: { groupingMode }
    }
  } = charts[chartId]

  return shouldInvertTopNLegendOrder(orientation, groupingMode)
}

const customRangeSelector = (
  { charts }: AppState,
  { chartId, layerId, propertyName }: TopNProps
) => {
  const chart = charts[chartId]
  const dataSelectionIndex = getLayerIndex(chart.dataSelections, layerId)
  const topNOptions =
    chart?.dataSelections?.[dataSelectionIndex]?.[propertyName]
  const dynamicColors = topNOptions?.dynamicValues?.map((dv) => dv.color) ?? []

  const staticColors = topNOptions?.staticValues?.map((dv) => dv.color) ?? []

  return [...dynamicColors, ...staticColors]
}

const mapStateToProps = () => {
  const transformedDataSelector = createSelector(
    dataSelector,
    optionsSelector,
    selectedPaletteMappingSelector,
    (data, options, selectedPaletteMapping) =>
      transformCustomTopNData(data, options, "", selectedPaletteMapping)
  )

  return (state, props) => {
    const options = optionsSelector(state, props)
    const data = transformedDataSelector(state, props)
    const selector = dimensionSelector(state, props)
    const columns = columnsSelector(state, props)
    const disabled = colorMeasureChecker(state, props)
    const selectedPaletteMapping = selectedPaletteMappingSelector(state, props)
    const customRange =
      selectedPaletteMapping?.mapping?.customRange ??
      customRangeSelector(state, props)
    const paletteType =
      selectedPaletteMapping?.mapping?.palette?.type ?? options?.palette?.type

    const colorKey = getColorKey(options, selectedPaletteMapping)
    const colors = getOrdinalOrSolidPalette(colorKey, paletteType)
    const invertOrder = shouldInvertOrder(state, props)

    return {
      data,
      options,
      selector,
      columns,
      disabled,
      colors,
      invertOrder,
      customRange
    }
  }
}
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      lock: topnActions.topnLock,
      setOptions: topnActions.topnSetOptions,
      toggle: topnActions.topnToggle,
      toggleAllOthers: topnActions.topnToggleAllOthers,
      unlock: topnActions.topnUnlock,
      updateN: topnActions.topnUpdateN,
      changeColor: topnActions.topnSetColor,
      showAllOthersInLegend: topnActions.topNShowAllOthersInLegend,
      allowNullKeys: topnActions.topNAllowNullKeys,
      openCategorySelectionModal
    },
    dispatch
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(TopNComponent)
