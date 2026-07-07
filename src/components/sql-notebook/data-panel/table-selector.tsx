// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useState } from "react"
import { AutoSizer, List } from "react-virtualized"
import { TextField } from "widgets/text-field/TextField"
import { SQL_EDITOR_TEST_ID_TABLE_BROWSER_SEARCH } from "../../sql-editor/constants"
import {
  TABLE_LIST_ITEM_HEIGHT,
  ListItemWithActions,
  TableItem
} from "./list-item-with-actions"

import "./table-selector.scss"

// Copied/modified from SQLEditorTableSelector
const TableSelector = ({ tableData, rowActions, onSelectRow }) => {
  const [filterText, setFilterText] = useState("")

  // Ensure we default to a string if the search field is cleared and returns nothing
  const setOrClearFilterText = (text = "") => {
    setFilterText(text)
  }

  const tableDataFiltered = tableData.filter((row) =>
    String(row.value).toLowerCase().includes(filterText.toLowerCase())
  )

  const rowRenderer = ({ index, key, style }) => {
    const row = tableDataFiltered[index]
    return (
      <div
        key={key}
        style={style}
        data-testid={`sql-editor-table-selector-${row.value}`}
      >
        <ListItemWithActions<TableItem, "label">
          onSelect={onSelectRow}
          titleAttribute="label"
          item={row}
          key={key}
          actions={rowActions}
        />
      </div>
    )
  }

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
              rowHeight={TABLE_LIST_ITEM_HEIGHT}
              rowRenderer={rowRenderer}
            />
          )}
        </AutoSizer>
      </div>
    </>
  )
}

export default memo(TableSelector)
