// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import cx from "classnames"
import PropTypes from "prop-types"
import React from "react"
import { Tooltip } from "@rmwc/tooltip"

import { QuickFilterDropdown } from "components/quick-filters/quick-filter-dropdown"
import { VisibilityToggle } from "components/quick-filters/visibility-toggle"
import Popover from "components/popover/popover"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

export const categoricalFilterToLabel = ({ enabled, filter: { value } }) =>
  enabled ? process(String(value), { useDisplayName: true }) : "All"

export const QuickFilterNotchItem = ({
  setActiveDropdown,
  activeDropdown,
  currentFilter,
  editMode,
  toggleQuickFilterVisibility,
  getDistinctColumnValues,
  distinctValues,
  isLoadingDistinctValues,
  updateFilterValue,
  setQuickFilterOption,
  clearDistinctColumnValues,
  toggleFilterByName
}) => {
  const dropdownIsOpen = currentFilter.name === activeDropdown

  const toggleDropdown = () => {
    setActiveDropdown(dropdownIsOpen ? null : currentFilter.name)
  }

  const toggleCurrentQuickFilterVisibility = () =>
    toggleQuickFilterVisibility(currentFilter.name)

  const notchItemContainerClass = cx({
    "quick-filter-notch-item-container": true,
    visible: currentFilter.quickFilter?.visible
  })

  const notchItemClass = cx({
    "quick-filter-notch-item": true,
    "dropdown-open": dropdownIsOpen
  })

  const selectableValues = editMode
    ? distinctValues
    : (currentFilter.quickFilter &&
        Object.keys(currentFilter.quickFilter.optionValues)) ||
      []

  const selectOption = (newValue) => {
    if (newValue === "All") {
      toggleFilterByName(currentFilter.name, false)
    } else {
      updateFilterValue(currentFilter, newValue)
    }

    toggleDropdown()
  }

  return (
    <div className={notchItemContainerClass}>
      {editMode && (
        <VisibilityToggle
          handleToggle={toggleCurrentQuickFilterVisibility}
          classNames={cx("inline-icon", {
            inactive: !currentFilter.quickFilter?.visible
          })}
        />
      )}
      <Popover isOpened={dropdownIsOpen} onClose={toggleDropdown}>
        <QuickFilterDropdown
          selectableValues={selectableValues}
          selectOption={selectOption}
          currentFilter={currentFilter}
          toggleQuickFilterVisibility={setQuickFilterOption}
          toggleDropdown={toggleDropdown}
          editMode={editMode}
          getDistinctColumnValues={getDistinctColumnValues}
          isLoadingDistinctValues={isLoadingDistinctValues}
          clearDistinctColumnValues={clearDistinctColumnValues}
        />
      </Popover>
      <div className={notchItemClass} onClick={toggleDropdown}>
        <Tooltip
          enterDelay={500}
          content={`${
            currentFilter.filter.dataExpression
          }: ${categoricalFilterToLabel(currentFilter)}`}
        >
          <div className="text-container">
            {categoricalFilterToLabel(currentFilter)}
          </div>
        </Tooltip>
      </div>
    </div>
  )
}

QuickFilterNotchItem.propTypes = {
  setActiveDropdown: PropTypes.func,
  activeDropdown: PropTypes.string,
  currentFilter: PropTypes.shape({
    enabled: PropTypes.bool,
    filter: PropTypes.shape({
      dataExpression: PropTypes.string,
      value: PropTypes.string
    }),
    name: PropTypes.string
  }),
  selectOption: PropTypes.func,
  editMode: PropTypes.bool,
  toggleQuickFilterVisibility: PropTypes.func,
  getDistinctColumnValues: PropTypes.func,
  distinctValues: PropTypes.arrayOf(PropTypes.string),
  updateFilterValue: PropTypes.func,
  setQuickFilterOption: PropTypes.func,
  clearDistinctColumnValues: PropTypes.func
}
