// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { TextField } from "@rmwc/textfield"
import { updateTableComment } from "actions/importer-action-creators"
import { Metric } from "./table-metric"
import TableMetrics from "./table-metrics"
import EditableTableName from "./editable-table-name"
import "./styles.scss"

// Editable table preview header used when importing a new table
export const EditableTablePreviewHeader = ({
  tableName = "",
  metrics = [],
  updateTableName
}: {
  metrics: Metric[]
  tableName?: string
  updateTableName: (newName: string) => void
}) => {
  const dispatch = useDispatch()
  const tableComment = useSelector((state) => state.importer.tableComment)
  return (
    <div className="table-preview-header table-preview-header--editable">
      <div className="table-preview-header__left">
        <EditableTableName
          tableName={tableName}
          updateTableName={updateTableName}
        />

        <TextField
          label="Table Comment"
          value={tableComment}
          onChange={(e) => {
            dispatch(updateTableComment(e.target.value))
          }}
          outlined={false}
          data-testid="table-preview-header-comment-input"
          className="table-preview-header__comment-input"
        />
      </div>
      <TableMetrics metrics={metrics} />
    </div>
  )
}
