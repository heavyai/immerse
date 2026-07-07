// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useState } from "react"
import { Icon } from "@rmwc/icon"
import { TextField } from "widgets/text-field/TextField"
import { AutoSizer, List } from "react-virtualized"

import { SQL_EDITOR_TEST_ID_TABLE_BROWSER_SEARCH } from "./constants"
import "./sql-editor-table-selector.scss"

const SqlEditorTableSelector = ({ onSelectRow, tableData, exportRowValue }) => {
  const [filterText, setFilterText] = useState("")

  // Ensure we default to a string if the search field is cleared and returns nothing
  const setOrClearFilterText = (text = "") => {
    setFilterText(text)
  }

  const TableRow = ({ row, style }) => (
    <div
      className="insert-action-row"
      onClick={() => onSelectRow(row)}
      style={style}
      data-testid={`sql-editor-table-selector-${row.value}`}
    >
      <Icon
        className="insert-action-row__icon has-action"
        icon="input"
        title="Copy To SQL Input Box"
        style={{
          // Material's insert icon points right and there's no left-pointing
          // option, so flipping it with CSS
          transform: "scaleX(-1)"
        }}
        onClick={(e) => {
          // Prevent `onSelectRow` action from firing and only trigger icon action.
          e.stopPropagation()
          exportRowValue(row)
        }}
        data-testid={`sql-editor-table-selector-${row.value}-insert`}
      />

      <span className="insert-action-row__value">{row.value}</span>
    </div>
  )

  const tableDataFiltered = tableData.filter((row) =>
    String(row.value).toLowerCase().includes(filterText.toLowerCase())
  )

  return (
    <>
      <div
        className="table-selector__search"
        data-testid={SQL_EDITOR_TEST_ID_TABLE_BROWSER_SEARCH}
      >
        <TextField
          className="table-selector__search__input"
          icon="search"
          trailingIcon={
            filterText.length
              ? {
                  icon: "close",
                  onClick: () => setOrClearFilterText()
                }
              : null
          }
          label="Find a table"
          value={filterText}
          onChange={(e) => setOrClearFilterText(e.target.value)}
        />
      </div>
      <div className="table-selector__list">
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              rowCount={tableDataFiltered.length}
              rowHeight={35}
              rowRenderer={({ index, key, style }) => (
                <TableRow
                  row={tableDataFiltered[index]}
                  key={key}
                  style={style}
                />
              )}
            />
          )}
        </AutoSizer>
      </div>
    </>
  )
}

export default memo(SqlEditorTableSelector)
