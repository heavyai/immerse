// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useRef, useState, useEffect } from "react"
import cx from "classnames"
import { isEqual, findIndex, noop } from "lodash"

import {
  DataTable as RMWCDataTable,
  DataTableContent as RMWCDataTableContent,
  DataTableHead as RMWCDataTableHead,
  DataTableRow as RMWCDataTableRow,
  DataTableHeadCell as RMWCDataTableHeadCell,
  DataTableBody as RMWCDataTableBody,
  DataTableCell as RMWCDataTableCell
} from "@rmwc/data-table"
import { CircularProgress } from "@rmwc/circular-progress"

import { KEYCODE } from "constants/keycode"
import { DATA_TABLE_ROW_TEST_ID } from "../data-table/consts"

import "./column-table.scss"
import { TypeCategory } from "components/data-column-selector/types"
import { ColumnListItem } from "components/sql-notebook/data-panel/column-list-item"
import { ColumnMetadata } from "constants/prop-types"
import { IItemAction } from "components/sql-notebook/data-panel/row-action"

export type Column = {
  columnHeader: string
  columnKey: string
}

interface IColumnTable {
  loading: Boolean
  data: any
  dataHeaders: Array<Column>
  onSelectRow?: (r: Column) => void
  activeRow: ColumnMetadata | undefined
  rowActions: Array<IItemAction<ColumnMetadata>>
  filterCategoryColumnKey: string
  getFilterCategory: (s: string) => TypeCategory
  getFilterCategoryIcon: (s: TypeCategory) => JSX.Element
  useDefaultSort?: boolean
  isSortable?: boolean
  rowsSelectable?: boolean
}

export const ColumnTable = React.memo<IColumnTable>(
  ({
    loading,
    data,
    dataHeaders = [],
    onSelectRow,
    activeRow,
    rowActions,

    // Options for filtering by category
    filterCategoryColumnKey = "",
    getFilterCategory = (columnValue) => columnValue,
    getFilterCategoryIcon = (category) => category,

    useDefaultSort = true,
    isSortable = true,
    rowsSelectable = false
  }: IColumnTable) => {
    const [activeRowIndex, setActiveRowIndex] = useState(-1)

    const [displayedTableData, setDisplayedTableData] = useState(data)

    // Sort by first data header
    const [sortKey, setSortKey] = useState(
      useDefaultSort && dataHeaders.length > 0 ? dataHeaders[0].columnKey : ""
    )
    const [sortDirection, setSortDirection] = useState(1)

    const activeRowRef = useRef(null)
    const tableRef = useRef(null)

    useEffect(() => {
      setActiveRowIndex(
        findIndex(displayedTableData, (row) => isEqual(row, activeRow))
      )
    }, [activeRow, displayedTableData])

    const sortData = (key: string, direction: number) => {
      setSortKey(key)
      setSortDirection(direction)
    }

    useEffect(() => {
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
      if (sortKey && sortDirection) {
        setDisplayedTableData([...data].sort(sortRows))
      }
    }, [
      sortKey,
      sortDirection,
      data,
      filterCategoryColumnKey,
      getFilterCategory
    ])

    const handleKeyDown = useCallback(
      (e) => {
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
      },
      [activeRowIndex, displayedTableData, onSelectRow]
    )

    // We use the info in dataHeaders to determine which data columns to show
    // and what header text to display.
    //
    // If no dataHeaders are specified, we get the info from the first row of data
    const columns =
      dataHeaders.length > 0
        ? dataHeaders
        : Object.keys(data[0] || {}).map(
            (columnKey) =>
              ({
                columnKey,
                columnHeader: columnKey
              } as Column)
          )

    const renderSortableHeader = () =>
      isSortable && (
        <RMWCDataTableHead>
          <RMWCDataTableRow>
            {columns.map((column, index) => (
              <RMWCDataTableHeadCell
                className={cx({
                  "data-table__cell--last": index === columns.length - 1
                })}
                key={`data-table-header-${index}`}
                sort={sortKey === column.columnKey ? sortDirection : null}
                onSortChange={(direction: number) =>
                  sortData(column.columnKey, direction)
                }
              >
                {column.columnHeader || column.columnKey}
              </RMWCDataTableHeadCell>
            ))}
          </RMWCDataTableRow>
        </RMWCDataTableHead>
      )

    const getDisplayValue = (row: any, column: Column) => {
      return row[column.columnKey]
    }

    const renderRow = (row: any, rowIndex: number) => {
      const isRowDisabled = !rowsSelectable

      return (
        <RMWCDataTableRow
          data-testid={DATA_TABLE_ROW_TEST_ID}
          key={`data-table-row-${rowIndex}`}
          ref={rowIndex === activeRowIndex ? activeRowRef : null}
          onClick={isRowDisabled ? noop : () => onSelectRow?.(row)}
          className={cx({
            active: rowIndex === activeRowIndex,
            "is-clickable": onSelectRow && !isRowDisabled,
            disabled: isRowDisabled
          })}
        >
          {columns.map((column, columnIndex) => {
            const displayValue = getDisplayValue(row, column)
            return (
              <RMWCDataTableCell
                key={`data-table-cell-${rowIndex}-${columnIndex}`}
                className={cx(
                  `data-table__cell data-table__cell--key-${column.columnKey}`
                )}
              >
                <div>
                  {column.columnKey === filterCategoryColumnKey ? (
                    getFilterCategoryIcon(getFilterCategory(displayValue))
                  ) : (
                    <ColumnListItem
                      key={`${columnIndex}${rowIndex}`}
                      row={row}
                      rowActions={rowActions}
                    />
                  )}
                </div>
              </RMWCDataTableCell>
            )
          })}
        </RMWCDataTableRow>
      )
    }

    return (
      <div
        className={cx("sql-notebook__column-table", { "is-loading": loading })}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {loading ? (
          <CircularProgress size="large" />
        ) : (
          <RMWCDataTable
            className="sql-notebook__column-table__table"
            stickyRows={1}
            ref={tableRef}
          >
            <RMWCDataTableContent>
              {renderSortableHeader()}
              <RMWCDataTableBody>
                {displayedTableData.map(renderRow)}
              </RMWCDataTableBody>
            </RMWCDataTableContent>
          </RMWCDataTable>
        )}
      </div>
    )
  }
)
