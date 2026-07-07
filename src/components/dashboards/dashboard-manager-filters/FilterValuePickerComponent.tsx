// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect } from "react"
import { TextField } from "widgets/text-field/TextField"

import DashboardManagerFiltersSimpleSelect from "./DashboardManagerFiltersSimpleSelect"
import Popover from "../../popover/popover"
import { FilterTag, SelectOption } from "./dashboard-manager-filter-types"
import FilterValueDatePicker from "./FilterValueDatePicker"
import FilterValueTextInput from "./FilterValueTextInput"
import FilterValueMultiSelect from "./FilterValueMultiSelect"
import {
  filterTagTypeLabel,
  isValidFilter,
  filterTagValueLabel
} from "./dashboard-manager-filter-utils"

type Props = {
  selectedFilter: FilterTag | null
  setFilter: (selectedFilter: any) => void
  defaultMenuOpenState?: boolean
  options: SelectOption
  setSelectedFilter: (filter: FilterTag) => void
  removeFilterTag: (filter: FilterTag) => void
  filterTag: FilterTag
  scrollTagsContainer: () => void
}

const FilterValuePickerComponent: FC<Props> = ({
  selectedFilter,
  setFilter,
  defaultMenuOpenState,
  options,
  setSelectedFilter,
  removeFilterTag,
  filterTag,
  scrollTagsContainer
}) => {
  const selectedFilterType = Object.keys(selectedFilter)[0]
  const selectedFilterValue = selectedFilter[selectedFilterType]
  const [menuIsOpen, setMenuIsOpen] = useState(defaultMenuOpenState)

  useEffect(scrollTagsContainer, [scrollTagsContainer, selectedFilter])

  const closeFilterWithoutChanges = () => {
    // Call setFilter even if no changes have been made, just to sort last
    // "edited" filter to top
    setFilter(selectedFilter)
    setSelectedFilter(null)
  }

  // Handles behavior when all values are unchecked in multiselect.
  const onClearMultiSelect = (keepFilterOpen = false) => {
    if (filterTag) {
      removeFilterTag(filterTag)
    } else {
      setSelectedFilter(null)
    }
    if (keepFilterOpen) {
      const filterType = Object.keys(filterTag)[0]

      // Keep multiselect open in edit mode to maintain the illusion of editing
      // the same filter, even though we've deleted the original.
      setSelectedFilter({
        [filterType]: null
      })
    }
  }

  const handleCloseDropdown = () => {
    setMenuIsOpen(false)
    if (isValidFilter(selectedFilter)) {
      closeFilterWithoutChanges()
    }
  }

  const onSelectOption = (option: SelectOption, keepFilterOpen = false) => {
    const updatedFilter = {
      ...selectedFilter,
      [selectedFilterType]: option.value
    }

    if (keepFilterOpen) {
      setSelectedFilter(updatedFilter)
    } else {
      setMenuIsOpen(false)
      setSelectedFilter(null)
    }

    if (isValidFilter(updatedFilter)) {
      setFilter(updatedFilter)
    } else {
      // Automatically remove filter if we've edited it to an empty state
      removeFilterTag(selectedFilter)
    }
  }

  const removeFilter = () => {
    removeFilterTag(filterTag)
    setSelectedFilter(null)
  }

  const placeholder = isValidFilter(selectedFilter) ? (
    <TextField
      readOnly
      outlined={false}
      value={filterTagValueLabel(selectedFilter)}
      label={filterTagTypeLabel(selectedFilterType)}
      className={"selected-filter-tag-placeholder"}
    />
  ) : (
    <div
      className="dashboard-mngr-filter-type-placeholder"
      onClick={() => setMenuIsOpen(true)}
    >
      {filterTagTypeLabel(selectedFilterType)}
    </div>
  )

  let filterValuePicker = null
  let openInPopover = true

  if (selectedFilter && selectedFilterType === "is_shared") {
    filterValuePicker = (
      <DashboardManagerFiltersSimpleSelect
        options={options}
        selectOption={onSelectOption}
        initialValue={selectedFilterValue}
      />
    )
  } else if (selectedFilterType && selectedFilterType === "last_modified") {
    filterValuePicker = (
      <FilterValueDatePicker
        setFilterValue={onSelectOption}
        label={filterTagTypeLabel(selectedFilterType)}
        initialValue={selectedFilterValue}
        removeFilter={removeFilter}
      />
    )
    openInPopover = false
  } else if (
    selectedFilterType === "source" ||
    selectedFilterType === "owner"
  ) {
    filterValuePicker = (
      <FilterValueMultiSelect
        setFilterValue={onSelectOption}
        label={filterTagTypeLabel(selectedFilterType)}
        options={options}
        initialValue={selectedFilterValue}
        onClearMultiSelect={onClearMultiSelect}
        closeFilterWithoutChanges={closeFilterWithoutChanges}
      />
    )
    openInPopover = false
  } else if (selectedFilterType === "title") {
    filterValuePicker = (
      <FilterValueTextInput
        setFilterValue={onSelectOption}
        label={filterTagTypeLabel(selectedFilterType)}
        initialValue={selectedFilterValue}
        removeFilter={removeFilter}
      />
    )
    openInPopover = false
  }

  const popoverValuePicker = (
    <>
      {placeholder}
      {menuIsOpen && (
        <Popover isOpened onClose={handleCloseDropdown}>
          {filterValuePicker}
        </Popover>
      )}
    </>
  )

  return (
    <div className="dashboard-mngr-filter-wrapper">
      {openInPopover ? popoverValuePicker : filterValuePicker}
    </div>
  )
}

export default FilterValuePickerComponent
