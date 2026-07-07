// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useRef, useState, useEffect } from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import { uniq, isEqual, findIndex } from "lodash"

import { TextField } from "widgets/text-field/TextField"
import {
  DataTable as RMWCDataTable,
  DataTableContent as RMWCDataTableContent,
  DataTableHead as RMWCDataTableHead,
  DataTableRow as RMWCDataTableRow,
  DataTableHeadCell as RMWCDataTableHeadCell,
  DataTableBody as RMWCDataTableBody,
  DataTableCell as RMWCDataTableCell
} from "@rmwc/data-table"
import "@rmwc/data-table/data-table.css"
import { Tooltip } from "@rmwc/tooltip"
import { Icon } from "@rmwc/icon"
import "@rmwc/tooltip/tooltip.css"
import { CircularProgress } from "@rmwc/circular-progress"
import "@rmwc/circular-progress/circular-progress.css"

import { KEYCODE } from "constants/keycode"
import { DATA_TABLE_COMPONENT, DATA_TABLE_ROW_TEST_ID } from "./consts"

import "./data-table.scss"

export const RowIconCell = ({ row, rowIconOptions }) => {
  const disableIcon = rowIconOptions.isDisabled
    ? rowIconOptions.isDisabled(row)
    : false

  const icon = rowIconOptions.iconRenderer ? (
    rowIconOptions.iconRenderer(row)
  ) : (
    <Icon
      icon={rowIconOptions.icon}
      title={rowIconOptions.title}
      style={rowIconOptions.style}
      disabled={disableIcon}
    />
  )

  return rowIconOptions?.isVisible && !rowIconOptions?.isVisible(row) ? (
    <RMWCDataTableCell />
  ) : (
    <RMWCDataTableCell
      className={cx("data-table__cell--icon", {
        "has-action": rowIconOptions.action && !disableIcon
      })}
      onClick={
        rowIconOptions.action
          ? (e) => {
              // Prevent `onSelectRow` action from firing and only trigger icon action.
              e.stopPropagation()
              rowIconOptions.action(row)
            }
          : null
      }
    >
      {disableIcon && rowIconOptions.disabledIconTooltip ? (
        <Tooltip
          content={disableIcon ? rowIconOptions.disabledIconTooltip(row) : null}
        >
          {icon}
        </Tooltip>
      ) : (
        icon
      )}
    </RMWCDataTableCell>
  )
}

// Documentation in Front End wiki
const DataTable = ({
  loading,
  data,
  dataTableRef,
  dataHeaders = [],
  callToAction,
  callToActionText,
  onSelectRow,
  activeRow,
  onMouseDown,
  rowIconOptions,
  searchFieldLabel = "Search",
  searchFieldPlaceholder,
  // Options for filtering by text
  filterText,
  filterTextColumnKey = "value",
  // Options for filtering by category
  hideFilterCategoryOptions,
  filterCategoryColumnKey = "",
  getFilterCategory = (columnValue) => columnValue,
  getFilterCategoryLabel = (category) => category,
  getFilterCategoryIcon = (category) => category,
  filterCategoriesLabel = "Data Type Filters:",
  useDefaultSort = true,
  isSortable = true,
  shouldDisableRowSelection = () => false,
  // Customize component order
  layout = [DATA_TABLE_COMPONENT.SEARCH_FIELD, DATA_TABLE_COMPONENT.FILTERS]
}) => {
  const [activeFilters, setActiveFilters] = useState([])
  const [activeRowIndex, setActiveRowIndex] = useState(-1)

  const [searchFieldValue, setSearchFieldValue] = useState("")

  // Sort by first data header
  const [sortKey, setSortKey] = useState(
    useDefaultSort && dataHeaders.length > 0 ? dataHeaders[0].columnKey : ""
  )
  const [sortDirection, setSortDirection] = useState(1)

  const activeRowRef = useRef(null)
  const tableRef = useRef(null)

  let displayedTableData = data

  useEffect(() => {
    setActiveRowIndex(
      findIndex(displayedTableData, (row) => isEqual(row, activeRow))
    )
  }, [activeRow, displayedTableData])

  useEffect(() => {
    // When loading changes, clear search filter text so user's first view is of whole table
    setSearchFieldValue("")

    // When loading changes, we can assume we are loading new tableData. If you
    // have an active type that is not present in the new tableData, table will
    // be empty with no apparent way to undo the filter
    setActiveFilters([])
  }, [loading])

  useEffect(() => {
    if (activeRowRef.current) {
      const parentClientRect = tableRef.current.getBoundingClientRect()
      const selectionClientRect = activeRowRef.current.getBoundingClientRect()

      if (
        selectionClientRect.top - 25 < parentClientRect.top ||
        selectionClientRect.bottom > parentClientRect.bottom
      ) {
        activeRowRef.current.scrollIntoView(false)
      }
    }
  }, [
    // Parent components might pass an active selection that renders past the
    // fold of the table container, so scroll it into view
    activeRowIndex,
    // Sorting the table may also hide the active selection
    sortKey,
    sortDirection
  ])

  // Ensure we default to a string if the search field is cleared and returns nothing
  const setOrClearSearchFieldValue = (text = "") => {
    setSearchFieldValue(text)
  }

  // Adds or removes a type from the currently active data types
  const toggleFilterActive = (type) => {
    if (activeFilters.includes(type)) {
      const index = activeFilters.indexOf(type)
      const types = [...activeFilters]
      types.splice(index, 1)
      setActiveFilters(types)
    } else {
      setActiveFilters([...activeFilters, type])
    }
  }

  const sortRows = (rowA, rowB) => {
    let rowAValue = rowA[sortKey]
    let rowBValue = rowB[sortKey]

    // Use the displayed type category to sort instead of underlying value
    if (sortKey === filterCategoryColumnKey) {
      rowAValue = getFilterCategory(rowAValue)
      rowBValue = getFilterCategory(rowBValue)
    }

    if (rowAValue < rowBValue) {
      return -1 * sortDirection
    }
    if (rowAValue > rowBValue) {
      return sortDirection
    }
    return 0
  }

  const sortData = (key, direction) => {
    setSortKey(key)
    setSortDirection(direction)
  }

  const filterCategoryList = filterCategoryColumnKey
    ? uniq(
        data.map((column) => getFilterCategory(column[filterCategoryColumnKey]))
      )
    : []

  // Filter table data by either passed in filter text or value in search field
  displayedTableData = data.filter((column) =>
    String(column[filterTextColumnKey])
      .toLowerCase()
      .includes((filterText || searchFieldValue).toLowerCase())
  )

  // Filter table data by active filters
  if (filterCategoryColumnKey) {
    displayedTableData = displayedTableData.filter(
      (column) =>
        activeFilters.includes(
          getFilterCategory(column[filterCategoryColumnKey])
        ) ||
        // No activeFilters indicates that columns are not filtered by type
        !activeFilters.length
    )
  }

  if (sortKey && sortDirection) {
    displayedTableData = displayedTableData.sort(sortRows)
  }

  if (
    // We set the active row to the first row of the table if the user filtered
    // away the active row or the user types a search term and no active row has
    // been set yet
    (displayedTableData.length > 0 &&
      activeRowIndex > displayedTableData.length - 1) ||
    ((filterText || searchFieldValue) && activeRowIndex < 0)
  ) {
    setActiveRowIndex(0)
  }

  const handleKeyDown = (e) => {
    if (e.keyCode === KEYCODE.ArrowUp && activeRowIndex > 0) {
      setActiveRowIndex(activeRowIndex - 1)
    } else if (
      e.keyCode === KEYCODE.ArrowDown &&
      activeRowIndex < displayedTableData.length - 1
    ) {
      setActiveRowIndex(activeRowIndex + 1)
    } else if (e.keyCode === KEYCODE.Enter) {
      if (displayedTableData[activeRowIndex]) {
        onSelectRow(displayedTableData[activeRowIndex])
      }
    }
  }

  // We use the info in dataHeaders to determine which data columns to show
  // and what header text to display.
  //
  // If no dataHeaders are specified, we get the info from the first row of data
  const columns =
    dataHeaders.length > 0
      ? dataHeaders
      : Object.keys(data[0] || {}).map((columnKey) => ({
          columnKey,
          columnHeader: columnKey
        }))

  const renderSortableHeader = () =>
    isSortable && (
      <RMWCDataTableHead>
        <RMWCDataTableRow>
          {rowIconOptions && !rowIconOptions.alignRight && (
            <RMWCDataTableHeadCell />
          )}

          {columns.map((column, index) => (
            <RMWCDataTableHeadCell
              className={cx({
                "data-table__cell--last": index === columns.length - 1
              })}
              key={`data-table-header-${index}`}
              sort={sortKey === column.columnKey ? sortDirection : null}
              onSortChange={(direction) =>
                sortData(column.columnKey, direction)
              }
              alignEnd={column.alignEnd}
            >
              {column.columnHeader || column.columnKey}
            </RMWCDataTableHeadCell>
          ))}

          {rowIconOptions && rowIconOptions.alignRight && (
            <RMWCDataTableHeadCell />
          )}
        </RMWCDataTableRow>
      </RMWCDataTableHead>
    )

  const searchField = typeof filterText === "undefined" && (
    <div className={"data-table__search"} key="search-field">
      <TextField
        className="data-table__search__input"
        icon="search"
        trailingIcon={
          searchFieldValue.length
            ? {
                className: "data-table__search__input__close",
                icon: "close",
                onClick: () => setOrClearSearchFieldValue()
              }
            : null
        }
        label={searchFieldLabel}
        placeholder={searchFieldPlaceholder}
        value={searchFieldValue}
        onChange={(e) => setOrClearSearchFieldValue(e.target.value)}
      />
    </div>
  )

  const filterBar = filterCategoryColumnKey && !hideFilterCategoryOptions && (
    <div className="data-table__filters" key="filter-bar">
      <span>{filterCategoriesLabel}</span>
      {loading ? null : (
        <div className="data-table__filter-categories">
          {filterCategoryList.map((filterCategory, index) => (
            <Tooltip
              content={getFilterCategoryLabel(filterCategory)}
              key={`type-list-${index}`}
              enterDelay={500}
            >
              <div
                className={cx("data-table__filter-categories__icon", {
                  active: activeFilters.includes(filterCategory)
                })}
                onClick={() => toggleFilterActive(filterCategory)}
              >
                {getFilterCategoryIcon(filterCategory)}
              </div>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  )

  const mapLayoutItemToComponent = (componentKey) => {
    switch (componentKey) {
      case DATA_TABLE_COMPONENT.SEARCH_FIELD:
        return searchField
      case DATA_TABLE_COMPONENT.FILTERS:
        return filterBar
      default:
        return null
    }
  }

  const getDisplayValue = (row, column) => {
    return typeof row[column.columnKey] === "boolean"
      ? row[column.columnKey].toString()
      : row[column.columnKey]
  }

  const getColumnTooltip = (row, column) => {
    const displayValue = getDisplayValue(row, column)
    if (column.columnKey === filterCategoryColumnKey) {
      return getFilterCategoryLabel(getFilterCategory(displayValue))
    } else if (row.is_join) {
      return `${row.table}.${row.value}`
    } else {
      return displayValue
    }
  }

  const renderRow = (row, rowIndex) => {
    const isRowDisabled = shouldDisableRowSelection(row)

    return (
      <RMWCDataTableRow
        data-testid={DATA_TABLE_ROW_TEST_ID}
        key={`data-table-row-${rowIndex}`}
        ref={rowIndex === activeRowIndex ? activeRowRef : null}
        onClick={isRowDisabled ? null : () => onSelectRow(row)}
        className={cx({
          active: rowIndex === activeRowIndex,
          "is-clickable": onSelectRow && !isRowDisabled,
          disabled: isRowDisabled
        })}
      >
        {rowIconOptions && !rowIconOptions.alignRight && (
          <RowIconCell row={row} rowIconOptions={rowIconOptions} />
        )}

        {columns.map((column, columnIndex) => {
          const displayValue = getDisplayValue(row, column)
          return (
            <RMWCDataTableCell
              key={`data-table-cell-${rowIndex}-${columnIndex}`}
              className={cx(
                `data-table__cell data-table__cell--key-${column.columnKey}`,
                {
                  "data-table__cell--first": columnIndex === 0,
                  "data-table__cell--last": columnIndex === columns.length - 1
                }
              )}
              alignEnd={column.alignEnd}
            >
              <Tooltip content={getColumnTooltip(row, column)} enterDelay={500}>
                <span>
                  {column.columnKey === filterCategoryColumnKey
                    ? getFilterCategoryIcon(getFilterCategory(displayValue))
                    : displayValue}
                </span>
              </Tooltip>
            </RMWCDataTableCell>
          )
        })}
        {rowIconOptions && rowIconOptions.alignRight && (
          <RowIconCell row={row} rowIconOptions={rowIconOptions} />
        )}
      </RMWCDataTableRow>
    )
  }

  return (
    <div
      className="data-table"
      tabIndex="0"
      ref={dataTableRef}
      onKeyDown={handleKeyDown}
      onMouseDown={onMouseDown}
    >
      {layout.map(mapLayoutItemToComponent)}
      {loading ? (
        <div className="data-table--loading">
          <CircularProgress size="large" />
        </div>
      ) : (
        <RMWCDataTable
          className="data-table__table"
          stickyRows={1}
          ref={tableRef}
        >
          <RMWCDataTableContent>
            {renderSortableHeader()}
            <RMWCDataTableBody>
              {callToAction && (
                <RMWCDataTableRow
                  className="data-table__row--cta is-clickable"
                  onClick={callToAction}
                >
                  {columns.map((_, index) =>
                    index === 0 ? (
                      <React.Fragment key={index}>
                        <RMWCDataTableCell>
                          {callToActionText}
                        </RMWCDataTableCell>
                        {/* Empty cell purely to get correct background color */}
                        {rowIconOptions && rowIconOptions.alignRight && (
                          <RMWCDataTableCell />
                        )}
                      </React.Fragment>
                    ) : (
                      <React.Fragment key={index}>
                        <RMWCDataTableCell />
                        {rowIconOptions && rowIconOptions.alignRight && (
                          <RMWCDataTableCell />
                        )}
                      </React.Fragment>
                    )
                  )}
                </RMWCDataTableRow>
              )}

              {displayedTableData.map(renderRow)}
            </RMWCDataTableBody>
          </RMWCDataTableContent>
        </RMWCDataTable>
      )}
    </div>
  )
}

DataTable.propTypes = {
  loading: PropTypes.bool,
  data: PropTypes.arrayOf(PropTypes.object),
  dataTableRef: PropTypes.object,
  dataHeaders: PropTypes.arrayOf(PropTypes.object),
  activeRow: PropTypes.object,
  onSelectRow: PropTypes.func,
  onMouseDown: PropTypes.func,
  rowIconOptions: PropTypes.shape({
    icon: PropTypes.string,
    title: PropTypes.string,
    style: PropTypes.object,
    action: PropTypes.func,
    alignRight: PropTypes.bool,
    isVisible: PropTypes.func,
    isDisabled: PropTypes.func
  }),
  searchFieldLabel: PropTypes.string,
  searchFieldPlaceholder: PropTypes.string,
  filterText: PropTypes.string,
  filterTextColumnKey: PropTypes.string,
  filterCategoryColumnKey: PropTypes.string,
  getFilterCategory: PropTypes.func,
  getFilterCategoryLabel: PropTypes.func,
  getFilterCategoryIcon: PropTypes.func,
  headerRenderer: PropTypes.func
}

export default memo(DataTable)
