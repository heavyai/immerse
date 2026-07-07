// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { connect, ConnectedProps } from "react-redux"

import BaseMeasureSettings from "components/chart-settings/vega-combo/components/graphical-settings-components/base-measure-settings"

import { AppState } from "vega/charts/types"
import ContinuousColorPicker from "vega/components/ContinuousColorPicker/ContinuousColorPicker"
import { Dispatch } from "redux"
import { QuantitativeColorPalette } from "vega/constants/presentation-settings-types"
import {
  setColorMeasureColorScheme,
  toggleColorMeasurePaletteReversal
} from "vega/actions/scale-settings-action-creators"
import { isNumericType } from "constants/data-types"

interface OwnProps {
  chartId: string
}

const mapStateToProps = ({ charts }: AppState, { chartId }: OwnProps) => {
  const {
    dataSelections,
    scales: { colorMeasure: colorMeasureScale }
  } = charts[chartId]
  const hasColorMeasure = dataSelections.some(({ measures: { color } }) =>
    Boolean(color)
  )

  // can be expanded to cover custom SQL "color by measure"s that result in STR dicts
  const isColorMeasureContinuous = hasColorMeasure
    ? dataSelections.some(
        ({ measures: { color } }) =>
          Boolean(
            color?.type === "column_aggregate" && color.aggregate !== "Mode"
          ) ||
          color?.type === "count" ||
          (color?.type === "custom_sql" && isNumericType(color?.column?.type))
      )
    : false

  return {
    colorMeasureScale,
    dataSelections,
    hasColorMeasure,
    isColorMeasureContinuous
  }
}

const mapDispatchToProps = (dispatch: Dispatch, { chartId }: OwnProps) => ({
  actions: {
    setSelectedColorScheme(palette: QuantitativeColorPalette) {
      dispatch(setColorMeasureColorScheme(chartId, palette))
    },
    toggleSelectedColorPalette(isReversed: boolean) {
      dispatch(toggleColorMeasurePaletteReversal(chartId, isReversed))
    }
  }
})

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  OwnProps,
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const GraphicalSettings: FC<Props> = ({
  chartId,
  colorMeasureScale,
  dataSelections,
  hasColorMeasure,
  isColorMeasureContinuous,
  actions
}) => {
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

export default connector(GraphicalSettings)
