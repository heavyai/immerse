// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect, useRef } from "react"
import { List } from "widgets/list/List"
import { SimpleListItem } from "@rmwc/list"
import { TextField } from "widgets/text-field/TextField"
import { KEYCODE } from "constants/keycode"
import { numberFormatOptions } from "components/chart-settings-format/chart-number-format"
import IconTriangleUp from "components/svg-icons/icon-triangle-up"
import IconTriangleDown from "components/svg-icons/icon-triangle-down"
import "./styles.scss"

export type FormatOption = {
  value: string
  example: string
  label: string
  hint?: string
}

export { numberFormatOptions }

export const getFormatName = (format: string) => {
  const optionMatched = numberFormatOptions.filter(
    (option) => option.value === format
  )[0]
  return optionMatched ? optionMatched.label : format || ""
}

const customOption = (format: string) => {
  return {
    label: `Use custom format "${format}"`,
    value: format,
    example: "",
    hint: ""
  }
}

const createCustomOption = (options: [FormatOption], searchText = "") => {
  if (
    searchText.length === 0 ||
    options.some((option) => option.label === searchText)
  ) {
    return null
  } else {
    return customOption(searchText)
  }
}

type Props = {
  format: string
  axisLabel: string
  onFormatValueChange: (v: string) => void
  lockToPercentage?: boolean
  baseOptions: [FormatOption]
  disabled?: boolean
  tooltip?: string
  wrapperMenuIsOpen?: boolean
}
const VegaChartFormatSelector: FC<Props> = ({
  format,
  axisLabel,
  onFormatValueChange,
  lockToPercentage,
  baseOptions,
  disabled,
  tooltip = "",
  wrapperMenuIsOpen
}) => {
  const [searchText, setSearchText] = useState("")
  const [menuIsOpen, setMenuIsOpen] = useState(wrapperMenuIsOpen)
  const [options, setOptions] = useState(baseOptions)
  const [menuIndex, setMenuIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    setSearchText("")
  }, [format, menuIsOpen])
  useEffect(() => {
    setMenuIndex(0)
  }, [searchText, menuIsOpen])

  useEffect(() => {
    // when this component is not readily visible but visible when parent component menu is open,
    // we apply focus and autofocus for TextField
    if (wrapperMenuIsOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [wrapperMenuIsOpen])

  useEffect(() => {
    const optionsList = []

    // create custom option from current search text
    if (searchText) {
      optionsList.push(createCustomOption(baseOptions, searchText))
    }

    // if the current format is a custom option, add it to dropdown
    if (format && !optionsList.some((o) => o?.value === format)) {
      optionsList.push(customOption(format))
    }

    // filter by search text
    setOptions(
      [...optionsList, ...baseOptions].filter(
        (option) =>
          (option && option.hint && option.hint.includes(searchText)) ||
          (option &&
            option.label.toLowerCase().includes(searchText.toLowerCase()))
      )
    )
  }, [baseOptions, format, searchText])

  const onValueChange = (option) => {
    const value = option && option.value
    onFormatValueChange(value)
    setMenuIsOpen(false)
  }

  const menu = () => (
    <div className="format-selector-dropdown">
      <List compact>
        {options.map((listOption, i) => (
          <SimpleListItem
            key={i}
            value={listOption.value}
            onMouseDown={() => {
              onValueChange(listOption)
            }}
            selected={listOption.value === format}
            className={menuIndex === i ? "active" : ""}
          >
            <div className="simple-option">
              <span className="option-label">{listOption.label}</span>
              <span className="option-format-string">{listOption.hint}</span>
              <span className="option-value">{listOption.example}</span>
            </div>
          </SimpleListItem>
        ))}
      </List>
    </div>
  )

  const incrementMenuIndex = () => {
    if (menuIndex < options.length - 1) {
      setMenuIndex(menuIndex + 1)
    }
  }

  const decrementMenuIndex = () => {
    if (menuIndex > 0) {
      setMenuIndex(menuIndex - 1)
    }
  }

  const handleCloseDropdown = () => {
    setMenuIsOpen(false)
  }

  const handleOpenDropdown = () => {
    setMenuIsOpen(true)
  }

  const handleInputKeyDown = (e) => {
    if (e.keyCode === KEYCODE.Enter) {
      onValueChange(options[menuIndex])
      e.target.blur()
    } else if (e.keyCode === KEYCODE.ArrowDown) {
      incrementMenuIndex()
    } else if (e.keyCode === KEYCODE.ArrowUp) {
      decrementMenuIndex()
    }
  }
  const value = lockToPercentage ? "Percentage" : searchText
  const formatText = lockToPercentage ? "Percentage" : getFormatName(format)
  return (
    <>
      <div className="chart-format-selector" title={tooltip}>
        <TextField
          label={axisLabel}
          value={menuIsOpen ? value : formatText}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={() => setMenuIsOpen(true)}
          onBlur={() => setMenuIsOpen(false)}
          onKeyDown={handleInputKeyDown}
          disabled={disabled || lockToPercentage}
          inputRef={inputRef}
          autoFocus={wrapperMenuIsOpen}
          placeholder={getFormatName(format)}
          trailingIcon={
            menuIsOpen ? (
              <IconTriangleUp
                onMouseDown={(e) => {
                  handleCloseDropdown()
                  e.stopPropagation()
                  e.preventDefault()
                  inputRef.current.blur()
                }}
              />
            ) : (
              <IconTriangleDown
                onClick={(e) => {
                  handleOpenDropdown()
                  e.stopPropagation()
                  inputRef.current.focus()
                }}
              />
            )
          }
        />
        {menuIsOpen && menu()}
      </div>
    </>
  )
}

export default VegaChartFormatSelector
