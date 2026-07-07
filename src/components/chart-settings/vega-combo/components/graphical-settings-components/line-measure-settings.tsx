// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { connect, ConnectedProps } from "react-redux"
import { Dispatch } from "redux"

import LineTypeInput from "components/chart-settings/vega-combo/components/inputs/line-types-input"

import {
  setMeasureLineStyle,
  setMeasureLineThickness
} from "vega/actions/mark-settings-action-creators"
import NumericalSlider from "vega/components/NumericalSlider/NumericalSlider"
import {
  MarkSettings,
  ComboSizeMeasureExpression
} from "vega/constants/data-selection-types"
import { AppState } from "vega/charts/types"
import { DEFAULT_STROKEWIDTH } from "constants/magic-variables"

interface OwnProps {
  // the chartId for this measure
  chartId: string

  // the layerId for this measure
  layerId: string

  // the measure's index in the layer
  measureIndex: number

  // the measure object itself
  measure: ComboSizeMeasureExpression
}

export const mapDispatchToProps = (
  dispatch: Dispatch,
  { chartId, layerId, measureIndex }: OwnProps
) => ({
  actions: {
    setLineStyle: (lineStyle: MarkSettings["lineStyle"]) => {
      dispatch(setMeasureLineStyle(chartId, layerId, measureIndex, lineStyle))
    },
    setLineThickness: (lineThickness: number) => {
      dispatch(
        setMeasureLineThickness(chartId, layerId, measureIndex, lineThickness)
      )
    }
  }
})

const connector = connect<
  {},
  ReturnType<typeof mapDispatchToProps>,
  OwnProps,
  AppState
>(null, mapDispatchToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const LineMeasureSettings: FC<Props> = ({ measure, actions }) =>
  measure ? (
    <>
      <LineTypeInput
        setLineType={actions.setLineStyle}
        selected={measure.markSettings.lineStyle}
      />
      <NumericalSlider
        label="Line Thickness"
        max={10}
        min={1}
        step={1}
        value={measure.markSettings.lineThickness || DEFAULT_STROKEWIDTH}
        onChange={actions.setLineThickness}
      />
    </>
  ) : null

export default connect(undefined, mapDispatchToProps)(LineMeasureSettings)
