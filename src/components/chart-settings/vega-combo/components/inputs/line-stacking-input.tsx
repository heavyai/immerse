// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import ButtonGroup from "components/chart-settings/vega-combo/components/widgets/button-group"
import LineIcon from "components/svg-icons/icon-line"
import AreaStackIcon from "components/svg-icons/icon-area-stack"
import PercentStackIcon from "components/svg-icons/icon-percent-stack"

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

const LINE_STACK_TYPES: Option[] = [
  {
    label: "Lines",
    value: "grouped",
    icon: LineIcon
  },
  {
    label: "Stack",
    value: "stacked",
    icon: AreaStackIcon
  },
  { label: "Percentage", value: "percent", icon: PercentStackIcon }
]

const AreaStacksInput: FC<Props> = (props) => {
  let buttonsWithSelected = LINE_STACK_TYPES.map((ct) => ({
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

export default AreaStacksInput
