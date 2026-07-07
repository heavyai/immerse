// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useParams } from "react-router"
import { useDispatch } from "react-redux"
import { PrimaryButton } from "widgets/button/Button"
import { areAnyColumnsNotValid } from "components/table-importer/table-importer-helpers"
import {
  connectTable,
  createNewTableAndImportData,
  importData
} from "actions/importer-action-creators"
import { useIsAppend } from "../hooks/use-is-append"
import { useImporterState } from "../hooks/use-importer-state"
import { useTableNameError } from "../hooks/use-table-name-error"
import { useImportTableName } from "../hooks/use-import-table-name"

const ImportConnectButton = () => {
  const tableNameError = useTableNameError(useImportTableName())
  const importer = useImporterState()
  const params = useParams<{
    connect: string
    importAction: string
    tableName?: string
  }>()

  const dispatch = useDispatch()
  const isAppend = useIsAppend()

  const doImport = async () => {
    if (isAppend) {
      await dispatch(importData(params.tableName as string))
    } else {
      await dispatch(createNewTableAndImportData())
    }
  }

  const handleSubmit = async () => {
    if (areAnyColumnsNotValid(importer.data?.row_set?.row_desc)) {
      return
    }

    if (params.connect) {
      await dispatch(connectTable())
    } else {
      await doImport()
    }
  }

  return (
    <PrimaryButton
      {...{
        disabled: Boolean(tableNameError || importer.error || importer.loading),
        label: params.connect ? "Connect" : "Import",
        onClick: handleSubmit
      }}
    />
  )
}

export default ImportConnectButton
