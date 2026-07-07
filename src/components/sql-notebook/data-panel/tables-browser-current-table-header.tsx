// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Icon } from "@rmwc/icon"
import React from "react"

import "./tables-browser-current-table-header.scss"
import d3 from "services/d3"
import { IItemAction, RowAction } from "./row-action"
import { TableItem } from "./list-item-with-actions"
import { TableDetails } from "vega/charts/types"

export const TablesBrowserCurrentTableHeader = ({
  tableName,
  navigateToTables,
  tableDetails,
  rowActions,
  loading
}: {
  tableName: string
  navigateToTables: () => void
  tableDetails: {
    rowCount: {
      label: string
      value: number
    }
    tableDetails: TableDetails
  }
  rowActions: Array<IItemAction<TableItem>>
  loading: boolean
}) => {
  const formatFn = d3.format(",")
  return (
    <header className="sql-notebook__table-browser__current-table">
      <div className="table-browser__actions-left" onClick={navigateToTables}>
        <div className="table-browser__current-table__back">
          <Icon icon="keyboard_arrow_left" />
        </div>
        <div className="table-browser__current-table__details">
          <div
            className="table-browser__current-table__title"
            title={tableName}
          >
            {tableName}
          </div>
          <div>
            {loading
              ? "Loading..."
              : `${formatFn(tableDetails.rowCount?.value)} Rows •
            ${formatFn(tableDetails.tableDetails?.columns?.length)} Columns`}
          </div>
          <div title={tableDetails.tableDetails?.comment}>
            {loading
              ? "Loading comment..."
              : tableDetails.tableDetails?.comment ??
                "No table comment available"}
          </div>
        </div>
      </div>
      <div className="table-browser__actions">
        {rowActions.map((action, i) => {
          const item = { value: tableName, label: tableName }
          return <RowAction<TableItem> item={item} action={action} key={i} />
        })}
      </div>
    </header>
  )
}
