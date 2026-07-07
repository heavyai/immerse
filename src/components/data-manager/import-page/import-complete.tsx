// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  trackS3Import,
  trackSourceImport
} from "actions/importer-action-creators"
import { AppState } from "vega/charts/types"
import { ConnectorType } from "../constants"
import ExistingTablePreview from "../existing-table-preview"
import ImportTablePreviewHeader from "../import-table-preview-header/import-table-preview-header"
import { useImportTableName } from "../hooks/use-import-table-name"
import { useConnectorType } from "../hooks/use-importer-state"

import "../table-preview.scss"

const ImportComplete: FC = () => {
  const { tablePreview, importer } = useSelector((state: AppState) => state)

  const fields = Object.values(tablePreview.fields)

  const type = useConnectorType()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!importer.importComplete) {
      return
    }
    if (type === ConnectorType.S3Import) {
      dispatch(trackS3Import(fields.length, tablePreview.rowCount))
    } else {
      dispatch(trackSourceImport(fields.length, tablePreview.rowCount))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="table-importer-container">
      <div className="table-importer">
        <ImportTablePreviewHeader cancelText="Back" />
        <ExistingTablePreview
          tableName={useImportTableName()}
          wasImported
          showComments
        />
      </div>
    </div>
  )
}

export default ImportComplete
