// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"
import IconJoinLeft from "components/svg-icons/icon-join-left"
import TableMetrics from "./table-metrics"
import { Metric } from "./table-metric"
import { TableComment } from "./table-comment"

import "./styles.scss"

const TablePreviewHeader = ({
  tableName = "",
  metrics = [],
  tableComment
}: {
  metrics: Metric[]
  tableName?: string
  updateTableName: (newName: string) => void
  tableComment?: string
}) => {
  const joinDataSource = useJoinFromParameter(tableName)
  const tableDisplayName = joinDataSource ? joinDataSource.name : tableName
  return (
    <div className="table-preview-header">
      <div className="table-preview-header__left">
        <div className="table-name" data-testid="table-info-name">
          {joinDataSource && (
            <div className="table-type-icon">
              <IconJoinLeft />
            </div>
          )}
          {tableDisplayName}
        </div>
        <TableComment comment={tableComment} />
      </div>
      <TableMetrics metrics={metrics} />
    </div>
  )
}

export default TablePreviewHeader
