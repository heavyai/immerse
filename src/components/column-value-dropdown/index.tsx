// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"

import { CommonInputProps } from "components/parameter-widget/parameter-widget-types"
import TextInputSelect from "./TextInputSelect"

type ColumnValueOption = {
  value: string | boolean
  label: string
}

const filterOptionsBySearchTerm = (
  options: ColumnValueOption[],
  searchTerm: string
) =>
  options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

const ColumnValueDropdown = ({
  value,
  setValue,
  queryForOptions,
  options,
  source,
  column,
  dropdownWidth,
  label,
  ...rest
}: CommonInputProps & {
  queryForOptions: (
    source: string,
    column: string,
    searchTerm: string | undefined
  ) => void
  options: ColumnValueOption[]
  source: string
  column: string
  dropdownWidth?: number
  label?: string
  disabled?: boolean
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [isOptionsListOpen, setIsOptionsListOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState(options)

  const requeryOnSearch = !(
    options.length && typeof options[0].value !== "string"
  )

  // Only filter options if user has modified the input text
  const shouldFilterValues = inputValue && inputValue !== value

  useEffect(() => {
    if (isOptionsListOpen && !requeryOnSearch) {
      setFilteredOptions(
        shouldFilterValues
          ? filterOptionsBySearchTerm(options, inputValue)
          : options
      )
    }
  }, [
    isOptionsListOpen,
    inputValue,
    options,
    requeryOnSearch,
    shouldFilterValues
  ])

  useEffect(() => {
    if (isOptionsListOpen && requeryOnSearch) {
      queryForOptions(
        source,
        column,
        shouldFilterValues ? inputValue : undefined
      )
    }
  }, [
    column,
    source,
    queryForOptions,
    isOptionsListOpen,
    inputValue,
    shouldFilterValues,
    requeryOnSearch
  ])

  return (
    <TextInputSelect
      {...{
        value,
        setValue,
        options: requeryOnSearch ? options : filteredOptions,
        isOptionsListOpen,
        setIsOptionsListOpen,
        inputValue,
        setInputValue,
        label: label || "Column value",
        dropdownWidth,
        ...rest
      }}
    />
  )
}

export default ColumnValueDropdown
