// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import ButtonGroup from "components/chart-settings/vega-combo/components/widgets/button-group"

import { MarkSettings } from "vega/constants/data-selection-types"

import "./line-types-input.scss"

interface Props {
  setLineType(type: MarkSettings["lineStyle"]): void
  selected: MarkSettings["lineStyle"]
}

type LineTypeOption = {
  label: string
  value: MarkSettings["lineStyle"]
}

const LINE_TYPES: LineTypeOption[] = [
  {
    label: "Solid",
    value: "solid"
  },
  { label: "Dashed", value: "dashed" },
  {
    label: "Dotted",
    value: "dotted"
  }
]

const LineTypesInput: FC<Props> = (props) => {
  const buttonsWithSelected = LINE_TYPES.map((ct) => ({
    ...ct,
    selected: ct.value === props.selected
  }))
  return (
    <ButtonGroup
      className="line-types-button-group"
      buttons={buttonsWithSelected}
      onButtonClick={(value: MarkSettings["lineStyle"]) => {
        props.setLineType(value)
      }}
    />
  )
}

export default LineTypesInput
