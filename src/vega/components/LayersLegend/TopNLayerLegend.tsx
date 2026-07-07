// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { ThunkDispatch } from "redux-thunk"
import { AppState, VegaComboChart } from "vega/charts/types"
import { AnyAction, bindActionCreators } from "redux"
import {
  topnLock,
  topnToggle,
  topnToggleAllOthers,
  topnUnlock,
  topnSetColor
} from "vega/actions/top-n-action-creators"

import { HEAVYAI_TOPN_COLORS } from "services/colors"
import { topNLegendSort } from "vega/charts/top-n-utils"
import { getLayerIndex } from "vega/utils/data-selection"
import { connect, ConnectedProps } from "react-redux"
import TopNItem from "../TopN/TopNItem"
import { DEFAULT_CATEGORICAL_PALETTE } from "constants/colors"
import { getOrdinalOrSolidPalette } from "vega/charts/color-utils"

type OwnProps = {
  chartId: string
  layerId: string
  /** Reverse sort legend items */
  invertOrder: boolean
  propertyName: "topNoptions" | "measureTopNOptions"
  options: any[]
  allOthers: any[]
  disabled: boolean
  showAllOthersInLegend?: boolean
  hasPaletteMapping: boolean
  hasColorMeasure: boolean
  colorPalette: string[]
  customRange: string[]
}

const mapStateToProps = (
  state: AppState,
  { chartId, layerId, propertyName }: OwnProps
) => {
  const chart = state.charts[chartId] as VegaComboChart
  const dataSelections = chart.dataSelections
  const dataSelectionIndex = getLayerIndex(dataSelections, layerId)
  const dataSelection = dataSelections[dataSelectionIndex]
  const topNOptions = dataSelection?.[propertyName]
  const hasPaletteMapping = Boolean(
    dataSelection.measures.color?.paletteMappingId ??
      dataSelection.dimensions.color?.paletteMappingId
  )
  const hasColorMeasure = Boolean(dataSelection.measures.color)
  // Set custom range and pass to TopNItem
  const colorPalette = getOrdinalOrSolidPalette(
    topNOptions?.palette?.key || DEFAULT_CATEGORICAL_PALETTE,
    topNOptions?.palette?.type
  )
  const showAllOthersInLegend = topNOptions?.showAllOthersInLegend

  const dynamicColors = topNOptions?.dynamicValues?.map((dv) => dv.color) ?? []
  const staticColors = topNOptions?.staticValues?.map((dv) => dv.color) ?? []

  const customRange = [...dynamicColors, ...staticColors]

  return {
    showAllOthersInLegend,
    hasPaletteMapping,
    hasColorMeasure,
    colorPalette,
    customRange
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>
) => ({
  actions: bindActionCreators(
    {
      topnLock,
      topnToggle,
      topnToggleAllOthers,
      topnUnlock,
      topnSetColor
    },
    dispatch
  )
})

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  OwnProps,
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const TopNLayerLegend: FC<Props> = ({
  chartId,
  layerId,
  invertOrder,
  propertyName,
  options,
  disabled = false,
  showAllOthersInLegend,
  allOthers,
  actions,
  hasPaletteMapping,
  hasColorMeasure,
  colorPalette,
  customRange
}) => {
  const topNItems = options
    .filter((datum) => Boolean(datum.key))
    .sort(topNLegendSort(invertOrder))
    .map((datum) => (
      <TopNItem
        key={datum.key}
        color={disabled ? HEAVYAI_TOPN_COLORS.disabled : datum.color}
        title={datum.originalKey}
        value={datum.val}
        locked={typeof datum.locked === "undefined" ? false : datum.locked}
        visible={typeof datum.disabled === "undefined" ? true : !datum.disabled}
        onToggle={(key) =>
          actions.topnToggle(chartId, layerId, propertyName, key)
        }
        onLock={(key, color, itemVisible) =>
          actions.topnLock(
            chartId,
            layerId,
            propertyName,
            key,
            color,
            !itemVisible // arg is 'disabled'
          )
        }
        onUnlock={(key) =>
          actions.topnUnlock(chartId, layerId, propertyName, key)
        }
        onChangeColor={(key, color) =>
          actions.topnSetColor(chartId, layerId, propertyName, key, color)
        }
        disabled={disabled}
        canLock={!hasPaletteMapping && !hasColorMeasure}
        editable={!hasPaletteMapping}
        colorPalette={colorPalette}
        customRange={customRange}
      />
    ))

  const allOthersItem =
    !showAllOthersInLegend || !allOthers ? null : (
      <TopNItem
        color={disabled ? HEAVYAI_TOPN_COLORS.disabled : allOthers.color}
        visible={!allOthers.disabled}
        title="All Others"
        isAllOther={allOthers.isAllOther}
        onToggle={() =>
          actions.topnToggleAllOthers(chartId, layerId, propertyName)
        }
        onChangeColor={(key, color) =>
          actions.topnSetColor(
            chartId,
            layerId,
            propertyName,
            key,
            color,
            allOthers.isAllOther
          )
        }
        disabled={disabled}
        key={allOthers.key}
        canLock={!hasPaletteMapping && !hasColorMeasure}
        editable={!hasPaletteMapping}
        colorPalette={colorPalette}
        customRange={customRange}
      />
    )

  return invertOrder ? [allOthersItem, topNItems] : [topNItems, allOthersItem]
}

export default connector(TopNLayerLegend)
