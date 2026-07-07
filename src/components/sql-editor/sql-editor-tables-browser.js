// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import { defaultMemoize } from "reselect"
import cx from "classnames"

import { Icon } from "@rmwc/icon"
import { CircularProgress } from "@rmwc/circular-progress"
import "@rmwc/circular-progress/circular-progress.css"

import { getDataSourcePreview } from "actions/table-preview-action-creators"
import { getTables } from "actions/tables-reference-action-creators"
import DataColumnSelector from "components/data-column-selector/data-column-selector"

import SqlEditorTableSelector from "./sql-editor-table-selector"

import "./sql-editor-tables-browser.scss"

// Memoize this map so that it doesn't make a new array unless
// the original list changed
const tablesSelector = defaultMemoize((tablesReferenceList) =>
  tablesReferenceList
    ? tablesReferenceList.map((table) => ({
        value: table.name,
        label: table.name
      }))
    : []
)

// Ditto
const columnsSelector = defaultMemoize(({ tableName, fields }) =>
  Object.values(fields).map((field) => ({
    ...field,
    table: tableName,
    value: field.name
  }))
)

export const mapStateToProps = (
  { tablesReference = {}, tablePreview = {} },
  ownProps
) => ({
  tables: tablesSelector(tablesReference.list),
  tablesLoading: tablesReference.loading,
  tablesError: tablesReference.error,

  // data-column-selector options need a 'type' - a string like 'INT',
  // like what constants/data-types functions understand. This 'type' is
  // already on these fields. It also needs a 'value' which is the column name,
  // and a 'table' which is the table the columns are on
  columns: columnsSelector(tablePreview),

  columnsLoading: tablePreview.loading,
  columnsError: tablePreview.error,
  ...ownProps
})

export const mapDispatchToProps = (dispatch) => ({
  requestTables() {
    dispatch(getTables())
  },
  requestTablePreview(tableName) {
    dispatch(getDataSourcePreview(tableName))
  }
})

const connector = connect(mapStateToProps, mapDispatchToProps)

const SqlEditorTablesBrowser = ({
  insertAtCursor,
  tables,
  tablesLoading,
  columns,
  columnsLoading,
  requestTables,
  requestTablePreview,
  selectedRow,
  setSelectedRow
}) => {
  const [showTables, setShowTables] = useState(true)
  const [showColumns, setShowColumns] = useState(false)
  const [currentTableName, setCurrentTableName] = useState("")

  const exportRowValue = ({ value }) => {
    insertAtCursor(value)
  }

  const navigateToColumns = (row) => {
    const { value } = row
    requestTablePreview(value)
    setCurrentTableName(value)
    setShowTables(false)
    setShowColumns(true)
    setSelectedRow(row)
  }

  const navigateToTables = () => {
    setShowColumns(false)
    setShowTables(true)
    setSelectedRow(null)
  }

  useEffect(() => {
    requestTables()
  }, [requestTables])

  return (
    <div className="table-browser">
      <div
        className={cx("table-browser__tables", {
          "is-shown": showTables,
          "is-loading": tablesLoading
        })}
      >
        {tablesLoading ? (
          <CircularProgress size="large" />
        ) : (
          <SqlEditorTableSelector
            tableData={tables}
            onSelectRow={navigateToColumns}
            exportRowValue={exportRowValue}
          />
        )}
      </div>
      <div
        className={cx("table-browser__columns", {
          "is-shown": showColumns
        })}
      >
        <header
          className="table-browser__current-table insert-action-row"
          onClick={navigateToTables}
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
              exportRowValue({
                value: currentTableName
              })
            }}
          />
          <span className="table-browser__current-table__name">
            <Icon
              className="table-browser__current-table__back"
              icon="keyboard_arrow_left"
            />
            {currentTableName}
          </span>
        </header>
        <DataColumnSelector
          searchFieldLabel="Find a column"
          loading={columnsLoading}
          data={columns}
          onSelectRow={setSelectedRow}
          activeRow={selectedRow}
          rowIconOptions={{
            icon: "input",
            title: "Copy To SQL Input Box",
            style: {
              // Material's insert icon points right and there's no left-pointing
              // option, so flipping it with CSS
              transform: "scaleX(-1)"
            },
            action: exportRowValue
          }}
        />
      </div>
    </div>
  )
}

export default connector(SqlEditorTablesBrowser)
