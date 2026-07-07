// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, FC, useCallback } from "react"
import { isEqual, isEmpty } from "lodash"
import { List as VirtualizedList } from "react-virtualized"
import { List } from "widgets/list/List"
import { SimpleListItem } from "@rmwc/list"
import { Checkbox } from "@rmwc/checkbox"
import { TextField } from "widgets/text-field/TextField"
import { Tooltip } from "@rmwc/tooltip"

import {
  MultiSelectValue,
  SelectOption
} from "./dashboard-manager-filter-types"
import Popover from "../../popover/popover"

type Props = {
  setFilterValue: (filterValue: any, keepFilterOpen: boolean) => void
  label: string
  options: SelectOption[]
  initialValue?: MultiSelectValue
  onClearMultiSelect: (keepFilterOpen?: boolean) => void
  closeFilterWithoutChanges: () => void
}

type RowRendererProps = {
  style: any
  index: number
  key: any
}

const FilterValueMultiSelect: FC<Props> = ({
  setFilterValue,
  label,
  options = [],
  initialValue,
  onClearMultiSelect,
  closeFilterWithoutChanges
}) => {
  const [selectedValues, setSelectedValues] = useState(initialValue || {})
  const [dropdownIsOpen, setDropdownIsOpen] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [filteredOptions, setFilteredOptions] = useState(options)

  const handleTextFieldChange = (e) => setSearchText(e.target.value)
  const clearSearchText = () => setSearchText("")

  const filterBySearchText = () => {
    const selectedOptions = Object.keys(selectedValues).map((value) => ({
      value,
      label: value
    }))

    if (searchText) {
      setFilteredOptions([
        ...selectedOptions,
        ...options.filter(
          (option) =>
            !selectedValues[option.value] &&
            option.label.toLowerCase().includes(searchText.toLowerCase())
        )
      ])
    } else {
      setFilteredOptions([
        ...selectedOptions,
        ...options.filter((option) => !selectedValues[option.value])
      ])
    }
  }

  useEffect(filterBySearchText, [options, searchText, selectedValues])

  const shouldUpdateFilterValues = useCallback(
    () => !isEmpty(selectedValues) && !isEqual(selectedValues, initialValue),
    [initialValue, selectedValues]
  )

  const onChangeSelections = () => {
    if (shouldUpdateFilterValues()) {
      setFilterValue({ value: selectedValues }, true)
    } else if (isEmpty(selectedValues) && initialValue) {
      onClearMultiSelect(true)
    }
  }

  useEffect(onChangeSelections, [
    onClearMultiSelect,
    initialValue,
    selectedValues,
    setFilterValue,
    shouldUpdateFilterValues
  ])

  useEffect(() => {
    setDropdownIsOpen(true)
  }, [label])

  const toggleSelectedValue = (value, newState) => {
    if (newState) {
      setSelectedValues({ ...selectedValues, [value]: true })
    } else {
      const selected = { ...selectedValues }
      delete selected[value]
      setSelectedValues(selected)
    }
  }

  const onCloseDropdown = () => {
    setDropdownIsOpen(false)
    if (shouldUpdateFilterValues()) {
      setFilterValue({ value: selectedValues })
    } else if (isEqual(selectedValues, initialValue)) {
      closeFilterWithoutChanges()
    } else if (isEmpty(selectedValues)) {
      onClearMultiSelect()
    }
  }

  const onClick = () => {
    setDropdownIsOpen(true)
  }

  const listItem = ({ key, style, index }: RowRendererProps) => (
    // eslint-disable-next-line react/no-unknown-property
    <div key={key} style={style} index={index}>
      <Tooltip content={filteredOptions[index].value}>
        <SimpleListItem
          selected={Boolean(selectedValues[filteredOptions[index].value])}
        >
          <Checkbox
            checked={Boolean(selectedValues[filteredOptions[index].value])}
            onChange={(e) => {
              toggleSelectedValue(
                filteredOptions[index].value,
                e.currentTarget.checked
              )
            }}
            label={filteredOptions[index].label}
          />
        </SimpleListItem>
      </Tooltip>
    </div>
  )

  const rowRenderer = (rowRendererProps: RowRendererProps) => {
    return listItem(rowRendererProps)
  }

  const editModePlaceholder = initialValue && (
    <Tooltip content={Object.keys(initialValue).join(", ")}>
      <TextField
        label={label}
        value={Object.keys(initialValue).join(", ")}
        readOnly
        outlined={false}
      />
    </Tooltip>
  )

  const newFilterPlaceholder = (
    <>
      <div>{label}</div>
    </>
  )

  const searchInput = (
    <div className="dashboard-mngr-multiselect-search">
      <TextField
        placeholder="Search"
        value={searchText}
        onChange={handleTextFieldChange}
        icon="search"
        trailingIcon={
          searchText && {
            icon: "close",
            onClick: clearSearchText
          }
        }
        className="mdc-text-field--upgraded"
        data-testid="dashboard-manager-filter-tag-multiselect-search-input"
      />
    </div>
  )

  const optionsList =
    filteredOptions.length > 6 ? (
      <div className="virtualized-container mdc-list extra-compact">
        <VirtualizedList
          rowRenderer={rowRenderer}
          width={231}
          height={160}
          rowCount={filteredOptions.length}
          rowHeight={24}
        />
        )
      </div>
    ) : (
      <List extraCompact>
        {filteredOptions.map((option, i) => listItem({ key: i, index: i }))}
      </List>
    )

  return (
    <div className="dashboard-mngr-multiselect">
      <div className="dashboard-mngr-filter-type-placeholder" onClick={onClick}>
        {initialValue ? editModePlaceholder : newFilterPlaceholder}
      </div>
      <Popover isOpened={dropdownIsOpen} onClose={onCloseDropdown}>
        {searchInput}
        {optionsList}
      </Popover>
    </div>
  )
}

export default FilterValueMultiSelect
