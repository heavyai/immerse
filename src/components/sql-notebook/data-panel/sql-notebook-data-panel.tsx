// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import cx from "classnames"
import { createSelector } from "reselect"
import { getDataSourcePreview } from "actions/table-preview-action-creators"
import SqlEditorTableSelector from "./table-selector"
import { AppState, TableRowDescription } from "vega/charts/types"
import { TablesBrowserRow } from "../types"
import { TablesBrowserCurrentTableHeader } from "./tables-browser-current-table-header"
import BrowserSnippetsPane from "./browser-snippets-pane"

import { IconCopyArrow } from "components/svg-icons/icon-copy-arrow"
import { TableItem } from "./list-item-with-actions"
import { ColumnBrowser } from "components/column-browser/column-browser"
import { noop } from "lodash"
import { ColumnMetadata } from "constants/prop-types"
import LoadingWidget from "components/app-overlay/loading-widget"
import { DataPreviewTrigger } from "./data-preview-trigger"
import { isStringType } from "constants/data-types"

import "./sql-notebook-data-panel.scss"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import { IItemAction } from "./row-action"
import { Column } from "react-virtualized"

// List of tables
export const SqlNotebookDataPanel = ({
  insertAtCursor,
  hasActiveEditor
}: {
  insertAtCursor: (value: string) => void
  hasActiveEditor: boolean
}) => {
  const [currentTableName, setCurrentTableName] = useState("")
  // selectedRow can be either a table or column
  const [selectedRow, setSelectedRow] = useState<TablesBrowserRow | null>(null)

  const dispatch = useDispatch()

  // Fetch fields for selected table
  const requestTablePreview = (tableName: string) =>
    dispatch(getDataSourcePreview(tableName))

  // Memoized selector
  const tableSelector = (state: AppState) => state.tablesReference.list
  const tableDataSelector = createSelector([tableSelector], (tables) =>
    tables.map(({ name, ...rest }) => ({
      ...rest,
      value: name,
      label: name
    }))
  )

  const tableNameSelector = (state: AppState) => state.tablePreview.tableName

  const tablePreviewSelector = (state: AppState) => state.tablePreview
  const tableDetailsSelector = createSelector(
    tablePreviewSelector,
    (tablePreview) => {
      return {
        // Contains comment
        tableDetails: tablePreview.tableDetails,

        // label: "rows",
        // value: 180953629
        rowCount: tablePreview.rowCount
      }
    }
  )

  const fieldsSelector = (state: AppState) => state.tablePreview.fields
  const fieldsDetailSelector = (state: AppState) =>
    state.tablePreview?.tableDetails?.row_desc

  const columnsSelector = createSelector(
    [tableNameSelector, fieldsSelector, fieldsDetailSelector],
    (tn, fields, fieldsDetails = []) =>
      Object.values(fields).map((field: object) => {
        const details =
          fieldsDetails.find(
            (fd: TableRowDescription) => fd.col_name === field.name
          ) ?? {}
        return {
          ...field,
          ...details,
          table: tn,
          value: field.name
        }
      })
  )
  const tableDetails = useSelector(tableDetailsSelector)
  const tableDataFormatted = useSelector(tableDataSelector)
  const columnsFormatted = useSelector(columnsSelector)

  const columnsLoading = useSelector(
    (state: AppState) => state.tablePreview.loading
  )

  const tablesLoading = useSelector(
    (state: AppState) => state.tablesReference.loading
  )

  const exportRowValue = useCallback(
    ({ value }: TablesBrowserRow) => {
      insertAtCursor(value)
    },
    [insertAtCursor]
  )

  const navigateToColumns = (row: TablesBrowserRow) => {
    const { value } = row
    requestTablePreview(value)
    setCurrentTableName(value)
    setSelectedRow(row)
  }

  const navigateToTables = () => {
    setSelectedRow(null)
    setCurrentTableName("")
  }

  const columnRowActions = useMemo(() => {
    const isNonEncodedString = (item: ColumnMetadata) =>
      isStringType(item?.type) && !item?.is_dict
    const actions: Array<IItemAction<Column>> = [
      {
        Icon: IconCopyArrow,
        title: "Copy To SQL Input Box",
        onClick: exportRowValue,
        isDisabled: () => !hasActiveEditor,
        disabledTooltip: "Focus on SQL Editor to copy"
      }
    ]
    if (getFeatureFlag(available_feature_flags.ENABLE_COLUMN_DATA_PREVIEW)) {
      actions.unshift({
        Icon: ({ item }: { item: ColumnMetadata }) => {
          return (
            <DataPreviewTrigger
              disabled={isNonEncodedString(item)}
              disabledTooltip={
                isNonEncodedString(item)
                  ? "Column preview not available for non-encoded string columns"
                  : null
              }
              item={item}
            />
          )
        },
        // Disabling in both places (DataPreviewTrigger + here) so disabled row action styles apply
        title: "Column Data Preview",
        isDisabled: (item: ColumnMetadata) => isNonEncodedString(item),
        onClick: noop // DataPreviewTrigger handles click itself
      })
    }
    return actions
  }, [exportRowValue, hasActiveEditor])

  const tableRowActions = useMemo(() => {
    return [
      {
        Icon: IconCopyArrow,
        isDisabled: () => {
          return !hasActiveEditor
        },
        title: hasActiveEditor ? "Copy to SQL Editor" : "",
        onClick: (row: TableItem) => {
          exportRowValue(row)
        },
        disabledTooltip: "Focus on SQL Editor to copy"
      }
    ]
  }, [exportRowValue, hasActiveEditor])

  return (
    <div className="sql-notebook__data-panel">
      <div
        className={cx("sql-notebook__table-browser", {
          "show-columns": Boolean(currentTableName)
        })}
      >
        <div className="sql-notebook__table-browser__tables">
          {tablesLoading ? (
            <LoadingWidget />
          ) : (
            <SqlEditorTableSelector
              tableData={tableDataFormatted}
              onSelectRow={navigateToColumns}
              rowActions={tableRowActions}
            />
          )}
        </div>
        <div className="sql-notebook__table-browser__columns">
          <TablesBrowserCurrentTableHeader
            loading={columnsLoading}
            tableName={currentTableName}
            navigateToTables={navigateToTables}
            tableDetails={tableDetails}
            rowActions={tableRowActions}
          />
          {selectedRow && (
            <ColumnBrowser
              loading={columnsLoading}
              data={columnsLoading ? [] : columnsFormatted}
              onSelectRow={hasActiveEditor ? setSelectedRow : undefined}
              activeRow={hasActiveEditor ? selectedRow : undefined}
              rowsSelectable={hasActiveEditor}
              rowActions={columnRowActions}
            />
          )}
          {selectedRow && hasActiveEditor && (
            <BrowserSnippetsPane
              {...{ selectedRow, setSelectedRow, insertAtCursor }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
