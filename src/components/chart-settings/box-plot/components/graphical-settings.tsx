// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useSelector, useDispatch } from "react-redux"

import BaseMeasureSettings from "components/chart-settings/vega-combo/components/graphical-settings-components/base-measure-settings"
import ContinuousColorPicker from "vega/components/ContinuousColorPicker/ContinuousColorPicker"

import { AppState } from "vega/charts/types"
import { QuantitativeColorPalette } from "vega/constants/presentation-settings-types"
import {
  setColorMeasureColorScheme,
  toggleColorMeasurePaletteReversal
} from "vega/actions/scale-settings-action-creators"

export const GraphicalSettings = ({ chartId }: { chartId: string }) => {
  const dispatch = useDispatch()

  const {
    colorMeasureScale,
    dataSelections,
    hasColorMeasure,
    isColorMeasureContinuous
  } = useSelector((state: AppState) => {
    const chart = state.charts[chartId]

    return {
      colorMeasureScale: chart.scales.colorMeasure,
      dataSelections: chart.dataSelections,
      hasColorMeasure: chart.dataSelections.some(({ measures: { color } }) =>
        Boolean(color)
      ),
      isColorMeasureContinuous: hasColorMeasure
        ? chart.dataSelections.some(
            ({ measures: { color } }) =>
              Boolean(
                color?.type === "column_aggregate" && color.aggregate !== "Mode"
              ) || color?.type === "count"
          )
        : false
    }
  })

  const actions = {
    setSelectedColorScheme: (palette: QuantitativeColorPalette) =>
      dispatch(setColorMeasureColorScheme(chartId, palette)),
    toggleSelectedColorPalette: (isReversed: boolean) =>
      dispatch(toggleColorMeasurePaletteReversal(chartId, isReversed))
  }

  return (
    <>
      {hasColorMeasure && isColorMeasureContinuous && (
        <ContinuousColorPicker
          selectedColorScheme={colorMeasureScale.palette}
          paletteReversed={colorMeasureScale.paletteReversed}
          handleSelectColorScheme={actions.setSelectedColorScheme}
          handleToggleColorScheme={actions.toggleSelectedColorPalette}
        />
      )}
      {dataSelections.flatMap(({ layerId, measures }) =>
        measures.size.map((_, measureIndex) => {
          return (
            <BaseMeasureSettings
              key={`${layerId}-${measureIndex}`}
              chartId={chartId}
              layerId={layerId}
              measureIndex={measureIndex}
            />
          )
        })
      )}
    </>
  )
}
