// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TextField } from "@rmwc/textfield"
import { Tooltip } from "@rmwc/tooltip"
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import { getDataSourcesList } from "../../../actions/tables-get-datasources-list"
import { useTableNameError } from "../hooks/use-table-name-error"

const EditableTableName = ({
  tableName,
  updateTableName
}: {
  tableName: string
  updateTableName: (newName: string) => void
}) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getDataSourcesList())
  }, [dispatch])

  const onNameChange = (newName: string) => {
    updateTableName(newName)
  }

  const tableNameError = useTableNameError(tableName)

  return (
    <Tooltip open={Boolean(tableNameError)} content={tableNameError}>
      <TextField
        label="Dataset Name*"
        value={tableName}
        onChange={(e) => onNameChange(e.target.value)}
        outlined={false}
        invalid={Boolean(tableNameError)}
        data-testid="table-preview-header-name-input"
      />
    </Tooltip>
  )
}

export default EditableTableName
