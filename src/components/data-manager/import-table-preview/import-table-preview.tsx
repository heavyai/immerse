// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { useParams } from "react-router"
import { useSelector } from "react-redux"
import TableImporterPreview from "components/table-importer/table-importer-preview-parent"
import ImportProgress from "components/table-importer/import-progress-parent"
import { hasGeoColumns } from "components/table-importer/table-importer-helpers"
import ImportSettingsModal from "components/table-importer/import-settings-modal"
import { ImporterState } from "reducers/importer-reducer"
import TablePreviewHeader from "../table-preview-header"
import { ConnectorType, IMPORT_ACTIONS } from "../constants"
import { buildTablePreviewMetrics } from "../table-preview-utils"
import ImportTablePreviewActionsHeader from "./import-table-preview-actions-header"
import ImportTablePreviewHeader from "../import-table-preview-header/import-table-preview-header"
import ImportConnectButton from "./import-connect-button"
import { useImportTableName } from "../hooks/use-import-table-name"
import { useIsAppend } from "../hooks/use-is-append"
import { useImporterState } from "../hooks/use-importer-state"
import { EditableTablePreviewHeader } from "../table-preview-header/editable-table-preview-header"

import "../table-preview.scss"

type ImportTablePreviewProps = {
  appendTableName: string | null
  tableName: string
  tableNameError: string
  updateTableName: (newName: string) => void
  requestImportPreviewData: () => undefined
  importerData: ImporterState["data"]
}

const ImportTablePreview: FC<ImportTablePreviewProps> = ({
  tableName,
  updateTableName,
  requestImportPreviewData,
  importerData
}) => {
  const params = useParams<{
    connect: string
    connectorType: ConnectorType
    dbName: string
    importAction: string
    tableName?: string
  }>()
  const appendTableName = useIsAppend() ? params.tableName : null
  const { loading, currentFileUploading } = useImporterState()
  const tableComment = useSelector(
    (state) => state.tablePreview?.tableDetails?.comment
  )
  const importerLoading = loading || currentFileUploading !== null

  const PreviewHeader =
    params.importAction === IMPORT_ACTIONS.CREATE
      ? EditableTablePreviewHeader
      : TablePreviewHeader

  return (
    <div className="table-importer-container">
      <div className="table-importer">
        <ImportTablePreviewHeader cancelText="Cancel" />
        <>
          <PreviewHeader
            tableName={useImportTableName()}
            updateTableName={updateTableName}
            metrics={buildTablePreviewMetrics({
              columns: importerData?.row_set?.row_desc?.length
            })}
            tableComment={useIsAppend() ? tableComment : undefined}
          />
          <ImportTablePreviewActionsHeader
            {...{
              tableName,
              disableActions: importerLoading,
              isFsiConnectedSource: Boolean(params.connect)
            }}
          />
          <div className="import-body-container">
            <TableImporterPreview
              appendTableName={appendTableName}
              requestImportPreviewData={requestImportPreviewData}
            />
            {importerLoading && <ImportProgress />}
          </div>
          <footer>
            <ImportConnectButton />
          </footer>
        </>

        <ImportSettingsModal
          requestImportPreviewData={requestImportPreviewData}
          shouldShowGeoImportOptions={hasGeoColumns(importerData)}
        />
      </div>
    </div>
  )
}

export default ImportTablePreview
