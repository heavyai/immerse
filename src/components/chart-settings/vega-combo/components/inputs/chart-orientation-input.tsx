// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import ButtonGroup from "components/chart-settings/vega-combo/components/widgets/button-group"
import VegaComboIcon from "components/svg-icons/icon-vega-combo"
import HorizontalVegaComboIcon from "components/svg-icons/icon-vega-combo-horizontal"

import { VegaComboPresentationSettings } from "vega/constants/presentation-settings-types"

export type ChartOrientationOption = VegaComboPresentationSettings["orientation"]

interface Props {
  setChartOrientation(type: ChartOrientationOption): void
  selected: ChartOrientationOption
}

const CHART_ORIENTATION_TYPES = [
  {
    label: "Vertical",
    value: "column",
    icon: VegaComboIcon
  },
  {
    label: "Horizontal",
    value: "row",
    icon: HorizontalVegaComboIcon
  }
]

const ChartOrientationInput: FC<Props> = (props) => {
  const buttonsWithSelected = CHART_ORIENTATION_TYPES.map((ct) => ({
    ...ct,
    selected: ct.value === props.selected
  }))
  return (
    <ButtonGroup
      buttons={buttonsWithSelected}
      onButtonClick={(value: ChartOrientationOption) => {
        props.setChartOrientation(value)
      }}
    />
  )
}

export default ChartOrientationInput
