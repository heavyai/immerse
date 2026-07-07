// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import cx from "classnames"
import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"

import { SimpleListItem } from "@rmwc/list"
import { CircularProgress } from "@rmwc/circular-progress"
import "@rmwc/circular-progress/circular-progress.css"
import { TextField } from "widgets/text-field/TextField"
import { List } from "react-virtualized"

import { PinToggle } from "components/quick-filters/PinToggle"
import Portal from "components/portal/Portal"
import { valueIsVisibleOnDashboard } from "components/quick-filters/quick-filter-utils"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

const tooltipContainerId = (index) => `quick-filter-dropdown-option-${index}`

export const QuickFilterDropdown = ({
  selectOption,
  selectableValues,
  currentFilter,
  toggleQuickFilterVisibility,
  editMode,
  getDistinctColumnValues,
  isLoadingDistinctValues,
  clearDistinctColumnValues
}) => {
  // Max number of rows visible without scrolling
  // We switch to a virtualized list once we hit this number.
  const MAX_VISIBLE_ROWS = 6
  const DROPDOWN_ROW_HEIGHT = 24

  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    if (editMode) {
      getDistinctColumnValues(currentFilter, searchText)
    }
    return clearDistinctColumnValues(
      currentFilter.filter.dataSource,
      currentFilter.filter.dataExpression
    )
  }, [
    clearDistinctColumnValues,
    currentFilter,
    editMode,
    getDistinctColumnValues,
    searchText
  ])

  // Index of the option we are hovering over, used for tooltip position
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const clearTooltip = () => setHoveredIndex(null)

  // Values that are visible when on dashboard
  const selectedValues = [
    "All",
    ...((currentFilter.quickFilter &&
      Object.keys(currentFilter.quickFilter.optionValues)) ||
      [])
  ]

  const selectOptions = selectedValues
    .concat(
      selectableValues.filter(
        (value) => !valueIsVisibleOnDashboard(value, currentFilter)
      )
    )
    .map((value) => ({
      value,
      label: process(value, { useDisplayName: true }),
      isPinned: valueIsVisibleOnDashboard(value, currentFilter),
      onClick: () => {
        selectOption(value)
      },
      toggleOption: (e) => {
        e.stopPropagation()
        toggleQuickFilterVisibility(currentFilter.name, value)
      }
    }))

  // Add a divider between selected and unselected options, if any
  if (selectOptions.length > selectedValues.length) {
    selectOptions[selectedValues.length - 1].lastSelected = true
  }

  const useVirtualized = selectOptions.length >= MAX_VISIBLE_ROWS

  const handleTextFieldChange = (e) => setSearchText(e.target.value)
  const clearSearchText = () => setSearchText("")

  const isSelectedOption = (option, { enabled, filter }) => {
    if (option.value === "All" && !enabled) {
      return true
    }
    return enabled ? option.value === filter.value : false
  }

  const dropdownListItem = ({ key, style, index }, showTooltip = true) => {
    /** Hide this toggle for options that should always be visible:
     * 1) "All" option
     * 2) The currently selected value for the filter, if that filter is enabled
     */
    const enablePinToggle =
      editMode &&
      selectOptions[index].value !== "All" &&
      !isSelectedOption(selectOptions[index], currentFilter) &&
      currentFilter.quickFilter?.visible

    const onMouseOver = showTooltip
      ? () => {
          setHoveredIndex(index)
        }
      : null

    const onClickItem = () => {
      selectOptions[index].onClick()
      clearTooltip()
    }

    return (
      <SimpleListItem
        key={key}
        onClick={onClickItem}
        selected={isSelectedOption(selectOptions[index], currentFilter)}
        style={style}
        index={index}
        className={cx({
          "last-selected": selectOptions[index].lastSelected
        })}
        id={showTooltip ? tooltipContainerId(index) : ""}
        onMouseOver={onMouseOver}
      >
        <div
          className={cx("dropdown-option", {
            visible: valueIsVisibleOnDashboard(
              selectOptions[index].value,
              currentFilter
            )
          })}
        >
          {enablePinToggle && (
            <PinToggle
              handleToggle={selectOptions[index].toggleOption}
              isPinned={selectOptions[index].isPinned}
            />
          )}
          <div className="option-text">{selectOptions[index].label}</div>
        </div>
      </SimpleListItem>
    )
  }

  const rowRenderer = (rowRendererProps) => {
    return dropdownListItem(rowRendererProps)
  }

  const virtualizedList = (
    <div className="virtualized-container mdc-list extra-compact">
      <List
        rowRenderer={rowRenderer}
        width={164}
        height={MAX_VISIBLE_ROWS * DROPDOWN_ROW_HEIGHT}
        rowCount={selectOptions.length}
        rowHeight={DROPDOWN_ROW_HEIGHT}
      />
    </div>
  )

  const dropdownList = (
    <div onMouseLeave={clearTooltip}>
      {useVirtualized ? (
        virtualizedList
      ) : (
        <div className="mdc-list extra-compact">
          {selectOptions.map((option, i) =>
            dropdownListItem({ key: option.value, index: i })
          )}
        </div>
      )}
    </div>
  )

  const hoveredEl = document.getElementById(tooltipContainerId(hoveredIndex))
  const tooltip = hoveredIndex !== null &&
    hoveredEl &&
    selectOptions[hoveredIndex] && (
      <Portal rootId="custom-portal-root">
        <div
          className={cx(
            "mdc-list extra-compact quick-filter-dropdown-tooltip quick-filter-notch-container"
          )}
          style={{
            top: hoveredEl.getBoundingClientRect().top,
            left: hoveredEl.getBoundingClientRect().left,
            "min-width": hoveredEl.getBoundingClientRect().width
          }}
        >
          {dropdownListItem(
            {
              key: selectOptions[hoveredIndex].value,
              index: hoveredIndex
            },
            false
          )}
        </div>
      </Portal>
    )

  const trailingIcon = searchText ? "close" : ""

  return (
    <div
      className={cx("notch-dropdown", {
        virtualized: useVirtualized
      })}
    >
      {editMode && (
        <TextField
          placeholder="Search"
          value={searchText}
          onChange={handleTextFieldChange}
          icon="search"
          trailingIcon={{
            icon: isLoadingDistinctValues ? (
              <CircularProgress size={20} />
            ) : (
              trailingIcon
            ),
            onClick: clearSearchText
          }}
        />
      )}
      {tooltip}
      {dropdownList}
    </div>
  )
}

QuickFilterDropdown.propTypes = {
  selectableValues: PropTypes.arrayOf(PropTypes.string),
  currentFilter: PropTypes.shape({
    enabled: PropTypes.bool,
    filter: PropTypes.shape({
      dataExpression: PropTypes.string,
      value: PropTypes.string
    }),
    name: PropTypes.string
  }),
  selectOption: PropTypes.func,
  toggleQuickFilterVisibility: PropTypes.func,
  editMode: PropTypes.bool,
  getDistinctColumnValues: PropTypes.func,
  clearDistinctColumnValues: PropTypes.func
}
