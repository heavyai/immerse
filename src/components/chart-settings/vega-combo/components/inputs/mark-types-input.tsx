// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import ButtonGroup from "components/chart-settings/vega-combo/components/widgets/button-group"
import { MarkSettings } from "vega/constants/data-selection-types"

import "./mark-types-input.scss"

interface Props {
  setMarkType(type: MarkSettings["markType"]): void
  selected: MarkSettings["markType"]
  markTypes: Array<{
    label: string
    value: MarkSettings["markType"]
    icon: React.FC<{}>
  }>
}

const MarkTypesInput: FC<Props> = (props) => {
  const buttonsWithSelected = props.markTypes.map((ct) => ({
    ...ct,
    selected: ct.value === props.selected
  }))
  return (
    <ButtonGroup
      className="mark-types-input"
      buttons={buttonsWithSelected}
      onButtonClick={(value: MarkSettings["markType"]) => {
        props.setMarkType(value)
      }}
    />
  )
}

export default MarkTypesInput
