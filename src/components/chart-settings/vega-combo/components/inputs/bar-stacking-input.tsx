// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import ButtonGroup from "components/chart-settings/vega-combo/components/widgets/button-group"
import GroupedBarIcon from "components/svg-icons/icon-bar-grouped"
import PercentageBarIcon from "components/svg-icons/icon-bar-percentage"
import StackedBarIcon from "components/svg-icons/icon-bar-stacked"

import { BaseDimensionAxisSettings } from "vega/constants/presentation-settings-types"

interface Props {
  setSelected(type: BaseDimensionAxisSettings["groupingMode"]): void
  selected: BaseDimensionAxisSettings["groupingMode"]
  showPercentage: boolean
}

type Option = {
  label: string
  value: BaseDimensionAxisSettings["groupingMode"]
  icon: FC
}

const BAR_STACK_TYPES: Option[] = [
  {
    label: "Group",
    value: "grouped",
    icon: GroupedBarIcon
  },
  {
    label: "Stack",
    value: "stacked",
    icon: PercentageBarIcon
  },
  {
    label: "Percentage",
    value: "percent",
    icon: StackedBarIcon
  }
]

const BarStackingInput: FC<Props> = (props) => {
  let buttonsWithSelected = BAR_STACK_TYPES.map((ct) => ({
    ...ct,
    selected: ct.value === props.selected
  }))
  if (!props.showPercentage) {
    buttonsWithSelected = buttonsWithSelected.filter(
      (ct) => ct.value !== "percent"
    )
  }

  return (
    <ButtonGroup
      buttons={buttonsWithSelected}
      onButtonClick={(value: BaseDimensionAxisSettings["groupingMode"]) => {
        props.setSelected(value)
      }}
    />
  )
}

export default BarStackingInput
