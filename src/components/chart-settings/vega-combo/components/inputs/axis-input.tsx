// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { connect } from "react-redux"
import { Dispatch, bindActionCreators } from "redux"

import ButtonGroup from "components/chart-settings/vega-combo/components/widgets/button-group"

import { MarkSettings } from "vega/constants/data-selection-types"
import { setMeasureAxis } from "vega/actions/mark-settings-action-creators"

interface OwnProps {
  chartId: string
  layerId: string
  measureIndex: number
  selected?: MarkSettings["axis"]
}

interface DispatchProps {
  actions: {
    setMeasureAxis(
      chartId: string,
      layerId: string,
      measureIndex: number,
      axis: MarkSettings["axis"]
    ): void
  }
}

type Props = OwnProps & DispatchProps

type AxisOptions = {
  label: string
  value: MarkSettings["axis"]
}

const AXES: AxisOptions[] = [
  {
    label: "Primary axis",
    value: "primary"
  },
  {
    label: "Secondary axis",
    value: "secondary"
  }
]

const AxisButtons: FC<Props> = ({
  chartId,
  layerId,
  measureIndex,
  selected = "primary",
  actions
}) => {
  const buttonsWithSelected = AXES.map((axis) => ({
    ...axis,
    selected: axis.value === selected
  }))
  return (
    <ButtonGroup
      buttons={buttonsWithSelected}
      onButtonClick={(value: MarkSettings["axis"]) => {
        actions.setMeasureAxis(chartId, layerId, measureIndex, value)
      }}
    />
  )
}

export const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(
    {
      setMeasureAxis
    },
    dispatch
  )
})

export default connect(undefined, mapDispatchToProps)(AxisButtons)
