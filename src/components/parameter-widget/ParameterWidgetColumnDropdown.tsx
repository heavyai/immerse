// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { ColumnMetadata } from "constants/prop-types"
import TextInputSelect from "components/column-value-dropdown/TextInputSelect"
import { CommonInputProps } from "components/parameter-widget/parameter-widget-types"
import { useColumnOptions } from "../../hooks/use-column-options"
import { getFullColumnName } from "components/join-manager/utils"

type Props = CommonInputProps & {
  source: string
  resetValue: string
  columnMetadata?: ColumnMetadata[]
}

const ParameterWidgetColumnDropdown = ({
  value,
  setValue,
  source,
  resetValue,
  ...rest
}: Props) => {
  const [inputValue, setInputValue] = useState(value)
  const options = useColumnOptions(source, { resetValue })
  const [isOptionsListOpen, setIsOptionsListOpen] = useState(false)

  const optionsFilteredBySearchTerm =
    inputValue !== value
      ? options.filter((option) =>
          option.value.toLowerCase().includes(inputValue.toLowerCase())
        )
      : options

  return (
    <TextInputSelect
      {...{
        value,
        setValue,
        label: "Column",
        options: optionsFilteredBySearchTerm,
        isOptionsListOpen,
        setIsOptionsListOpen,
        inputValue,
        setInputValue,
        ...rest
      }}
      getOptionValue={getFullColumnName}
      getOptionTooltip={getFullColumnName}
    />
  )
}

export default ParameterWidgetColumnDropdown
